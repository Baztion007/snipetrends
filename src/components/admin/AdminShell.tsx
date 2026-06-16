"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  BarChart3,
  ShoppingCart,
  LogOut,
  Store,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AdminUser } from "./AdminLogin";

export type AdminSection = "dashboard" | "products" | "orders" | "categories" | "analytics";

interface AdminShellProps {
  user: AdminUser;
  active: AdminSection;
  onSection: (s: AdminSection) => void;
  onExit: () => void;
  onLoggedOut: () => void;
  children: React.ReactNode;
}

const NAV: { id: AdminSection; label: string; icon: typeof Package }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function SidebarContent({
  user,
  active,
  onSection,
  onExit,
  onLoggedOut,
  onNavigate,
}: {
  user: AdminUser;
  active: AdminSection;
  onSection: (s: AdminSection) => void;
  onExit: () => void;
  onLoggedOut: () => void;
  onNavigate?: () => void;
}) {
  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    toast.success("Signed out");
    onLoggedOut();
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-200">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-zinc-800 shrink-0">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
          <ShieldCheck className="h-5 w-5 text-zinc-950" />
        </div>
        <div className="leading-tight">
          <p className="font-bold text-white text-sm">Affiliate Admin</p>
          <p className="text-[11px] text-zinc-500">Control Center</p>
        </div>
      </div>

      <div className="px-3 py-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-900 px-3 py-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 font-semibold text-sm">
            {(user.username[0] || "A").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name || user.username}
            </p>
            <p className="text-[11px] text-zinc-500 truncate">@{user.username}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSection(item.id);
                onNavigate?.();
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3 space-y-1 shrink-0">
        <button
          onClick={onExit}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
        >
          <Store className="h-4 w-4 shrink-0" />
          View Store
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({
  user,
  active,
  onSection,
  onExit,
  onLoggedOut,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col sticky top-0 h-screen">
        <SidebarContent
          user={user}
          active={active}
          onSection={onSection}
          onExit={onExit}
          onLoggedOut={onLoggedOut}
        />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-zinc-950 border-b border-zinc-800">
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-200 hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <span className="font-semibold text-white text-sm">Admin Panel</span>
          <div className="w-9" />
        </div>
        <SheetContent
          side="left"
          className="w-72 p-0 border-zinc-800"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="relative h-full">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              user={user}
              active={active}
              onSection={onSection}
              onExit={onExit}
              onLoggedOut={onLoggedOut}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminShell;
