"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentlyViewed } from "@/lib/recently-viewed-store";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface RecentlyViewedRailProps {
  onSelect: (product: Product) => void;
}

export function RecentlyViewedRail({ onSelect }: RecentlyViewedRailProps) {
  const items = useRecentlyViewed((s) => s.items);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section aria-label="Recently viewed" className="mx-auto max-w-7xl px-3 sm:px-4 py-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
          <History className="size-5 text-amber-500" />
          Recently Viewed
        </h2>
        <div className="hidden items-center gap-1 sm:flex">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p) => {
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="group flex w-[180px] shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-amber-400/60 hover:shadow-md sm:w-[200px]"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
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
                <StarRating rating={p.rating} reviewCount={p.reviewCount} size={12} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default RecentlyViewedRail;
