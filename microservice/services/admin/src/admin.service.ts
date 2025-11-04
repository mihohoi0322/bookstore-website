import {
  NotFoundError,
  PublicationStatusRequest,
  UpsertBookRequest,
  bookSchema,
  publicationStatusRequestSchema,
  upsertBookRequestSchema
} from '@bookstore/shared';
import {
  createBook,
  deleteBook,
  findBookById,
  updateBook,
  updatePublicationStatus
} from '@bookstore/shared';

export async function createCatalogBook(payload: UpsertBookRequest) {
  const parsed = upsertBookRequestSchema.parse(payload);
  const book = await createBook(parsed);
  return bookSchema.parse(book);
}

export async function getCatalogBook(bookId: string) {
  const book = await findBookById(bookId);
  if (!book) {
    throw new NotFoundError(`Book ${bookId} not found`);
  }
  return bookSchema.parse(book);
}

export async function updateCatalogBook(bookId: string, payload: UpsertBookRequest) {
  const parsed = upsertBookRequestSchema.parse(payload);
  const book = await updateBook(bookId, parsed);
  if (!book) {
    throw new NotFoundError(`Book ${bookId} not found`);
  }
  return bookSchema.parse(book);
}

export async function removeCatalogBook(bookId: string) {
  const deleted = await deleteBook(bookId);
  if (!deleted) {
    throw new NotFoundError(`Book ${bookId} not found`);
  }
}

export async function changePublicationStatus(bookId: string, payload: PublicationStatusRequest) {
  const parsed = publicationStatusRequestSchema.parse(payload);
  const book = await updatePublicationStatus(bookId, parsed.status);
  if (!book) {
    throw new NotFoundError(`Book ${bookId} not found`);
  }
  return bookSchema.parse(book);
}
