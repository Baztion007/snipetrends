"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StarRating } from "./StarRating";
import { useCompare, COMPARE_MAX } from "@/lib/compare-store";
import { useCart } from "@/lib/cart-store";
import { formatPrice, discountPercent } from "@/lib/format";
import { toast } from "sonner";
import { X, GitCompareArrows, ShoppingCart, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface CompareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
}

const BADGE_TONE: Record<string, string> = {
  deal: "bg-amber-500/15 text-amber-600",
  bestseller: "bg-emerald-500/15 text-emerald-600",
  new: "bg-rose-500/15 text-rose-600",
};

export function CompareSheet({ open, onOpenChange, onSelect }: CompareSheetProps) {
  const items = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const addItem = useCart((s) => s.addItem);

  const handleAddToCart = (p: Product) => {
    addItem(p, 1);
    toast.success("Added to cart", { description: p.title });
  };

  // best value = lowest price among compared items
  const bestPrice =
    items.length > 0 ? Math.min(...items.map((p) => p.price)) : 0;
  const bestRating =
    items.length > 0 ? Math.max(...items.map((p) => p.rating)) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-5xl sm:m-auto sm:rounded-2xl"
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <GitCompareArrows size={18} className="text-amber-500" />
            Compare Products
            <span className="text-sm font-normal text-muted-foreground">
              ({items.length}/{COMPARE_MAX})
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Side-by-side comparison of up to {COMPARE_MAX} products
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-muted">
              <GitCompareArrows className="size-10 text-muted-foreground" />
            </span>
            <div>
              <h3 className="text-lg font-semibold">Nothing to compare yet</h3>
              <p className="text-sm text-muted-foreground">
                Add up to {COMPARE_MAX} products to see them side by side.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Browse products
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <table className="w-full border-collapse">
                  <tbody>
                    {/* Product header row */}
                    <tr>
                      <td className="sticky left-0 z-10 w-28 bg-background pr-3 align-top text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Product
                      </td>
                      {items.map((p) => (
                        <td
                          key={p.id}
                          className="w-48 align-top px-2 pb-3"
                        >
                          <div className="relative">
                            <button
                              onClick={() => remove(p.id)}
                              className="absolute -right-1 -top-1 z-10 grid size-6 place-items-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600"
                              aria-label={`Remove ${p.title} from compare`}
                            >
                              <X size={12} />
                            </button>
                            <button
                              onClick={() => {
                                onOpenChange(false);
                                onSelect(p);
                              }}
                              className="block w-full"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="size-full object-cover"
                                />
                              </div>
                            </button>
                          </div>
                          {p.brand && (
                            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {p.brand}
                            </p>
                          )}
                          <button
                            onClick={() => {
                              onOpenChange(false);
                              onSelect(p);
                            }}
                            className="mt-1 line-clamp-2 text-left text-sm font-medium leading-snug hover:text-amber-600"
                          >
                            {p.title}
                          </button>
                        </td>
                      ))}
                    </tr>

                    <CompareRow
                      label="Price"
                      cells={items.map((p) => (
                        <div key={p.id} className="flex flex-col">
                          <span className="font-bold">{formatPrice(p.price)}</span>
                          {p.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(p.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      ))}
                      bestIndex={items
                        .map((p) => p.price)
                        .reduce(
                          (best, val, i, arr) =>
                            val < arr[best] ? i : best,
                          0
                        )}
                    />

                    <CompareRow
                      label="Discount"
                      cells={items.map((p) => {
                        const d = discountPercent(p.price, p.compareAtPrice);
                        return (
                          <span key={p.id} className={d ? "font-semibold text-rose-600" : "text-muted-foreground"}>
                            {d ? `-${d}%` : "—"}
                          </span>
                        );
                      })}
                    />

                    <CompareRow
                      label="Rating"
                      cells={items.map((p) => (
                        <div key={p.id} className="flex flex-col gap-0.5">
                          <StarRating rating={p.rating} size={12} />
                          <span className="text-xs text-muted-foreground">
                            {p.rating.toFixed(1)} ({p.reviewCount.toLocaleString()})
                          </span>
                        </div>
                      ))}
                      bestIndex={items
                        .map((p) => p.rating)
                        .reduce(
                          (best, val, i, arr) =>
                            val > arr[best] ? i : best,
                          0
                        )}
                    />

                    <CompareRow
                      label="Badge"
                      cells={items.map((p) =>
                        p.badge ? (
                          <span
                            key={p.id}
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                              BADGE_TONE[p.badge] || "bg-muted text-muted-foreground"
                            )}
                          >
                            {p.badge}
                          </span>
                        ) : (
                          <span key={p.id} className="text-muted-foreground">—</span>
                        )
                      )}
                    />

                    <CompareRow
                      label="Stock"
                      cells={items.map((p) => (
                        <span
                          key={p.id}
                          className={cn(
                            "text-sm font-medium",
                            p.stock <= 0
                              ? "text-rose-600"
                              : p.stock < 50
                              ? "text-amber-600"
                              : "text-emerald-600"
                          )}
                        >
                          {p.stock <= 0
                            ? "Out of stock"
                            : `${p.stock} in stock`}
                        </span>
                      ))}
                    />

                    <CompareRow
                      label="Category"
                      cells={items.map((p) => (
                        <span key={p.id} className="text-sm">
                          {p.category?.name || "—"}
                        </span>
                      ))}
                    />

                    <CompareRow
                      label="Actions"
                      cells={items.map((p) => (
                        <Button
                          key={p.id}
                          size="sm"
                          onClick={() => handleAddToCart(p)}
                          disabled={p.stock <= 0}
                          className="w-full gap-1.5 bg-amber-500 text-white hover:bg-amber-600"
                        >
                          <ShoppingCart size={13} />
                          Add to cart
                        </Button>
                      ))}
                      noBest
                    />
                  </tbody>
                </table>
              </div>
            </ScrollArea>

            <SheetFooter className="border-t p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Check size={12} className="text-emerald-500" />
                    Best value highlighted
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clear}
                    className="gap-2 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                  >
                    <X size={14} />
                    Clear all
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CompareRow({
  label,
  cells,
  bestIndex,
  noBest,
}: {
  label: string;
  cells: React.ReactNode[];
  bestIndex?: number;
  noBest?: boolean;
}) {
  return (
    <tr className="border-t">
      <td className="sticky left-0 z-10 w-28 bg-background pr-3 align-top text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">
        {label}
      </td>
      {cells.map((cell, i) => (
        <td
          key={i}
          className={cn(
            "align-top px-2 py-3 text-sm",
            !noBest && bestIndex === i && "rounded-md bg-emerald-500/5"
          )}
        >
          {cell}
          {!noBest && bestIndex === i && (
            <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
              <Star size={10} className="fill-emerald-500 text-emerald-500" />
            </span>
          )}
        </td>
      ))}
    </tr>
  );
}

export default CompareSheet;
