"use client";

import { useEffect, useRef, useState } from "react";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { formatPrice, discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface TrendingRailProps {
  onSelect: (product: Product) => void;
}

export function TrendingRail({ onSelect }: TrendingRailProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/trending")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setProducts(d.products || []);
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section
      aria-label="Trending now"
      className="mx-auto max-w-7xl px-3 sm:px-4 py-6"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
          <Flame className="size-5 text-rose-500" />
          Trending Now
          <span className="text-xs font-normal text-muted-foreground">
            Most-clicked this week
          </span>
        </h2>
        <div className="hidden items-center gap-1 sm:flex">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll trending left"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scrollBy(1)}
            aria-label="Scroll trending right"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-[180px] shrink-0 animate-pulse rounded-xl border bg-card p-2.5 sm:w-[200px]"
              >
                <div className="aspect-square rounded-lg bg-muted" />
                <div className="mt-2 h-3 w-3/4 rounded bg-muted" />
                <div className="mt-1.5 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))
          : products.map((p, i) => {
              const disc = discountPercent(p.price, p.compareAtPrice);
              return (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="group relative flex w-[180px] shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-rose-400/60 hover:shadow-md sm:w-[200px]"
                >
                  {/* Trending rank badge */}
                  <span className="absolute left-1.5 top-1.5 z-10 grid size-6 place-items-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-sm">
                    {i + 1}
                  </span>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {disc && (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        -{disc}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-2.5">
                    {p.brand && (
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {p.brand}
                      </p>
                    )}
                    <p className="line-clamp-2 min-h-[2.25rem] text-xs font-medium leading-snug">
                      {p.title}
                    </p>
                    <StarRating
                      rating={p.rating}
                      reviewCount={p.reviewCount}
                      size={12}
                    />
                    <p className="text-sm font-bold">{formatPrice(p.price)}</p>
                  </div>
                </button>
              );
            })}
      </div>
    </section>
  );
}

export default TrendingRail;
