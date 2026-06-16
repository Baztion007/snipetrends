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
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.totalPrice());
  const count = useCart((s) => s.totalItems());

  const checkout = () => {
    toast.success("Order placed!", {
      description: "This is a demo checkout — no payment was processed.",
    });
    clear();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-amber-500" />
            Your Cart
            {count > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({count} {count === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review and checkout your cart items
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-10 text-muted-foreground" />
            </span>
            <div>
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add some products to get started.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              Continue shopping
              <ArrowRight size={16} />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3">
              <ul className="flex flex-col gap-3">
                {items.map(({ product, qty }) => (
                  <li
                    key={product.id}
                    className="flex gap-3 rounded-lg border p-2"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="size-16 shrink-0 rounded-md object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug">
                        {product.title}
                      </p>
                      {product.brand && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          {product.brand}
                        </p>
                      )}
                      <p className="text-sm font-semibold">
                        {formatPrice(product.price)}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQty(product.id, qty - 1)}
                            aria-label={`Decrease ${product.title} quantity`}
                          >
                            <Minus size={12} />
                          </Button>
                          <span
                            className="w-7 text-center text-xs font-semibold"
                            aria-live="polite"
                          >
                            {qty}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQty(product.id, qty + 1)}
                            aria-label={`Increase ${product.title} quantity`}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                          onClick={() => removeItem(product.id)}
                          aria-label={`Remove ${product.title} from cart`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <span className="text-xs text-muted-foreground">
                        Subtotal
                      </span>
                      <span className="text-sm font-bold">
                        {formatPrice(product.price * qty)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-t p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-emerald-600">
                    Free
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <Button
                onClick={checkout}
                className="mt-2 h-11 bg-amber-500 text-white hover:bg-amber-600"
              >
                Checkout
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
