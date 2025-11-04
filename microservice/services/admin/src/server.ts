import Fastify from 'fastify';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import {
  NotFoundError,
  PublicationStatusRequest,
  UpsertBookRequest,
  publicationStatusRequestSchema,
  upsertBookRequestSchema
} from '@bookstore/shared';
import {
  changePublicationStatus,
  createCatalogBook,
  getCatalogBook,
  removeCatalogBook,
  updateCatalogBook
} from './admin.service.js';

loadEnv();

const bookParamsSchema = z.object({
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

  server.post('/admin/books', async (request, reply) => {
    const payload = upsertBookRequestSchema.parse((request.body ?? {}) as UpsertBookRequest);
    const book = await createCatalogBook(payload);
    return reply.code(201).send({ data: book });
  });

  server.get('/admin/books/:bookId', async (request, reply) => {
    const { bookId } = bookParamsSchema.parse(request.params ?? {});
    const book = await getCatalogBook(bookId);
    return reply.send({ data: book });
  });

  server.put('/admin/books/:bookId', async (request, reply) => {
    const { bookId } = bookParamsSchema.parse(request.params ?? {});
    const payload = upsertBookRequestSchema.parse((request.body ?? {}) as UpsertBookRequest);
    const book = await updateCatalogBook(bookId, payload);
    return reply.send({ data: book });
  });

  server.delete('/admin/books/:bookId', async (request, reply) => {
    const { bookId } = bookParamsSchema.parse(request.params ?? {});
    await removeCatalogBook(bookId);
    return reply.status(204).send();
  });

  server.post('/admin/books/:bookId/publish', async (request, reply) => {
    const { bookId } = bookParamsSchema.parse(request.params ?? {});
    const payload = publicationStatusRequestSchema.parse((request.body ?? {}) as PublicationStatusRequest);
    const book = await changePublicationStatus(bookId, payload);
    return reply.send({ data: book });
  });

  return server;
}

async function bootstrap() {
  const server = await buildServer();
  const port = Number(process.env.PORT ?? '4104');
  await server.listen({ port, host: '0.0.0.0' });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
