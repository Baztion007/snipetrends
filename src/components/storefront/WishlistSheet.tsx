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
import { useWishlist } from "@/lib/wishlist-store";
import { redirectToPartner } from "@/lib/affiliate";
import { toast } from "sonner";
import { Heart, Trash2, ExternalLink, ArrowRight, X } from "lucide-react";
import type { Product } from "@/lib/types";

interface WishlistSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
}

export function WishlistSheet({ open, onOpenChange, onSelect }: WishlistSheetProps) {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const clear = useWishlist((s) => s.clear);

  const handleViewOnAmazon = (p: Product) => {
    redirectToPartner(p);
  };

  const handleSelect = (p: Product) => {
    onOpenChange(false);
    onSelect(p);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <Heart size={18} className="text-rose-500" />
            Your Wishlist
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Your saved products
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-muted">
              <Heart className="size-10 text-muted-foreground" />
            </span>
            <div>
              <h3 className="text-lg font-semibold">No favorites yet</h3>
              <p className="text-sm text-muted-foreground">
                Tap the heart on any product to save it here.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              Browse products
              <ArrowRight size={16} />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3">
              <ul className="flex flex-col gap-3">
                {items.map((p) => {
                  return (
                    <li
                      key={p.id}
                      className="flex gap-3 rounded-lg border p-2 transition-colors hover:border-amber-400/50"
                    >
                      <button
                        onClick={() => handleSelect(p)}
                        className="shrink-0"
                        aria-label={`View ${p.title}`}
                      >
                        <img
                          src={p.image}
                          alt={p.title}
                          className="size-16 rounded-md object-cover"
                        />
                      </button>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <button
                          onClick={() => handleSelect(p)}
                          className="line-clamp-2 text-left text-sm font-medium leading-snug hover:text-amber-600"
                        >
                          {p.title}
                        </button>
                        {p.brand && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {p.brand}
                          </p>
                        )}
                        <div className="mt-auto flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleViewOnAmazon(p)}
                            className="h-8 gap-1.5 bg-amber-500 text-white hover:bg-amber-600"
                          >
                            <ExternalLink size={13} />
                            View on Amazon
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => remove(p.id)}
                            className="h-8 w-8 px-0 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                            aria-label={`Remove ${p.title} from wishlist`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <SheetFooter className="border-t p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {items.length} saved {items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <Separator className="my-2" />
              <Button
                variant="outline"
                onClick={clear}
                className="gap-2 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
              >
                <X size={16} />
                Clear wishlist
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Continue shopping
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default WishlistSheet;
