"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { formatPrice, discountPercent } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const badgeStyles: Record<string, string> = {
  deal: "bg-amber-500 text-white",
  bestseller: "bg-emerald-500 text-white",
  new: "bg-rose-500 text-white",
};

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const wishlistToggle = useWishlist((s) => s.toggle);
  const isWishlisted = useWishlist((s) => s.has(product.id));
  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    toast.success("Added to cart", { description: product.title });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasIn = isWishlisted;
    wishlistToggle(product);
    toast(wasIn ? "Removed from wishlist" : "Saved to wishlist", {
      description: product.title,
    });
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(product);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="h-full"
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onSelect(product)}
        onKeyDown={handleKeyDown}
        aria-label={`View ${product.title}`}
        className="group relative h-full cursor-pointer gap-0 overflow-hidden p-0 transition-colors hover:border-amber-400/60 hover:shadow-lg"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.badge && (
            <span
              className={cn(
                "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm",
                badgeStyles[product.badge] || "bg-zinc-800 text-white"
              )}
            >
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="absolute right-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <span className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                Out of Stock
              </span>
            </div>
          )}
          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
            aria-pressed={isWishlisted}
            className="absolute right-2 bottom-2 grid size-9 place-items-center rounded-full bg-background/90 shadow-md backdrop-blur transition-all hover:scale-110"
          >
            <Heart
              size={17}
              className={cn(
                "transition-all",
                isWishlisted
                  ? "fill-rose-500 text-rose-500"
                  : "text-zinc-500 hover:text-rose-500"
              )}
            />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1.5 p-3">
          {product.brand && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {product.brand}
            </p>
          )}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
            {product.title}
          </h3>
          <StarRating
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 pt-1.5">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={outOfStock}
              className="h-9 flex-1 gap-1.5 bg-amber-500 text-white hover:bg-amber-600"
            >
              <ShoppingCart size={14} />
              Add to cart
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleView}
              className="h-9 w-9 px-0"
              aria-label={`View ${product.title} details`}
            >
              <Eye size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
