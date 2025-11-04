import { beforeEach, describe, expect, it } from 'vitest';
import { buildServer } from './server.js';
import { resetCatalogCache, saveState, seedBooks } from '@bookstore/shared';

const CATALOG_STORE_NAME = process.env.CATALOG_STATE_STORE ?? 'catalogstore';
const CATALOG_STATE_KEY = 'catalog:books';

describe('Admin Service', () => {
  beforeEach(async () => {
    process.env.USE_IN_MEMORY_DAPR = 'true';
    resetCatalogCache();
    await saveState(CATALOG_STORE_NAME, CATALOG_STATE_KEY, seedBooks);
  });

  it('creates and fetches a new book', async () => {
    const server = await buildServer();

    const createResponse = await server.inject({
      method: 'POST',
      url: '/admin/books',
      payload: {
        title: '新しい本',
        author: '著者A',
        description: '説明',
        fullDescription: '詳細説明',
        price: 1000,
        status: 'available',
        tags: ['tag'],
        publicationYear: 2025
      }
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json() as { data: { id: string } };

    const getResponse = await server.inject({
      method: 'GET',
      url: `/admin/books/${created.data.id}`
    });

    expect(getResponse.statusCode).toBe(200);
  });

  it('updates publication status', async () => {
    const server = await buildServer();

    const publishResponse = await server.inject({
      method: 'POST',
      url: '/admin/books/1/publish',
      payload: { status: 'published' }
    });

    expect(publishResponse.statusCode).toBe(200);
    const body = publishResponse.json() as { data: { publicationStatus: string } };
    expect(body.data.publicationStatus).toBe('published');
  });
});
