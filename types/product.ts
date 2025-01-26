export interface ProductNode {
  id: string;
  title: string;
  description?: string;
  handle: string;
  status: string;
  vendor: string;
  productType: string;
  tags: string[];
  variants: {
    edges: Array<{
      node: {
        id: string;
        price: string;
        compareAtPrice: string | null;
        sku: string;
      };
    }>;
  };
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText: string | null;
      };
    }>;
  };
}