import { randomUUID } from 'node:crypto';
import {
  CreateOrderRequest,
  NotFoundError,
  Order,
  OrderStatus,
  OrderStatusChangeRequest,
  createOrderRequestSchema,
  orderStatusChangeSchema
} from '@bookstore/shared';
import { fetchBookById } from '@bookstore/shared';
import { deleteState, getState, publishEvent, saveState } from '@bookstore/shared';

const STORE_NAME = process.env.ORDER_STATE_STORE ?? 'orderstore';
const PUBSUB_NAME = process.env.ORDER_PUBSUB_NAME ?? 'bookstore-pubsub';

function stateKey(orderId: string) {
  return `order:${orderId}`;
}

function selectPaymentMethod(input: CreateOrderRequest): Order['payment'] {
  const last4 = input.paymentToken.slice(-4).padStart(4, '0');
  return {
    method: 'credit_card',
    status: 'authorized',
    cardLast4: last4
  };
}

async function enrichItems(input: CreateOrderRequest['items']) {
  const items = await Promise.all(
    input.map(async (item) => {
      const book = await fetchBookById(item.bookId);
      if (!book) {
        throw new NotFoundError(`Book ${item.bookId} not found`);
      }

      return {
        bookId: book.id,
        quantity: item.quantity,
        unitPrice: book.price
      };
    })
  );

  const totalAmount = items.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0);
  return { items, totalAmount };
}

export async function createOrder(payload: CreateOrderRequest): Promise<Order> {
  const parsed = createOrderRequestSchema.parse(payload);
  const { items, totalAmount } = await enrichItems(parsed.items);
  const order: Order = {
    id: randomUUID(),
    userId: parsed.userId,
    items,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
    payment: selectPaymentMethod(parsed),
    shippingAddress: parsed.shippingAddress,
    memo: parsed.memo ?? null
  };

  await saveState(STORE_NAME, stateKey(order.id), order);

  await publishEvent(PUBSUB_NAME, 'orders.created', {
    orderId: order.id,
    userId: order.userId,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt
  });

  return order;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const order = await getState<Order>(STORE_NAME, stateKey(orderId));
  return order ?? null;
}

export async function updateOrderStatus(
  orderId: string,
  payload: OrderStatusChangeRequest
): Promise<Order> {
  const parsed = orderStatusChangeSchema.parse(payload);
  const existing = await getOrder(orderId);
  if (!existing) {
    throw new NotFoundError(`Order ${orderId} not found`);
  }

  const updated: Order = {
    ...existing,
    status: parsed.status
  };

  await saveState(STORE_NAME, stateKey(orderId), updated);
  await publishEvent(PUBSUB_NAME, 'orders.status-changed', {
    orderId: updated.id,
    previousStatus: existing.status,
    status: updated.status,
    updatedAt: new Date().toISOString()
  });

  return updated;
}

export async function deleteOrder(orderId: string): Promise<void> {
  await deleteState(STORE_NAME, stateKey(orderId));
}
