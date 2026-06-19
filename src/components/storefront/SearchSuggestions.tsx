"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface SearchSuggestionsProps {
  onSearch: (q: string) => void;
  onSelectProduct?: (product: Product) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchSuggestions({
  onSearch,
  onSelectProduct,
  placeholder = "Search products, brands…",
  className,
  autoFocus,
}: SearchSuggestionsProps) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced suggestion fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = q.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions((data.products || []).slice(0, 6));
        setOpen(true);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex]);
      return;
    }
    onSearch(q.trim());
    setOpen(false);
  };

  const handleSelect = (p: Product) => {
    setQ("");
    setSuggestions([]);
    setOpen(false);
    onSelectProduct?.(p);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={submit} role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => q.trim().length >= 2 && suggestions.length > 0 && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search products"
            aria-expanded={open}
            aria-controls="search-suggestions"
            autoComplete="off"
            autoFocus={autoFocus}
            className="h-10 border-zinc-700 bg-zinc-900 pl-9 pr-9 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-amber-500 focus-visible:ring-amber-500/30"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setSuggestions([]);
                setOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        >
          <p className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <TrendingUp className="size-3" />
            {loading ? "Searching…" : "Product suggestions"}
          </p>
          <ul className="max-h-80 overflow-y-auto">
            {suggestions.map((p, i) => (
              <li key={p.id} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onClick={() => handleSelect(p)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                    i === activeIndex ? "bg-zinc-800" : "hover:bg-zinc-800/60"
                  )}
                >
                  <div className="size-10 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                    <img src={p.image} alt="" className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">{p.title}</p>
                    {p.brand && (
                      <p className="truncate text-xs text-emerald-400">{p.brand}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs text-zinc-500">
                    <span className="text-amber-400">★</span>
                    {p.rating.toFixed(1)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchSuggestions;
