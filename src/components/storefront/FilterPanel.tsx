"use client";

import { useMemo } from "react";
import { SlidersHorizontal, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export interface FilterState {
  priceMax: number | null;
  brands: string[];
  minRating: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  priceMax: null,
  brands: [],
  minRating: 0,
  inStockOnly: false,
  onSaleOnly: false,
};

interface FilterPanelProps {
  products: Product[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
  className?: string;
}

export function FilterPanel({
  products,
  filters,
  onChange,
  className,
}: FilterPanelProps) {
  const { priceBounds, brands } = useMemo(() => {
    const prices = products.map((p) => p.price);
    const brandSet = new Set<string>();
    products.forEach((p) => p.brand && brandSet.add(p.brand));
    return {
      priceBounds: prices.length
        ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
        : { min: 0, max: 1000 },
      brands: [...brandSet].sort(),
    };
  }, [products]);

  const maxPrice = filters.priceMax ?? priceBounds.max;

  const toggleBrand = (brand: string) => {
    const exists = filters.brands.includes(brand);
    onChange({
      ...filters,
      brands: exists
        ? filters.brands.filter((b) => b !== brand)
        : [...filters.brands, brand],
    });
  };

  const activeCount =
    (filters.priceMax !== null && filters.priceMax < priceBounds.max ? 1 : 0) +
    filters.brands.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSaleOnly ? 1 : 0);

  return (
    <div className={cn("flex flex-col gap-5 min-w-0", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
          <SlidersHorizontal size={15} className="shrink-0" />
          Filters
        </h3>
        {activeCount > 0 && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="flex shrink-0 items-center gap-1 text-xs text-rose-600 hover:underline"
          >
            <X size={12} />
            Clear ({activeCount})
          </button>
        )}
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-2.5 min-w-0">
        <Label className="text-xs font-semibold uppercase tracking-wide block">
          Minimum Rating
        </Label>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2, 0].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: r })}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                filters.minRating === r
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "hover:bg-muted"
              )}
            >
              {r > 0 ? (
                <>
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{r}.0</span>
                  <span className="text-xs text-muted-foreground">& up</span>
                </>
              ) : (
                <span className="text-muted-foreground">Any rating</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      {brands.length > 0 && (
        <>
          <div className="space-y-2.5 min-w-0">
            <Label className="text-xs font-semibold uppercase tracking-wide block">
              Brands
            </Label>
            <ScrollArea className="max-h-40">
              <div className="flex flex-col gap-2 pr-2">
                {brands.map((b) => (
                  <label
                    key={b}
                    className="flex min-w-0 cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={filters.brands.includes(b)}
                      onCheckedChange={() => toggleBrand(b)}
                      className="border-zinc-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 shrink-0"
                    />
                    <span className="truncate min-w-0">{b}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
          <Separator />
        </>
      )}

      {/* Toggles */}
      <div className="space-y-2.5 min-w-0">
        <Label className="text-xs font-semibold uppercase tracking-wide block">
          Availability
        </Label>
        <label className="flex min-w-0 cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={filters.inStockOnly}
            onCheckedChange={(v) =>
              onChange({ ...filters, inStockOnly: v === true })
            }
            className="border-zinc-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 shrink-0"
          />
          <span className="min-w-0">In stock only</span>
        </label>
        <label className="flex min-w-0 cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={filters.onSaleOnly}
            onCheckedChange={(v) =>
              onChange({ ...filters, onSaleOnly: v === true })
            }
            className="border-zinc-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 shrink-0"
          />
          <span className="min-w-0">On sale only</span>
        </label>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.brands.map((b) => (
            <Badge
              key={b}
              variant="secondary"
              className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            >
              <span className="max-w-[100px] truncate">{b}</span>
              <button onClick={() => toggleBrand(b)} aria-label={`Remove ${b}`}>
                <X size={11} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function applyFilters(products: Product[], f: FilterState): Product[] {
  return products.filter((p) => {
    if (f.priceMax !== null && p.price > f.priceMax) return false;
    if (f.brands.length > 0 && (!p.brand || !f.brands.includes(p.brand)))
      return false;
    if (f.minRating > 0 && p.rating < f.minRating) return false;
    if (f.inStockOnly && p.stock <= 0) return false;
    if (f.onSaleOnly && (!p.compareAtPrice || p.compareAtPrice <= p.price))
      return false;
    return true;
  });
}

export default FilterPanel;
