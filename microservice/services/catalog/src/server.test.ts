import { beforeEach, describe, expect, it } from 'vitest';
import { buildServer } from './server.js';
import { resetCatalogCache, saveState, seedBooks } from '@bookstore/shared';

const STORE_NAME = process.env.CATALOG_STATE_STORE ?? 'catalogstore';
const STATE_KEY = 'catalog:books';

describe('Catalog Service', () => {
  beforeEach(async () => {
    process.env.USE_IN_MEMORY_DAPR = 'true';
    resetCatalogCache();
    await saveState(STORE_NAME, STATE_KEY, seedBooks);
  });

  it('lists books with metadata', async () => {
    const server = await buildServer();
    const response = await server.inject({
      method: 'GET',
      url: '/catalog/books'
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: unknown[]; total: number };
    expect(body.total).toBe(seedBooks.length);
    expect(body.data[0]).toHaveProperty('title');
  });

  it('filters by status', async () => {
    const server = await buildServer();
    const response = await server.inject({
      method: 'GET',
      url: '/catalog/books?status=available'
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: Array<{ status: string }>; total: number };
    expect(body.data.every((book) => book.status === 'available')).toBe(true);
  });

  it('returns 404 when book is not found', async () => {
    const server = await buildServer();
    const response = await server.inject({
      method: 'GET',
      url: '/catalog/books/unknown'
    });

    expect(response.statusCode).toBe(404);
  });
});
