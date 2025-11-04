import { randomUUID } from 'node:crypto';
import { Book, PublicationStatus, UpsertBookRequest } from './domain.js';
import { getState, saveState } from './dapr.js';
import { seedBooks } from './data.js';

const STORE_NAME = process.env.CATALOG_STATE_STORE ?? 'catalogstore';
const STATE_KEY = 'catalog:books';

let cache: Book[] | null = null;

function cloneBooks(source: Book[]): Book[] {
  return source.map((book) => ({ ...book }));
}

async function loadFromStore(): Promise<Book[]> {
  if (cache) {
    return cloneBooks(cache);
  }

  const stored = await getState<Book[]>(STORE_NAME, STATE_KEY);
  if (stored && stored.length > 0) {
    cache = cloneBooks(stored);
    return cloneBooks(stored);
  }

  cache = cloneBooks(seedBooks);
  await saveState(STORE_NAME, STATE_KEY, cache);
  return cloneBooks(cache);
}

async function persist(books: Book[]): Promise<void> {
  cache = cloneBooks(books);
  await saveState(STORE_NAME, STATE_KEY, cache);
}

export interface CatalogQueryOptions {
  tag?: string;
  status?: Book['status'];
  q?: string;
}

export async function listBooks(options: CatalogQueryOptions = {}): Promise<Book[]> {
  const books = await loadFromStore();
  const keyword = options.q?.trim().toLowerCase();

  return books.filter((book) => {
    const matchesTag = options.tag ? book.tags.includes(options.tag) : true;
    const matchesStatus = options.status ? book.status === options.status : true;
    const matchesKeyword = keyword
      ? [book.title, book.author, book.description, book.fullDescription]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      : true;

    return matchesTag && matchesStatus && matchesKeyword;
  });
}

export async function findBookById(bookId: string): Promise<Book | null> {
  const books = await loadFromStore();
  return books.find((book) => book.id === bookId) ?? null;
}

export async function createBook(payload: UpsertBookRequest): Promise<Book> {
  const books = await loadFromStore();
  const newBook: Book = {
    id: randomUUID(),
    publicationStatus: 'draft',
    ...payload
  };
  books.push(newBook);
  await persist(books);
  return newBook;
}

export async function updateBook(bookId: string, payload: UpsertBookRequest): Promise<Book | null> {
  const books = await loadFromStore();
  const index = books.findIndex((book) => book.id === bookId);
  if (index === -1) {
    return null;
  }

  const updated: Book = {
    ...books[index],
    ...payload
  };
  books[index] = updated;
  await persist(books);
  return updated;
}

export async function deleteBook(bookId: string): Promise<boolean> {
  const books = await loadFromStore();
  const next = books.filter((book) => book.id !== bookId);
  if (next.length === books.length) {
    return false;
  }
  await persist(next);
  return true;
}

export async function updatePublicationStatus(
  bookId: string,
  status: PublicationStatus
): Promise<Book | null> {
  const books = await loadFromStore();
  const index = books.findIndex((book) => book.id === bookId);
  if (index === -1) {
    return null;
  }

  books[index] = {
    ...books[index],
    publicationStatus: status
  };

  await persist(books);
  return books[index];
}

export async function ensureCatalogSeed(): Promise<void> {
  await loadFromStore();
}

export function resetCatalogCache(): void {
  cache = null;
}
