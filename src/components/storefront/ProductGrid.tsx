"use client";

import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onSelect: (product: Product) => void;
  onClear?: () => void;
}

export function ProductGrid({
  products,
  loading,
  onSelect,
  onClear,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <Skeleton className="aspect-square rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted">
            <PackageSearch className="size-8 text-muted-foreground" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-sm text-muted-foreground">
              Try a different search term or browse all products.
            </p>
          </div>
          {onClear && (
            <Button variant="outline" onClick={onClear}>
              Clear filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
