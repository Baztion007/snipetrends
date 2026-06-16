"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "./types";

interface CompareState {
  items: Product[];
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  count: () => number;
  isFull: () => boolean;
}

const MAX = 3;

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((p) => p.id === product.id);
          if (exists) {
            return { items: state.items.filter((p) => p.id !== product.id) };
          }
          if (state.items.length >= MAX) return state; // full, ignore
          return { items: [...state.items, product] };
        }),
      has: (id) => get().items.some((p) => p.id === id),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((p) => p.id !== id) })),
      clear: () => set({ items: [] }),
      count: () => get().items.length,
      isFull: () => get().items.length >= MAX,
    }),
    {
      name: "aff-compare",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const COMPARE_MAX = MAX;
