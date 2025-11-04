/* eslint-disable @typescript-eslint/no-explicit-any */
import { URLSearchParams } from 'node:url';

const DEFAULT_HTTP_HOST = process.env.DAPR_HTTP_HOST ?? 'http://127.0.0.1';
const DEFAULT_HTTP_PORT = process.env.DAPR_HTTP_PORT ?? '3500';
const BASE_URL = `${DEFAULT_HTTP_HOST}:${DEFAULT_HTTP_PORT}`;

const memoryState = new Map<string, Map<string, unknown>>();
const memoryPubsub = new Map<string, Array<{ topic: string; data: unknown; createdAt: string }>>();

export class DaprError extends Error {
  constructor(message: string, public readonly status?: number, public readonly cause?: unknown) {
    super(message);
  }
}

export class DaprUnavailableError extends DaprError {
  constructor(message = 'Dapr runtime is unavailable', cause?: unknown) {
    super(message, undefined, cause);
  }
}

function ensureStore(storeName: string) {
  if (!memoryState.has(storeName)) {
    memoryState.set(storeName, new Map());
  }

  return memoryState.get(storeName)!;
}

function rememberState(storeName: string, key: string, value: unknown) {
  ensureStore(storeName).set(key, structuredClone(value));
}

function forgetState(storeName: string, key: string) {
  ensureStore(storeName).delete(key);
}

function getRememberedState<T>(storeName: string, key: string): T | null {
  const value = ensureStore(storeName).get(key);
  return value === undefined ? null : (structuredClone(value) as T);
}

function isFetchNetworkError(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof Error && error.message.includes('fetch failed'));
}

async function executeRequest(path: string, init: RequestInit): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init.headers
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new DaprError(
      `Dapr request failed: ${response.status} ${response.statusText} ${text}`,
      response.status
    );
  }

  return response;
}

function resolveFallbackUrl(appId: string): string | undefined {
  const key = `DIRECT_SERVICE_URL_${appId.replace(/-/g, '_').toUpperCase()}`;
  return process.env[key];
}

export function isInMemoryMode(): boolean {
  return process.env.USE_IN_MEMORY_DAPR === 'true';
}

export async function getState<T>(storeName: string, key: string): Promise<T | null> {
  if (isInMemoryMode()) {
    return getRememberedState<T>(storeName, key);
  }

  try {
    const response = await executeRequest(`/v1.0/state/${storeName}/${encodeURIComponent(key)}`, {
      method: 'GET'
    });

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    if (!text) {
      return null;
    }

    const parsed = JSON.parse(text) as T;
    rememberState(storeName, key, parsed);
    return parsed;
  } catch (error) {
    if (isFetchNetworkError(error)) {
      return getRememberedState<T>(storeName, key);
    }
    throw error;
  }
}

export async function saveState<T>(storeName: string, key: string, value: T): Promise<void> {
  rememberState(storeName, key, value);

  if (isInMemoryMode()) {
    return;
  }

  try {
    await executeRequest(`/v1.0/state/${storeName}`, {
      method: 'POST',
      body: JSON.stringify([
        {
          key,
          value
        }
      ])
    });
  } catch (error) {
    if (isFetchNetworkError(error)) {
      return;
    }
    throw error;
  }
}

export async function deleteState(storeName: string, key: string): Promise<void> {
  forgetState(storeName, key);

  if (isInMemoryMode()) {
    return;
  }

  try {
    await executeRequest(`/v1.0/state/${storeName}/${encodeURIComponent(key)}`, {
      method: 'DELETE'
    });
  } catch (error) {
    if (isFetchNetworkError(error)) {
      return;
    }
    throw error;
  }
}

interface InvokeOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  fallbackUrl?: string;
}

export async function invokeService<T>(appId: string, method: string, options: InvokeOptions = {}): Promise<T> {
  const { method: httpMethod = 'GET', headers = {}, data, query, fallbackUrl } = options;
  const path = method.startsWith('/') ? method.slice(1) : method;
  const search = query
    ? (() => {
        const pairs: Array<[string, string]> = Object.entries(query)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)] as [string, string]);
        return pairs.length > 0 ? `?${new URLSearchParams(pairs).toString()}` : '';
      })()
    : '';

  if (!isInMemoryMode()) {
    try {
      const response = await executeRequest(`/v1.0/invoke/${appId}/method/${path}${search}`, {
        method: httpMethod,
        body: data !== undefined ? JSON.stringify(data) : undefined,
        headers
      });

      if (response.status === 204) {
        return undefined as T;
      }

      const text = await response.text();
      return text ? (JSON.parse(text) as T) : (undefined as T);
    } catch (error) {
      if (!isFetchNetworkError(error)) {
        throw error;
      }
    }
  }

  const directBase = fallbackUrl ?? resolveFallbackUrl(appId);
  if (!directBase) {
    throw new DaprUnavailableError(`No fallback URL configured for appId "${appId}"`);
  }

  const directResponse = await fetch(`${directBase.replace(/\/$/, '')}/${path}${search}`, {
    method: httpMethod,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: data !== undefined ? JSON.stringify(data) : undefined
  });

  if (!directResponse.ok) {
    const text = await directResponse.text();
    throw new DaprError(
      `Direct service call failed: ${directResponse.status} ${directResponse.statusText} ${text}`,
      directResponse.status
    );
  }

  if (directResponse.status === 204) {
    return undefined as T;
  }

  const text = await directResponse.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function publishEvent(pubsubName: string, topic: string, data: unknown): Promise<void> {
  const entry = { topic, data: structuredClone(data), createdAt: new Date().toISOString() };
  if (!memoryPubsub.has(pubsubName)) {
    memoryPubsub.set(pubsubName, []);
  }
  memoryPubsub.get(pubsubName)!.push(entry);

  if (isInMemoryMode()) {
    return;
  }

  try {
    await executeRequest(`/v1.0/publish/${pubsubName}/${topic}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error) {
    if (isFetchNetworkError(error)) {
      return;
    }
    throw error;
  }
}

export function getPublishedEvents(pubsubName: string) {
  return memoryPubsub.get(pubsubName) ?? [];
}
