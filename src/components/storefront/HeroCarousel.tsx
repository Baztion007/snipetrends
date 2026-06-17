"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Zap, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeroAction {
  type: "deals" | "top-rated" | "new";
}

interface Slide {
  title: string;
  /** Highlighted accent word in the title. */
  accent: string;
  subtitle: string;
  cta: string;
  gradient: string;
  /** Decorative floating shapes color. */
  glow1: string;
  glow2: string;
  badge: string;
  badgeIcon: typeof Zap;
  stat: { value: string; label: string };
  action: HeroAction["type"];
}

const slides: Slide[] = [
  {
    title: "Mega Tech",
    accent: "Sale",
    subtitle:
      "Hand-picked deals on top-rated electronics, refreshed daily. Don't miss out — prices change fast.",
    cta: "Shop deals",
    gradient: "from-amber-600 via-orange-600 to-rose-600",
    glow1: "bg-amber-300/30",
    glow2: "bg-rose-400/20",
    badge: "Limited time",
    badgeIcon: Zap,
    stat: { value: "60%", label: "Max savings" },
    action: "deals",
  },
  {
    title: "Top Rated",
    accent: "Picks",
    subtitle:
      "Thousands of verified reviews analyzed. We only recommend products worth your money.",
    cta: "Browse top rated",
    gradient: "from-emerald-600 via-teal-600 to-emerald-700",
    glow1: "bg-emerald-300/30",
    glow2: "bg-teal-400/20",
    badge: "Editor's choice",
    badgeIcon: Star,
    stat: { value: "4.7★", label: "Avg rating" },
    action: "top-rated",
  },
  {
    title: "Fresh",
    accent: "Drops",
    subtitle:
      "Discover what's trending right now. New arrivals from emerging brands, updated weekly.",
    cta: "Explore new",
    gradient: "from-rose-600 via-orange-500 to-amber-500",
    glow1: "bg-rose-300/30",
    glow2: "bg-amber-400/20",
    badge: "Just landed",
    badgeIcon: Sparkles,
    stat: { value: "Weekly", label: "New picks" },
    action: "new",
  },
];

interface HeroCarouselProps {
  onAction: (action: HeroAction) => void;
}

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ onAction }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = slides[index];
  const BadgeIcon = slide.badgeIcon;

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
      <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-zinc-900/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
              "relative flex min-h-[260px] flex-col justify-center overflow-hidden bg-gradient-to-br p-6 sm:min-h-[340px] sm:p-12 lg:p-16",
              slide.gradient
            )}
            aria-live="polite"
          >
            {/* Decorative animated glows */}
            <motion.div
              className={cn(
                "pointer-events-none absolute -right-20 -top-20 size-72 rounded-full blur-3xl",
                slide.glow1
              )}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={cn(
                "pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full blur-3xl",
                slide.glow2
              )}
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Subtle grid pattern overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-4">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md ring-1 ring-white/20">
                  <BadgeIcon className="size-3.5" />
                  {slide.badge}
                </span>
              </motion.div>

              {/* Title with accent word */}
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-2xl text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                {slide.title}{" "}
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  {slide.accent}
                </span>
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-md text-sm leading-relaxed text-white/85 sm:text-base lg:text-lg"
              >
                {slide.subtitle}
              </motion.p>

              {/* CTA + stat row */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-2 flex flex-wrap items-center gap-4"
              >
                <Button
                  className="group h-12 gap-2 bg-white text-zinc-900 shadow-lg shadow-black/20 hover:bg-white/90 hover:shadow-xl"
                  size="lg"
                  onClick={handleCta}
                >
                  {slide.cta}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Button>

                {/* Stat chip */}
                <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/15">
                  <span className="text-2xl font-black text-white">
                    {slide.stat.value}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-white/70">
                    {slide.stat.label}
                  </span>
                </div>
              </motion.div>

              {/* Trust signal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-1 flex items-center gap-1.5 text-xs text-white/60"
              >
                <ShieldCheck className="size-3.5" />
                <span>Independent reviews · Amazon Associate</span>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar + dot indicators */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Autoplay progress bar */}
          <div className="h-0.5 w-full bg-white/10">
            <motion.div
              key={index + (paused ? "-p" : "")}
              className="h-full bg-white/60"
              initial={{ width: "0%" }}
              animate={paused ? { width: "0%" } : { width: "100%" }}
              transition={{
                duration: paused ? 0 : AUTOPLAY_MS / 1000,
                ease: "linear",
              }}
            />
          </div>
          {/* Dots */}
          <div className="flex items-center justify-center gap-2 pb-3 pt-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index
                    ? "w-8 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
