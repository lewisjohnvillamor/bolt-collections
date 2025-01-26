export interface Collection {
  id: string;
  name: string;
  products: string[];
  isVisible: boolean;
  sortOrder: number;
  seoTitle: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  handle?: string;
  image?: {
    url: string;
    altText: string;
  } | null;
  productsCount?: number;
}