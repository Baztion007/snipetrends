"use client";

import { useState, useEffect, useCallback } from "react";
import { StoreHeader, DEALS_SENTINEL } from "./StoreHeader";
import { HeroCarousel } from "./HeroCarousel";
import { DealsRail } from "./DealsRail";
import { ProductGrid } from "./ProductGrid";
import { StoreFooter } from "./StoreFooter";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { CartSheet } from "./CartSheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product, Category } from "@/lib/types";

export interface StorefrontProps {
  onOpenAdmin: () => void;
}

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function Storefront({ onOpenAdmin }: StorefrontProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Fetch categories once on mount.
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // Fetch products whenever search / category / sort changes.
  // Loading is flipped to true in the event handlers (not here) to avoid
  // synchronous setState inside the effect body.
  useEffect(() => {
    let url: string;
    const q = searchQuery.trim();
    if (q) {
      url = `/api/search?q=${encodeURIComponent(q)}`;
    } else if (activeCategory === DEALS_SENTINEL) {
      url = `/api/products?badge=deal&sort=${encodeURIComponent(sort)}`;
    } else {
      const params = new URLSearchParams();
      if (activeCategory) params.set("categoryId", activeCategory);
      params.set("sort", sort);
      url = `/api/products?${params.toString()}`;
    }
    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setProducts(d.products || []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchQuery, activeCategory, sort]);

  const handleSearch = useCallback((q: string) => {
    setLoading(true);
    setSearchQuery(q);
    if (q) setActiveCategory(null);
  }, []);

  const handleCategory = useCallback((id: string | null) => {
    setLoading(true);
    setActiveCategory(id);
    if (id) setSearchQuery("");
  }, []);

  const handleSort = useCallback((value: string) => {
    setLoading(true);
    setSort(value);
  }, []);

  const handleClear = useCallback(() => {
    setLoading(true);
    setSearchQuery("");
    setActiveCategory(null);
    setSort("featured");
  }, []);

  const deals = products.filter(
    (p) => p.compareAtPrice && p.compareAtPrice > p.price
  );

  // Hide hero + deals rail while searching or viewing the deals filter view.
  const showChrome = !searchQuery.trim() && activeCategory !== DEALS_SENTINEL;
  const hasActiveFilter = !!searchQuery.trim() || activeCategory !== null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader
        onOpenAdmin={onOpenAdmin}
        onOpenCart={() => setCartOpen(true)}
        onSearch={handleSearch}
        categories={categories}
        activeCategory={activeCategory}
        onCategory={handleCategory}
      />

      <main className="flex-1">
        {showChrome && <HeroCarousel />}

        {showChrome && deals.length > 0 && !loading && (
          <DealsRail products={deals} onSelect={setSelected} />
        )}

        {/* Toolbar */}
        <div className="sticky top-[97px] z-30 border-b bg-background/95 backdrop-blur sm:top-[105px]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal
                size={16}
                className="shrink-0 text-muted-foreground"
              />
              <p className="truncate text-sm text-muted-foreground">
                {loading ? (
                  "Loading products…"
                ) : (
                  <>
                    <span className="font-semibold text-foreground">
                      {products.length}
                    </span>{" "}
                    {products.length === 1 ? "result" : "results"}
                    {searchQuery.trim() && (
                      <>
                        {" "}
                        for{" "}
                        <span className="font-semibold text-foreground">
                          &ldquo;{searchQuery.trim()}&rdquo;
                        </span>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilter && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X size={12} /> Clear
                </button>
              )}
              <Select value={sort} onValueChange={handleSort}>
                <SelectTrigger
                  size="sm"
                  className="w-40"
                  aria-label="Sort products"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          onSelect={setSelected}
          onClear={handleClear}
        />
      </main>

      <StoreFooter />

      <ProductDetailDialog
        product={selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}

export default Storefront;
