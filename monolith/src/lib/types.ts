export type SalesStatus = 'available' | 'coming-soon' | 'sold-out';

export interface Book {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image?: string;
  status: SalesStatus;
  tags: string[];
  price: number;
  author: string;
  publicationYear: number;
}

export interface CartItem {
  bookId: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  customerName: string;
  email: string;
  address: string;
  cardLast4: string;
  createdAt: string;
}
