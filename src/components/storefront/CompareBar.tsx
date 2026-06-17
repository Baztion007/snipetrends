"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GitCompareArrows, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare, COMPARE_MAX } from "@/lib/compare-store";
import { cn } from "@/lib/utils";

interface CompareBarProps {
  onOpen: () => void;
}

export function CompareBar({ onOpen }: CompareBarProps) {
  const items = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const count = items.length;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-zinc-950/95 px-4 py-3 text-zinc-100 shadow-2xl backdrop-blur">
            <div className="flex shrink-0 items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500 text-zinc-950">
                <GitCompareArrows size={18} />
              </span>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">Compare</p>
                <p className="text-[11px] text-zinc-400">
                  {count}/{COMPARE_MAX} selected
                </p>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {items.map((p) => (
                <div key={p.id} className="group relative shrink-0">
                  <div className="size-12 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="size-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => remove(p.id)}
                    className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-rose-500 text-white shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Remove ${p.title}`}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {Array.from({ length: COMPARE_MAX - count }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="grid size-12 shrink-0 place-items-center rounded-lg border border-dashed border-zinc-700 text-zinc-600"
                >
                  <GitCompareArrows size={16} />
                </div>
              ))}
            </div>

            <Button
              onClick={onOpen}
              className={cn(
                "shrink-0 gap-2 bg-amber-500 text-zinc-950 hover:bg-amber-400"
              )}
            >
              <Check size={16} />
              <span className="hidden sm:inline">Compare now</span>
              <span className="sm:hidden">Compare</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CompareBar;
