import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { findBookById, listBooks, salesStatusSchema } from '@bookstore/shared';

const listQuerySchema = z.object({
  tag: z.string().optional(),
  status: salesStatusSchema.optional(),
  q: z.string().optional()
});

const bookParamsSchema = z.object({
  bookId: z.string()
});

export async function registerCatalogRoutes(app: FastifyInstance) {
  app.get('/books', async (request, reply) => {
    const params = listQuerySchema.parse(request.query ?? {});
    const books = await listBooks(params);
    return reply.send({ data: books, total: books.length });
  });

  app.get('/books/:bookId', async (request, reply) => {
    const { bookId } = bookParamsSchema.parse(request.params ?? {});
    const book = await findBookById(bookId);

    if (!book) {
      return reply.code(404).send({ code: 'NOT_FOUND', message: 'Book not found' });
    }

    return reply.send({ data: book });
  });
}
