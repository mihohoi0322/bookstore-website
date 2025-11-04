import { Book, bookSchema } from './domain.js';
import { DaprError, invokeService, isInMemoryMode } from './dapr.js';
import { findBookById } from './catalogStore.js';

const DEFAULT_SERVICE_URL = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:4101';
const CATALOG_APP_ID = process.env.CATALOG_APP_ID ?? 'catalog-service';

interface CatalogResponse<T> {
  data: T;
}

export async function fetchBookById(bookId: string): Promise<Book | null> {
  const path = `catalog/books/${bookId}`;

  if (isInMemoryMode()) {
    const book = await findBookById(bookId);
    return book;
  }

  try {
    const response = await invokeService<CatalogResponse<unknown>>(CATALOG_APP_ID, path, {
      method: 'GET',
      fallbackUrl: DEFAULT_SERVICE_URL
    });
    return bookSchema.parse(response.data);
  } catch (error) {
    if (error instanceof DaprError && error.status === 404) {
      return null;
    }

    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }

    throw error;
  }
}
