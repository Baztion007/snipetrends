"use client";

import { useRef } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

interface DealsRailProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function DealsRail({ products, onSelect }: DealsRailProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 640);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section
      className="mx-auto max-w-7xl px-3 pt-6 sm:px-4"
      aria-label="Today's Deals"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
            <Clock size={18} />
          </span>
          <div>
            <h2 className="text-lg font-bold sm:text-xl">Today&apos;s Deals</h2>
            <p className="text-xs text-muted-foreground">
              Limited-time savings on hand-picked picks
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            aria-label="Scroll deals left"
            className="h-9 w-9"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            aria-label="Scroll deals right"
            className="h-9 w-9"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div
        ref={ref}
        className="mt-3 flex gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[220px] shrink-0 sm:w-[240px]"
          >
            <ProductCard product={p} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </section>
  );
}
