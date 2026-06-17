"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { StoreHeader, DEALS_SENTINEL } from "./StoreHeader";
import { HeroCarousel, type HeroAction } from "./HeroCarousel";
import { DealsRail } from "./DealsRail";
import { ProductGrid } from "./ProductGrid";
import { StoreFooter, type FooterNav } from "./StoreFooter";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { WishlistSheet } from "./WishlistSheet";
import { RecentlyViewedRail } from "./RecentlyViewedRail";
import { CompareBar } from "./CompareBar";
import { CompareSheet } from "./CompareSheet";
import { BackToTop } from "./BackToTop";
import { TrendingRail } from "./TrendingRail";
import {
  FilterPanel,
  applyFilters,
  DEFAULT_FILTERS,
  type FilterState,
} from "./FilterPanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch categories once on mount.
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // Fetch products whenever search / category / sort changes.
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
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleCategory = useCallback((id: string | null) => {
    setLoading(true);
    setActiveCategory(id);
    if (id) setSearchQuery("");
    setFilters(DEFAULT_FILTERS);
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
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Drive the product view from hero CTAs + footer browse links.
  const scrollToGrid = () => {
    // Small delay so the grid re-renders before scrolling.
    setTimeout(() => {
      document.getElementById("product-grid-top")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  const handleHeroAction = useCallback(
    (action: HeroAction) => {
      setLoading(true);
      setSearchQuery("");
      if (action.type === "deals") {
        setActiveCategory(DEALS_SENTINEL);
        setSort("featured");
      } else if (action.type === "top-rated") {
        setActiveCategory(null);
        setSort("rating");
      } else if (action.type === "new") {
        setActiveCategory(null);
        setSort("featured");
        setFilters((f) => ({ ...f, onSaleOnly: false }));
      }
      scrollToGrid();
    },
    []
  );

  const handleFooterNav = useCallback(
    (nav: FooterNav) => {
      setLoading(true);
      setSearchQuery("");
      switch (nav) {
        case "deals":
          setActiveCategory(DEALS_SENTINEL);
          setSort("featured");
          break;
        case "top-rated":
          setActiveCategory(null);
          setSort("rating");
          break;
        case "new":
          setActiveCategory(null);
          setSort("featured");
          break;
        case "all-categories":
          setActiveCategory(null);
          setSort("featured");
          break;
      }
      scrollToGrid();
    },
    []
  );

  // Client-side filtering on the fetched products.
  const filteredProducts = useMemo(
    () => applyFilters(products, filters),
    [products, filters]
  );

  const deals = products.filter(
    (p) => p.compareAtPrice && p.compareAtPrice > p.price
  );

  // Hide hero + deals rail while searching or viewing the deals filter view.
  const showChrome = !searchQuery.trim() && activeCategory !== DEALS_SENTINEL;
  const hasActiveFilter = !!searchQuery.trim() || activeCategory !== null;

  const filterContent = (
    <FilterPanel
      products={products}
      filters={filters}
      onChange={setFilters}
    />
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Accessibility: skip-to-content link (first focusable element) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-950 focus:shadow-lg"
      >
        Skip to products
      </a>
      <StoreHeader
        onOpenAdmin={onOpenAdmin}
        onOpenWishlist={() => setWishlistOpen(true)}
        onSearch={handleSearch}
        categories={categories}
        activeCategory={activeCategory}
        onCategory={handleCategory}
      />

      <main className="flex-1" id="main-content">
        {showChrome && <HeroCarousel onAction={handleHeroAction} />}

        {showChrome && <TrendingRail onSelect={setSelected} />}

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
                      {filteredProducts.length}
                    </span>{" "}
                    {filteredProducts.length === 1 ? "result" : "results"}
                    {filteredProducts.length !== products.length && (
                      <span className="text-amber-600">
                        {" "}
                        of {products.length}
                      </span>
                    )}
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
              {/* Mobile filter trigger */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileFiltersOpen(true)}
                className="relative lg:hidden"
              >
                <Filter size={14} />
                <span className="ml-1">Filters</span>
                {(() => {
                  const n =
                    (filters.priceMax !== null ? 1 : 0) +
                    filters.brands.length +
                    (filters.minRating > 0 ? 1 : 0) +
                    (filters.inStockOnly ? 1 : 0) +
                    (filters.onSaleOnly ? 1 : 0);
                  return n > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                      {n}
                    </span>
                  ) : null;
                })()}
              </Button>
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

        {/* Body: sidebar filters + grid */}
        <div id="product-grid-top" className="mx-auto flex max-w-7xl gap-6 px-3 py-6 sm:px-4">
          {/* Desktop filter sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-[170px] rounded-xl border bg-card p-4">
              {filterContent}
            </div>
          </aside>

          {/* Mobile filter sheet */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="flex items-center gap-2">
                  <Filter size={16} className="text-amber-500" />
                  Filters
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Filter products by price, brand, rating, and availability
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">{filterContent}</div>
              <div className="border-t p-4">
                <Button
                  className="w-full bg-amber-500 text-white hover:bg-amber-600"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Show {filteredProducts.length} results
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              onSelect={setSelected}
              onClear={handleClear}
              query={searchQuery}
            />
          </div>
        </div>

        {/* Recently viewed rail (only on default home view) */}
        {showChrome && <RecentlyViewedRail onSelect={setSelected} />}
      </main>

      <StoreFooter onNavigate={handleFooterNav} />

      <ProductDetailDialog
        product={selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
      <WishlistSheet
        open={wishlistOpen}
        onOpenChange={setWishlistOpen}
        onSelect={setSelected}
      />
      <CompareBar onOpen={() => setCompareOpen(true)} />
      <CompareSheet
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onSelect={setSelected}
      />
      <BackToTop />
    </div>
  );
}

export default Storefront;
