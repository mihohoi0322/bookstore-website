import { z } from 'zod';

export const salesStatusSchema = z.enum(['available', 'coming-soon', 'sold-out']);
export type SalesStatus = z.infer<typeof salesStatusSchema>;

export const publicationStatusSchema = z.enum(['draft', 'published', 'archived']);
export type PublicationStatus = z.infer<typeof publicationStatusSchema>;

export const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  description: z.string(),
  fullDescription: z.string(),
  imageUrl: z.string().url().nullable().optional(),
  price: z.number().nonnegative(),
  status: salesStatusSchema,
  tags: z.array(z.string()),
  publicationYear: z.number().int().nonnegative(),
  publicationStatus: publicationStatusSchema.default('draft')
});

export type Book = z.infer<typeof bookSchema>;

export const upsertBookRequestSchema = z.object({
  title: z.string(),
  author: z.string(),
  description: z.string(),
  fullDescription: z.string(),
  price: z.number().nonnegative(),
  status: salesStatusSchema,
  tags: z.array(z.string()).default([]),
  publicationYear: z.number().int().nonnegative().default(new Date().getFullYear()),
  imageUrl: z.string().url().nullable().optional()
});
export type UpsertBookRequest = z.infer<typeof upsertBookRequestSchema>;

export const cartItemSchema = z.object({
  bookId: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().nonnegative().optional()
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z.object({
  userId: z.string(),
  items: z.array(cartItemSchema),
  totalAmount: z.number().nonnegative(),
  updatedAt: z.string().datetime()
});
export type Cart = z.infer<typeof cartSchema>;

export const cartUpdateRequestSchema = z.object({
  items: z.array(cartItemSchema.pick({ bookId: true, quantity: true }))
});
export type CartUpdateRequest = z.infer<typeof cartUpdateRequestSchema>;

export const cartItemRequestSchema = cartItemSchema.pick({ bookId: true, quantity: true });
export type CartItemRequest = z.infer<typeof cartItemRequestSchema>;

export const orderStatusSchema = z.enum(['pending', 'processing', 'completed', 'cancelled']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const paymentStatusSchema = z.enum(['authorized', 'captured', 'failed']);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentMethodSchema = z.enum(['credit_card', 'apple_pay', 'google_pay']);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const shippingAddressSchema = z.object({
  postalCode: z.string(),
  prefecture: z.string(),
  city: z.string(),
  line1: z.string(),
  line2: z.string().nullable().optional()
});
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const orderItemSchema = z.object({
  bookId: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().nonnegative()
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(orderItemSchema),
  totalAmount: z.number().nonnegative(),
  status: orderStatusSchema,
  createdAt: z.string().datetime(),
  payment: z.object({
    method: paymentMethodSchema,
    status: paymentStatusSchema,
    cardLast4: z.string().length(4).nullable().optional()
  }),
  shippingAddress: shippingAddressSchema,
  memo: z.string().nullable().optional()
});
export type Order = z.infer<typeof orderSchema>;

export const createOrderItemSchema = z.object({
  bookId: z.string(),
  quantity: z.number().int().min(1)
});

export const createOrderRequestSchema = z.object({
  userId: z.string(),
  items: z.array(createOrderItemSchema).min(1),
  paymentToken: z.string(),
  shippingAddress: shippingAddressSchema,
  memo: z.string().nullable().optional()
});
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const orderStatusChangeSchema = z.object({
  status: orderStatusSchema
});
export type OrderStatusChangeRequest = z.infer<typeof orderStatusChangeSchema>;

export const publicationStatusRequestSchema = z.object({
  status: publicationStatusSchema
});
export type PublicationStatusRequest = z.infer<typeof publicationStatusRequestSchema>;

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
