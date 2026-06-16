"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { useCart } from "@/lib/cart-store";
import { formatPrice, discountPercent } from "@/lib/format";
import { toast } from "sonner";
import {
  Minus,
  Plus,
  ShoppingCart,
  ExternalLink,
  Check,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const badgeStyles: Record<string, string> = {
  deal: "bg-amber-500 text-white",
  bestseller: "bg-emerald-500 text-white",
  new: "bg-rose-500 text-white",
};

interface ProductDetailDialogProps {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}

type StockStatus = {
  label: string;
  color: string;
  bg: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

function getStockStatus(product: Product): StockStatus {
  if (product.stock <= 0) {
    return {
      label: "Out of stock",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      icon: XCircle,
    };
  }
  if (product.stock <= 10) {
    return {
      label: `Low stock — only ${product.stock} left`,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      icon: AlertTriangle,
    };
  }
  return {
    label: "In stock",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: Check,
  };
}

export function ProductDetailDialog({
  product,
  onOpenChange,
}: ProductDetailDialogProps) {
  const [qty, setQty] = useState(1);
  const [redirecting, setRedirecting] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const open = !!product;

  // Reset internal state whenever the dialog opens for a new product.
  useEffect(() => {
    if (open) {
      setQty(1);
      setRedirecting(false);
    }
  }, [open, product?.id]);

  const discount = product
    ? discountPercent(product.price, product.compareAtPrice)
    : null;

  const handleAdd = () => {
    if (!product) return;
    addItem(product, qty);
    toast.success("Added to cart", {
      description: `${qty} × ${product.title}`,
    });
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setRedirecting(true);
    try {
      const res = await fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to track click");
      }
      toast.success("Redirecting to our partner…", {
        description: "Opening the affiliate store in a new tab.",
      });
      window.open(data.affiliateUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not redirect", {
        description: "Please try again in a moment.",
      });
    } finally {
      setRedirecting(false);
    }
  };

  const maxQty = product ? Math.max(1, product.stock || 99) : 99;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
      }}
    >
      <DialogContent
        className="max-w-3xl gap-0 p-0 sm:max-w-3xl"
        showCloseButton
      >
        {product && (
          <>
            <DialogTitle className="sr-only">{product.title}</DialogTitle>
            <DialogDescription className="sr-only">
              {product.description ?? "Product details"}
            </DialogDescription>
            <div className="grid gap-0 md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-muted md:aspect-auto">
                <img
                  src={product.image}
                  alt={product.title}
                  className="size-full object-cover"
                />
                {product.badge && (
                  <span
                    className={cn(
                      "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm",
                      badgeStyles[product.badge] || "bg-zinc-800"
                    )}
                  >
                    {product.badge}
                  </span>
                )}
                {discount && (
                  <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto p-5">
                {product.brand && (
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {product.brand}
                  </p>
                )}
                <h2 className="text-xl font-bold leading-tight sm:text-2xl">
                  {product.title}
                </h2>

                <div className="flex items-center gap-3">
                  <StarRating
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    size={16}
                  />
                  <span className="text-xs text-muted-foreground">
                    {product.rating.toFixed(1)} of 5
                  </span>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-3xl font-bold">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="pb-1 text-sm text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                  {discount && (
                    <Badge className="mb-1 bg-rose-600 text-white">
                      Save {discount}%
                    </Badge>
                  )}
                </div>

                {(() => {
                  const status = getStockStatus(product);
                  const Icon = status.icon;
                  return (
                    <div
                      className={cn(
                        "flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                        status.bg,
                        status.color
                      )}
                    >
                      <Icon size={14} />
                      {status.label}
                    </div>
                  );
                })()}

                {product.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                )}

                {product.category && (
                  <p className="text-xs text-muted-foreground">
                    Category:{" "}
                    <span className="font-medium text-foreground">
                      {product.category.name}
                    </span>
                  </p>
                )}

                {/* Quantity selector */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-sm font-medium">Quantity</span>
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </Button>
                    <span
                      className="w-8 text-center text-sm font-semibold"
                      aria-live="polite"
                    >
                      {qty}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setQty((q) => Math.min(maxQty, q + 1))
                      }
                      disabled={qty >= maxQty}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
                  <Button
                    onClick={handleAdd}
                    disabled={product.stock <= 0}
                    className="h-11 flex-1 gap-2 bg-amber-500 text-white hover:bg-amber-600"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0 || redirecting}
                    className="h-11 flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <ExternalLink size={16} />
                    {redirecting ? "Redirecting…" : "Buy Now via Partner"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
