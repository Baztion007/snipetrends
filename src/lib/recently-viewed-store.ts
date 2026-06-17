"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "./types";

interface RecentlyViewedState {
  items: Product[];
  push: (product: Product) => void;
  clear: () => void;
}

const MAX = 10;

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      push: (product) =>
        set((state) => {
          const filtered = state.items.filter((p) => p.id !== product.id);
          return { items: [product, ...filtered].slice(0, MAX) };
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "aff-recently-viewed",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
