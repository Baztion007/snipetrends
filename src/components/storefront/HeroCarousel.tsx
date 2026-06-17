"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeroAction {
  type: "deals" | "top-rated" | "new";
}

interface Slide {
  title: string;
  subtitle: string;
  cta: string;
  gradient: string;
  badge: string;
  action: HeroAction["type"];
}

const slides: Slide[] = [
  {
    title: "Mega Tech Sale",
    subtitle:
      "Up to 60% off top-rated electronics from brands you trust. Hand-picked deals, refreshed daily.",
    cta: "Shop deals",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    badge: "Limited time",
    action: "deals",
  },
  {
    title: "Earn While You Shop",
    subtitle:
      "Curated affiliate picks. Every purchase through our links supports independent creators.",
    cta: "Learn more",
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    badge: "Affiliate program",
    action: "top-rated",
  },
  {
    title: "New Arrivals Weekly",
    subtitle:
      "Fresh drops from emerging brands. Be the first to discover what's trending right now.",
    cta: "Explore new",
    gradient: "from-rose-500 via-amber-400 to-orange-500",
    badge: "Just landed",
    action: "new",
  },
];

interface HeroCarouselProps {
  onAction: (action: HeroAction) => void;
}

export function HeroCarousel({ onAction }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = slides[index];

  const handleCta = () => {
    onAction({ type: slide.action });
  };

  return (
    <section
      className="mx-auto max-w-7xl px-3 pt-4 sm:px-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "relative flex min-h-[200px] flex-col justify-center gap-3 bg-gradient-to-br p-6 sm:min-h-[280px] sm:p-10",
              slide.gradient
            )}
            aria-live="polite"
          >
            <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {slide.badge}
            </span>
            <h2 className="max-w-xl text-2xl font-bold leading-tight text-white sm:text-4xl">
              {slide.title}
            </h2>
            <p className="max-w-lg text-sm text-white/90 sm:text-base">
              {slide.subtitle}
            </p>
            <div>
              <Button
                className="w-fit bg-white text-zinc-900 hover:bg-white/90"
                size="lg"
                onClick={handleCta}
              >
                {slide.cta}
                <ArrowRight size={16} />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
