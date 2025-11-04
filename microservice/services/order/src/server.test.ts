import { beforeEach, describe, expect, it } from 'vitest';
import { buildServer } from './server.js';
import {
  resetCatalogCache,
  saveState,
  seedBooks,
  getPublishedEvents
} from '@bookstore/shared';

const CATALOG_STORE_NAME = process.env.CATALOG_STATE_STORE ?? 'catalogstore';
const CATALOG_STATE_KEY = 'catalog:books';
const PUBSUB_NAME = process.env.ORDER_PUBSUB_NAME ?? 'bookstore-pubsub';

describe('Order Service', () => {
  beforeEach(async () => {
    process.env.USE_IN_MEMORY_DAPR = 'true';
    resetCatalogCache();
    await saveState(CATALOG_STORE_NAME, CATALOG_STATE_KEY, seedBooks);
  });

  it('creates an order and publishes events', async () => {
    const server = await buildServer();
    const initialEvents = getPublishedEvents(PUBSUB_NAME).length;

    const createResponse = await server.inject({
      method: 'POST',
      url: '/order/orders',
      payload: {
        userId: 'user-1',
        paymentToken: 'tok_4242',
        shippingAddress: {
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          line1: '千代田1-1'
        },
        items: [
          {
            bookId: '1',
            quantity: 1
          }
        ]
      }
    });

    expect(createResponse.statusCode).toBe(201);
    const { data } = createResponse.json() as { data: { id: string; totalAmount: number } };
    expect(data.totalAmount).toBe(seedBooks[0].price);

    const events = getPublishedEvents(PUBSUB_NAME);
    expect(events.length).toBeGreaterThan(initialEvents);

    const getResponse = await server.inject({
      method: 'GET',
      url: `/order/orders/${data.id}`
    });

    expect(getResponse.statusCode).toBe(200);
  });

  it('updates order status', async () => {
    const server = await buildServer();

    const createResponse = await server.inject({
      method: 'POST',
      url: '/order/orders',
      payload: {
        userId: 'user-1',
        paymentToken: 'tok_4242',
        shippingAddress: {
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          line1: '千代田1-1'
        },
        items: [
          {
            bookId: '1',
            quantity: 1
          }
        ]
      }
    });

    const { data } = createResponse.json() as { data: { id: string } };

    const updateResponse = await server.inject({
      method: 'PATCH',
      url: `/order/orders/${data.id}/status`,
      payload: { status: 'processing' }
    });

    expect(updateResponse.statusCode).toBe(200);
    const body = updateResponse.json() as { data: { status: string } };
    expect(body.data.status).toBe('processing');
  });
});
