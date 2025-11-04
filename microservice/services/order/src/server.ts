import Fastify from 'fastify';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import {
  NotFoundError,
  createOrderRequestSchema,
  orderStatusChangeSchema
} from '@bookstore/shared';
import { createOrder, getOrder, updateOrderStatus } from './order.service.js';

loadEnv();

const orderParamsSchema = z.object({
  orderId: z.string()
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
      return reply.status(400).send({ code: 'BAD_REQUEST', message: 'Invalid payload', details: error.errors });
    }

    request.log.error({ err: error }, 'unexpected error');
    return reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Unexpected error' });
  });

  server.get('/healthz', async () => ({ status: 'ok' }));

  server.post('/order/orders', async (request, reply) => {
    const payload = createOrderRequestSchema.parse(request.body ?? {});
    const order = await createOrder(payload);
    return reply.code(201).send({ data: order });
  });

  server.get('/order/orders/:orderId', async (request, reply) => {
    const { orderId } = orderParamsSchema.parse(request.params ?? {});
    const order = await getOrder(orderId);

    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }

    return reply.send({ data: order });
  });

  server.patch('/order/orders/:orderId/status', async (request, reply) => {
    const { orderId } = orderParamsSchema.parse(request.params ?? {});
    const payload = orderStatusChangeSchema.parse(request.body ?? {});
    const order = await updateOrderStatus(orderId, payload);
    return reply.send({ data: order });
  });

  return server;
}

async function bootstrap() {
  const server = await buildServer();
  const port = Number(process.env.PORT ?? '4103');
  await server.listen({ port, host: '0.0.0.0' });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
