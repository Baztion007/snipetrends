"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/format";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  className?: string;
  showCount?: boolean;
}

/**
 * Renders 5 stars (filled / half / empty) from a 0–5 rating.
 * Filled stars use amber. Optionally shows a compact review count.
 */
export function StarRating({
  rating,
  reviewCount,
  size = 14,
  className,
  showCount = true,
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const fraction = clamped - full;
  const hasHalf = fraction >= 0.25 && fraction < 0.75;
  const extraFull = fraction >= 0.75 ? 1 : 0;
  const filledCount = full + extraFull;

  const label = `${clamped.toFixed(1)} out of 5 stars${
    reviewCount !== undefined ? `, ${reviewCount} reviews` : ""
  }`;

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="img"
      aria-label={label}
      title={label}
    >
      <div className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < filledCount) {
            return (
              <Star
                key={i}
                size={size}
                className="fill-amber-400 text-amber-400"
              />
            );
          }
          if (i === filledCount && hasHalf) {
            return (
              <StarHalf
                key={i}
                size={size}
                className="fill-amber-400 text-amber-400"
              />
            );
          }
          return (
            <Star
              key={i}
              size={size}
              className="text-muted-foreground/30"
            />
          );
        })}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">
          {formatCompact(reviewCount)}
        </span>
      )}
    </div>
  );
}
