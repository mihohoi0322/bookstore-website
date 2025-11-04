import Fastify from 'fastify';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import {
  NotFoundError,
  cartItemRequestSchema,
  cartUpdateRequestSchema
} from '@bookstore/shared';
import {
  addItem,
  clearCart,
  getCart,
  removeItem,
  replaceCart,
  updateItemQuantity
} from './cart.service.js';

loadEnv();

const userParamsSchema = z.object({
  userId: z.string()
});

const itemParamsSchema = userParamsSchema.extend({
  bookId: z.string()
});

export async function buildServer() {
  const server = Fastify({
    logger: true
  });

  server.setErrorHandler((error, request, reply) => {
    if (error instanceof NotFoundError) {
      request.log.warn({ err: error }, 'resource not found');
      return reply.status(404).send({ code: 'NOT_FOUND', message: error.message });
    }

    if (error instanceof z.ZodError) {
      request.log.warn({ err: error }, 'validation error');
      return reply.status(400).send({ code: 'BAD_REQUEST', message: 'Invalid payload', details: error.issues });
    }

    request.log.error({ err: error }, 'unexpected error');
    return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Unexpected error' });
  });

  server.get('/healthz', async () => ({ status: 'ok' }));

  server.get('/cart/carts/:userId', async (request, reply) => {
    const { userId } = userParamsSchema.parse(request.params ?? {});
    const cart = await getCart(userId);
    return reply.send({ data: cart });
  });

  server.put('/cart/carts/:userId', async (request, reply) => {
    const { userId } = userParamsSchema.parse(request.params ?? {});
    const body = cartUpdateRequestSchema.parse(request.body ?? {});
    const cart = await replaceCart(userId, body);
    return reply.send({ data: cart });
  });

  server.post('/cart/carts/:userId/items', async (request, reply) => {
    const { userId } = userParamsSchema.parse(request.params ?? {});
    const body = cartItemRequestSchema.parse(request.body ?? {});
    const cart = await addItem(userId, body);
    return reply.code(201).send({ data: cart });
  });

  server.patch('/cart/carts/:userId/items/:bookId', async (request, reply) => {
    const { userId, bookId } = itemParamsSchema.parse(request.params ?? {});
    const body = z
      .object({
        quantity: z.number().int().min(1)
      })
      .parse(request.body ?? {});

    const cart = await updateItemQuantity(userId, bookId, body.quantity);
    return reply.send({ data: cart });
  });

  server.delete('/cart/carts/:userId', async (request, reply) => {
    const { userId } = userParamsSchema.parse(request.params ?? {});
    await clearCart(userId);
    return reply.status(204).send();
  });

  server.delete('/cart/carts/:userId/items/:bookId', async (request, reply) => {
    const { userId, bookId } = itemParamsSchema.parse(request.params ?? {});
    await removeItem(userId, bookId);
    return reply.status(204).send();
  });

  return server;
}

async function bootstrap() {
  const server = await buildServer();
  const port = Number(process.env.PORT ?? '4102');
  await server.listen({ port, host: '0.0.0.0' });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
