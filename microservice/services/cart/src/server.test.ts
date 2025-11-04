import { beforeEach, describe, expect, it } from 'vitest';
import { buildServer } from './server.js';
import {
  resetCatalogCache,
  saveState,
  seedBooks,
  deleteState
} from '@bookstore/shared';

const CATALOG_STORE_NAME = process.env.CATALOG_STATE_STORE ?? 'catalogstore';
const CATALOG_STATE_KEY = 'catalog:books';
const CART_STORE_NAME = process.env.CART_STATE_STORE ?? 'cartstore';

function cartKey(userId: string) {
  return `cart:${userId}`;
}

describe('Cart Service', () => {
  beforeEach(async () => {
    process.env.USE_IN_MEMORY_DAPR = 'true';
    resetCatalogCache();
    await saveState(CATALOG_STORE_NAME, CATALOG_STATE_KEY, seedBooks);
    await deleteState(CART_STORE_NAME, cartKey('user-1'));
  });

  it('creates and retrieves cart for user', async () => {
    const server = await buildServer();

    const createResponse = await server.inject({
      method: 'POST',
      url: '/cart/carts/user-1/items',
      payload: { bookId: '1', quantity: 2 }
    });

    expect(createResponse.statusCode).toBe(201);

    const fetchResponse = await server.inject({
      method: 'GET',
      url: '/cart/carts/user-1'
    });

    expect(fetchResponse.statusCode).toBe(200);
    const body = fetchResponse.json() as { data: { totalAmount: number; items: Array<{ quantity: number }> } };
    expect(body.data.items[0].quantity).toBe(2);
    expect(body.data.totalAmount).toBe(seedBooks[0].price * 2);
  });

  it('updates quantity for an item', async () => {
    const server = await buildServer();

    await server.inject({
      method: 'POST',
      url: '/cart/carts/user-1/items',
      payload: { bookId: '1', quantity: 1 }
    });

    const updateResponse = await server.inject({
      method: 'PATCH',
      url: '/cart/carts/user-1/items/1',
      payload: { quantity: 4 }
    });

    expect(updateResponse.statusCode).toBe(200);
    const body = updateResponse.json() as { data: { items: Array<{ quantity: number }> } };
    expect(body.data.items[0].quantity).toBe(4);
  });

  it('removes an item and clears cart', async () => {
    const server = await buildServer();

    await server.inject({
      method: 'POST',
      url: '/cart/carts/user-1/items',
      payload: { bookId: '1', quantity: 1 }
    });

    const removeResponse = await server.inject({
      method: 'DELETE',
      url: '/cart/carts/user-1/items/1'
    });

    expect(removeResponse.statusCode).toBe(204);

    const clearResponse = await server.inject({
      method: 'DELETE',
      url: '/cart/carts/user-1'
    });

    expect(clearResponse.statusCode).toBe(204);
  });
});
