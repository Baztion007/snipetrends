export interface Product {
  id: string;
  title: string;
  description: string | null;
  image: string;
  images: string | null;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  brand: string | null;
  badge: string | null;
  featured: boolean;
  stock: number;
  affiliateUrl: string;
  categoryId: string;
  category: { id: string; name: string; slug: string } | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count?: { products: number };
}

export interface CartItem {
  product: Product;
  qty: number;
}

export type View = "store" | "admin";
