"use client";

import { useState } from "react";
import { ShieldCheck, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Inline "Why you can trust us" indicator shown near ratings. Reinforces
 * editorial independence — an affiliate best-practice for transparency.
 */
export function TrustBadge() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
            aria-label="Why you can trust our ratings — information"
          >
            <ShieldCheck className="size-3" />
            Verified
            <Info className="size-2.5 opacity-60" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-[260px] border-emerald-500/30 text-xs"
        >
          <p className="font-semibold">Why you can trust this</p>
          <p className="mt-1 text-muted-foreground">
            Ratings are sourced from verified customer reviews. Our editors are
            independent — affiliate relationships never influence rankings or
            scores.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default TrustBadge;
