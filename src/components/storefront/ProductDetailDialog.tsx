"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { useWishlist } from "@/lib/wishlist-store";
import { useRecentlyViewed } from "@/lib/recently-viewed-store";
import { redirectToPartner } from "@/lib/affiliate";
import { formatPrice, discountPercent } from "@/lib/format";
import { toast } from "sonner";
import {
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
  Loader2,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrustBadge } from "./TrustBadge";
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
  const [redirecting, setRedirecting] = useState(false);
  const wishlistToggle = useWishlist((s) => s.toggle);
  const isWishlisted = useWishlist((s) => (product ? s.has(product.id) : false));
  const pushRecent = useRecentlyViewed((s) => s.push);

  const open = !!product;

  // Track recently-viewed when a product is opened (external store write only).
  useEffect(() => {
    if (open && product) {
      pushRecent(product);
    }
  }, [open, product, pushRecent]);

  const discount = product
    ? discountPercent(product.price, product.compareAtPrice)
    : null;

  const handleViewOnAmazon = async () => {
    if (!product) return;
    setRedirecting(true);
    await redirectToPartner(product);
    setRedirecting(false);
  };

  const handleWishlist = () => {
    if (!product) return;
    const wasIn = isWishlisted;
    wishlistToggle(product);
    toast(wasIn ? "Removed from wishlist" : "Saved to wishlist", {
      description: product.title,
    });
  };

  const handleShare = async () => {
    if (!product) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} on ShopAffiliate`,
      url,
    };
    // Prefer the native Web Share API (mobile / supported browsers).
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled — fall through to clipboard */
      }
    }
    // Fallback: copy the current URL to clipboard.
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", {
        description: "Share this page with friends!",
      });
    } catch {
      toast.error("Could not copy link");
    }
  };

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
              {/* Image gallery (keyed so activeImage resets per product) */}
              <ProductGallery
                key={product.id}
                product={product}
                discount={discount}
              />

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
                  <TrustBadge />
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

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                  <Button
                    onClick={handleViewOnAmazon}
                    disabled={redirecting}
                    className="h-11 flex-1 gap-2 bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                  >
                    {redirecting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ExternalLink size={16} />
                    )}
                    {redirecting ? "Opening on Amazon…" : "View on Amazon"}
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
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="h-11 w-11 px-0"
                    aria-label="Share product"
                  >
                    <Share2 size={16} />
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border bg-muted/30 p-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="size-5 text-amber-500" />
                    <span className="text-[11px] font-medium leading-tight">Ships from Amazon</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="size-5 text-emerald-500" />
                    <span className="text-[11px] font-medium leading-tight">Amazon Returns</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="size-5 text-violet-500" />
                    <span className="text-[11px] font-medium leading-tight">Secure Checkout</span>
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

/** Image gallery with thumbnail switcher. Keyed by product id in the parent so
 *  its internal activeImage state resets when switching products. */
function ProductGallery({
  product,
  discount,
}: {
  product: Product;
  discount: number | null;
}) {
  const [activeImage, setActiveImage] = useState(0);

  const gallery: string[] = (() => {
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
  })();

  return (
    <div className="flex flex-col gap-2 bg-muted">
      <div className="relative aspect-square overflow-hidden bg-muted md:aspect-auto">
        <Image
          src={gallery[activeImage] ?? product.image}
          alt={product.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
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
              <Image src={src} alt="" fill sizes="56px" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
