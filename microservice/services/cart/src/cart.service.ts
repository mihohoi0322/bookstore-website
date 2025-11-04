import {
  Cart,
  CartItemRequest,
  CartUpdateRequest,
  NotFoundError,
  cartItemRequestSchema,
  cartUpdateRequestSchema
} from '@bookstore/shared';
import { deleteState, getState, saveState } from '@bookstore/shared';
import { fetchBookById } from '@bookstore/shared';

const STORE_NAME = process.env.CART_STATE_STORE ?? 'cartstore';

interface StoredCart {
  userId: string;
  items: CartItemRequest[];
  updatedAt: string;
}

function stateKey(userId: string) {
  return `cart:${userId}`;
}

function getTimestamp() {
  return new Date().toISOString();
}

async function loadStoredCart(userId: string): Promise<StoredCart> {
  const state = await getState<StoredCart>(STORE_NAME, stateKey(userId));
  if (state) {
    return state;
  }

  const emptyCart: StoredCart = {
    userId,
    items: [],
    updatedAt: getTimestamp()
  };

  await saveState(STORE_NAME, stateKey(userId), emptyCart);
  return emptyCart;
}

async function persist(cart: StoredCart) {
  await saveState(STORE_NAME, stateKey(cart.userId), cart);
}

async function enrich(cart: StoredCart): Promise<Cart> {
  const items = await Promise.all(
    cart.items.map(async (item) => {
      const book = await fetchBookById(item.bookId);
      if (!book) {
        throw new NotFoundError(`Book ${item.bookId} not found`);
      }

      return {
        bookId: item.bookId,
        quantity: item.quantity,
        unitPrice: book.price
      };
    })
  );

  const totalAmount = items.reduce((sum, entry) => sum + (entry.unitPrice ?? 0) * entry.quantity, 0);

  return {
    userId: cart.userId,
    items,
    totalAmount,
    updatedAt: cart.updatedAt
  };
}

export async function getCart(userId: string): Promise<Cart> {
  const cart = await loadStoredCart(userId);
  return enrich(cart);
}

export async function replaceCart(userId: string, payload: CartUpdateRequest): Promise<Cart> {
  const parsed = cartUpdateRequestSchema.parse(payload);
  const cart = await loadStoredCart(userId);
  cart.items = parsed.items;
  cart.updatedAt = getTimestamp();
  await persist(cart);
  return enrich(cart);
}

export async function addItem(userId: string, payload: CartItemRequest): Promise<Cart> {
  const parsed = cartItemRequestSchema.parse(payload);
  const cart = await loadStoredCart(userId);
  const existing = cart.items.find((item) => item.bookId === parsed.bookId);

  if (existing) {
    existing.quantity += parsed.quantity;
  } else {
    cart.items.push(parsed);
  }

  cart.updatedAt = getTimestamp();
  await persist(cart);
  return enrich(cart);
}

export async function updateItemQuantity(
  userId: string,
  bookId: string,
  quantity: number
): Promise<Cart> {
  const cart = await loadStoredCart(userId);
  const item = cart.items.find((entry) => entry.bookId === bookId);
  if (!item) {
    throw new NotFoundError(`Cart item ${bookId} not found`);
  }

  item.quantity = quantity;
  cart.updatedAt = getTimestamp();
  await persist(cart);
  return enrich(cart);
}

export async function removeItem(userId: string, bookId: string): Promise<void> {
  const cart = await loadStoredCart(userId);
  const initialLength = cart.items.length;
  cart.items = cart.items.filter((entry) => entry.bookId !== bookId);
  cart.updatedAt = getTimestamp();

  if (cart.items.length === initialLength) {
    throw new NotFoundError(`Cart item ${bookId} not found`);
  }

  await persist(cart);
}

export async function clearCart(userId: string): Promise<void> {
  await deleteState(STORE_NAME, stateKey(userId));
}
