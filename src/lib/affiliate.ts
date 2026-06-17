"use client";

import { toast } from "sonner";
import type { Product } from "./types";

/**
 * Affiliate click-through: records the click via /api/track-click and opens
 * the partner (Amazon) affiliate URL in a new tab. This is the primary
 * revenue-generating action on an affiliate site — there is no cart or
 * checkout because the actual purchase happens on Amazon.
 */
export async function redirectToPartner(
  product: Pick<Product, "id" | "title">,
  opts?: { silent?: boolean }
): Promise<void> {
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
    if (!opts?.silent) {
      toast.success("Opening on Amazon…", {
        description: "You'll be redirected to our partner store.",
      });
    }
    window.open(data.affiliateUrl, "_blank", "noopener,noreferrer");
  } catch {
    toast.error("Could not redirect", {
      description: "Please try again in a moment.",
    });
  }
}
