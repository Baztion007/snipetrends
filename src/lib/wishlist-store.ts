"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "./types";

interface WishlistState {
  items: Product[];
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  count: () => number;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((p) => p.id === product.id);
          return {
            items: exists
              ? state.items.filter((p) => p.id !== product.id)
              : [...state.items, product],
          };
        }),
      has: (id) => get().items.some((p) => p.id === id),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((p) => p.id !== id) })),
      clear: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    {
      name: "aff-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
