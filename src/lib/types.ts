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
