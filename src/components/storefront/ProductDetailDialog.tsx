"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StarRating } from "./StarRating";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useRecentlyViewed } from "@/lib/recently-viewed-store";
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
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Package,
  Ruler,
  Tag,
  BarChart3,
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
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCart((s) => s.addItem);
  const wishlistToggle = useWishlist((s) => s.toggle);
  const isWishlisted = useWishlist((s) => (product ? s.has(product.id) : false));
  const pushRecent = useRecentlyViewed((s) => s.push);

  const open = !!product;

  // Parse the gallery images (JSON string array) with a safe fallback.
  const gallery = useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    if (product.images) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          imgs.push(...parsed.filter((x) => typeof x === "string" && x));
        }
      } catch {
        /* ignore */
      }
    }
    if (imgs.length === 0 && product.image) imgs.push(product.image);
    return imgs;
  }, [product]);

  // Reset internal state whenever the dialog opens for a new product.
  useEffect(() => {
    if (open && product) {
      setQty(1);
      setRedirecting(false);
      setActiveImage(0);
      pushRecent(product);
    }
  }, [open, product, pushRecent]);

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

  const handleWishlist = () => {
    if (!product) return;
    const wasIn = isWishlisted;
    wishlistToggle(product);
    toast(wasIn ? "Removed from wishlist" : "Saved to wishlist", {
      description: product.title,
    });
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
              {/* Image gallery */}
              <div className="flex flex-col gap-2 bg-muted">
                <div className="relative aspect-square overflow-hidden bg-muted md:aspect-auto">
                  <img
                    src={gallery[activeImage] ?? product.image}
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
                {gallery.length > 1 && (
                  <div className="flex gap-2 p-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {gallery.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        aria-label={`View image ${i + 1}`}
                        aria-pressed={activeImage === i}
                        className={cn(
                          "relative size-14 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                          activeImage === i
                            ? "border-amber-500 ring-1 ring-amber-500/40"
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <img
                          src={src}
                          alt=""
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
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

                {/* Tabbed info */}
                <Tabs defaultValue="specs" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="specs">Specs</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  <TabsContent value="specs" className="mt-3">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="size-3.5 text-muted-foreground" />
                        <dt className="text-muted-foreground">Brand</dt>
                        <dd className="ml-auto font-medium">{product.brand || "—"}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="size-3.5 text-muted-foreground" />
                        <dt className="text-muted-foreground">SKU</dt>
                        <dd className="ml-auto font-mono text-xs font-medium">{product.id.slice(-8).toUpperCase()}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="size-3.5 text-muted-foreground" />
                        <dt className="text-muted-foreground">Rating</dt>
                        <dd className="ml-auto font-medium">{product.rating.toFixed(1)}/5</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler className="size-3.5 text-muted-foreground" />
                        <dt className="text-muted-foreground">Stock</dt>
                        <dd className="ml-auto font-medium">{product.stock} units</dd>
                      </div>
                      {product.category && (
                        <div className="col-span-2 flex items-center gap-2 border-t pt-2">
                          <Tag className="size-3.5 text-muted-foreground" />
                          <dt className="text-muted-foreground">Category</dt>
                          <dd className="ml-auto font-medium">{product.category.name}</dd>
                        </div>
                      )}
                    </dl>
                  </TabsContent>
                  <TabsContent value="details" className="mt-3">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.description ||
                        "No additional details available for this product. It ships directly from our trusted affiliate partner with full warranty and return protection."}
                    </p>
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-3 space-y-2">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                      <span className="text-3xl font-bold text-amber-500">
                        {product.rating.toFixed(1)}
                      </span>
                      <div>
                        <StarRating
                          rating={product.rating}
                          size={14}
                        />
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Based on {product.reviewCount.toLocaleString()} reviews
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { stars: 5, pct: 72 },
                        { stars: 4, pct: 18 },
                        { stars: 3, pct: 6 },
                        { stars: 2, pct: 2 },
                        { stars: 1, pct: 2 },
                      ].map((r) => (
                        <div key={r.stars} className="flex items-center gap-2 text-xs">
                          <span className="w-6 text-muted-foreground">{r.stars}★</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-muted-foreground">{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

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
                <div className="flex flex-col gap-2 pt-4 sm:flex-row">
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
                  <Button
                    onClick={handleWishlist}
                    variant="outline"
                    className={cn(
                      "h-11 gap-2 px-4",
                      isWishlisted && "border-rose-400 text-rose-600 hover:bg-rose-500/10"
                    )}
                    aria-pressed={isWishlisted}
                  >
                    <Heart
                      size={16}
                      className={cn(isWishlisted && "fill-rose-500 text-rose-500")}
                    />
                    {isWishlisted ? "Saved" : "Save"}
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border bg-muted/30 p-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="size-5 text-amber-500" />
                    <span className="text-[11px] font-medium leading-tight">Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="size-5 text-emerald-500" />
                    <span className="text-[11px] font-medium leading-tight">30-Day Returns</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="size-5 text-violet-500" />
                    <span className="text-[11px] font-medium leading-tight">Secure Partner</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
