"use client";

import { ShoppingBag, Search, User, Heart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSuggestions } from "./SearchSuggestions";
import { useWishlist } from "@/lib/wishlist-store";
import { useSiteSettings } from "@/lib/use-site-settings";
import { useAdminSession } from "@/lib/use-admin-session";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";

export const DEALS_SENTINEL = "__deals__";

interface StoreHeaderProps {
  onOpenAdmin: () => void;
  onOpenBlog: () => void;
  onOpenWishlist: () => void;
  onSearch: (q: string) => void;
  onSelectProduct?: (p: Product) => void;
  categories: Category[];
  activeCategory: string | null;
  onCategory: (id: string | null) => void;
}

export function StoreHeader({
  onOpenAdmin,
  onOpenBlog,
  onOpenWishlist,
  onSearch,
  onSelectProduct,
  categories,
  activeCategory,
  onCategory,
}: StoreHeaderProps) {
  const wishCount = useWishlist((s) => s.count());
  const { siteName } = useSiteSettings();
  const { isAdmin } = useAdminSession();

  const goHome = () => {
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
            aria-label={`${siteName} home`}
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-amber-500 text-zinc-950">
              <ShoppingBag size={18} />
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              {siteName}
            </span>
          </button>

          {/* Search — desktop */}
          <div className="hidden flex-1 items-center gap-2 sm:flex">
            <SearchSuggestions
              onSearch={onSearch}
              onSelectProduct={onSelectProduct}
              className="flex-1"
            />
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
              type="button"
              onClick={() => onSearch("")}
              size="lg"
              className="hidden lg:flex h-10 bg-amber-500 text-zinc-950 hover:bg-amber-600"
              aria-label="Search"
            >
              <Search size={16} />
            </Button>
          </div>

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
              onClick={onOpenBlog}
              className="hidden h-10 gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white md:inline-flex"
            >
              <FileText size={18} />
              <span className="hidden lg:inline">Blog</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenAdmin}
              className="h-10 gap-2 text-zinc-100 hover:bg-zinc-800 hover:text-white"
            >
              <User size={18} />
              <span className="hidden md:inline">{isAdmin ? "Dashboard" : "Sign In"}</span>
            </Button>
          </div>
        </div>

        {/* Search — mobile */}
        <div className="px-3 pb-2 sm:hidden">
          <SearchSuggestions
            onSearch={onSearch}
            onSelectProduct={onSelectProduct}
            placeholder="Search products…"
          />
        </div>
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
