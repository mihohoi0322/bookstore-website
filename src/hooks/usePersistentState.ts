import { useCallback, useEffect, useRef, useState } from 'react';

type StateUpdater<T> = T | ((previous: T) => T);

const isBrowser = () => typeof window !== 'undefined';
const isDevEnvironment = () => {
  try {
    return typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE !== 'production';
  } catch {
    return false;
  }
};

const CHANNEL_EVENT_NAME = 'persistent-state-change';

type PersistentStateEventDetail = {
  key: string;
};

const emitChangeEvent = (key: string) => {
  if (!isBrowser()) {
    return;
  }

  const event = new CustomEvent<PersistentStateEventDetail>(CHANNEL_EVENT_NAME, {
    detail: { key }
  });
  window.dispatchEvent(event);
};

function parseValue<T>(rawValue: string | null, fallback: T): T {
  if (rawValue === null) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    if (isDevEnvironment()) {
      console.warn('Failed to parse value from localStorage. Falling back to default.', error);
    }
    return fallback;
  }
}

export function usePersistentState<T>(key: string, defaultValue: T) {
  const defaultRef = useRef(defaultValue);

  useEffect(() => {
    defaultRef.current = defaultValue;
  }, [defaultValue]);

  const readValue = useCallback((): T => {
    if (!isBrowser()) {
      return defaultRef.current;
    }

    const storedValue = window.localStorage.getItem(key);
    return parseValue<T>(storedValue, defaultRef.current);
  }, [key]);

  const [state, setState] = useState<T>(() => readValue());

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    if (window.localStorage.getItem(key) === null) {
      try {
        window.localStorage.setItem(key, JSON.stringify(defaultRef.current));
        emitChangeEvent(key);
      } catch (error) {
        if (isDevEnvironment()) {
          console.warn('Failed to write default value to localStorage.', error);
        }
      }
    }
  }, [key]);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) {
        return;
      }

      if (event.key === key) {
        setState(parseValue<T>(event.newValue, defaultRef.current));
      }
    };

    const handleChannel = (event: Event) => {
      const customEvent = event as CustomEvent<PersistentStateEventDetail>;
      if (customEvent.detail?.key !== key) {
        return;
      }

      setState(parseValue<T>(window.localStorage.getItem(key), defaultRef.current));
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CHANNEL_EVENT_NAME, handleChannel);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CHANNEL_EVENT_NAME, handleChannel);
    };
  }, [key]);

  const updateState = useCallback((value: StateUpdater<T>) => {
    setState((previousState) => {
      const resolvedValue = value instanceof Function ? value(previousState) : value;

      if (isBrowser()) {
        try {
          if (resolvedValue === undefined) {
            window.localStorage.removeItem(key);
            emitChangeEvent(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(resolvedValue));
            emitChangeEvent(key);
          }
        } catch (error) {
          if (isDevEnvironment()) {
            console.warn('Failed to persist value to localStorage.', error);
          }
        }
      }

      return resolvedValue;
    });
  }, [key]);

  return [state, updateState] as const;
}
