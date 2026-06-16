"use client";

import { useState } from "react";
import { ShoppingBag, Search, User, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export const DEALS_SENTINEL = "__deals__";

interface StoreHeaderProps {
  onOpenAdmin: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onSearch: (q: string) => void;
  categories: Category[];
  activeCategory: string | null;
  onCategory: (id: string | null) => void;
}

export function StoreHeader({
  onOpenAdmin,
  onOpenCart,
  onOpenWishlist,
  onSearch,
  categories,
  activeCategory,
  onCategory,
}: StoreHeaderProps) {
  const [q, setQ] = useState("");
  const count = useCart((s) => s.totalItems());
  const wishCount = useWishlist((s) => s.count());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(q.trim());
  };

  const goHome = () => {
    setQ("");
    onSearch("");
    onCategory(null);
  };

  return (
    <header className="sticky top-0 z-40 shrink-0">
      {/* Main bar */}
      <div className="bg-zinc-950 text-zinc-100">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-2.5">
          {/* Logo */}
          <button
            onClick={goHome}
            className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="ShopAffiliate home"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-amber-500 text-zinc-950">
              <ShoppingBag size={18} />
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              Shop<span className="text-amber-400">Affiliate</span>
            </span>
          </button>

          {/* Search — desktop */}
          <form
            onSubmit={submit}
            className="hidden flex-1 items-center gap-2 sm:flex"
            role="search"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, brands, and more…"
                aria-label="Search products"
                className="h-10 border-zinc-700 bg-zinc-900 pl-9 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-amber-500 focus-visible:ring-amber-500/30"
              />
            </div>
            <Select
              value={activeCategory ?? "all"}
              onValueChange={(v) => onCategory(v === "all" ? null : v)}
            >
              <SelectTrigger
                className="h-10 w-40 shrink-0 border-zinc-700 bg-zinc-900 text-zinc-100"
                aria-label="Filter by category"
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value={DEALS_SENTINEL}>Today&apos;s Deals</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              size="lg"
              className="h-10 bg-amber-500 text-zinc-950 hover:bg-amber-600"
              aria-label="Search"
            >
              <Search size={16} />
            </Button>
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenWishlist}
              className="relative h-10 w-10 text-zinc-100 hover:bg-zinc-800 hover:text-white"
              aria-label={`Wishlist with ${wishCount} ${wishCount === 1 ? "item" : "items"}`}
            >
              <Heart size={20} />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {wishCount > 99 ? "99+" : wishCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenAdmin}
              className="h-10 gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white"
            >
              <User size={18} />
              <span className="hidden md:inline">Admin</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenCart}
              className="relative h-10 gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white"
              aria-label={`Cart with ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-zinc-950">
                  {count > 99 ? "99+" : count}
                </span>
              )}
              <span className="hidden md:inline">Cart</span>
            </Button>
          </div>
        </div>

        {/* Search — mobile */}
        <form
          onSubmit={submit}
          className="flex items-center gap-2 px-3 pb-2 sm:hidden"
          role="search"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="h-10 border-zinc-700 bg-zinc-900 pl-9 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-amber-500"
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 bg-amber-500 text-zinc-950 hover:bg-amber-600"
            aria-label="Search"
          >
            <Search size={18} />
          </Button>
        </form>
      </div>

      {/* Sub bar — category quick links */}
      <div className="border-b border-zinc-800 bg-zinc-900 text-zinc-100">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-1.5 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <QuickLink
            active={activeCategory === null}
            onClick={() => onCategory(null)}
          >
            All
          </QuickLink>
          <QuickLink
            active={activeCategory === DEALS_SENTINEL}
            onClick={() => onCategory(DEALS_SENTINEL)}
            tone="rose"
          >
            Today&apos;s Deals
          </QuickLink>
          {categories.map((c) => (
            <QuickLink
              key={c.id}
              active={activeCategory === c.id}
              onClick={() => onCategory(c.id)}
            >
              {c.name}
            </QuickLink>
          ))}
        </div>
      </div>
    </header>
  );
}

function QuickLink({
  active,
  onClick,
  children,
  tone = "amber",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "amber" | "rose";
}) {
  const activeClass =
    tone === "rose"
      ? "bg-rose-500 text-white"
      : "bg-amber-500 text-zinc-950";
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? activeClass
          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
