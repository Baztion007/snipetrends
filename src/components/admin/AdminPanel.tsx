"use client";

import { useEffect, useState } from "react";
import { AdminLogin, type AdminUser } from "./AdminLogin";
import { AdminShell, type AdminSection } from "./AdminShell";
import { DashboardSection } from "./DashboardSection";
import { ProductsSection } from "./ProductsSection";
import { CategoriesSection } from "./CategoriesSection";
import { AnalyticsSection } from "./AnalyticsSection";
import { OrdersSection } from "./OrdersSection";
import type { Category } from "@/lib/types";

interface AdminPanelProps {
  onExit: () => void;
}

export function AdminPanel({ onExit }: AdminPanelProps) {
  const [session, setSession] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [categories, setCategories] = useState<Category[]>([]);

  // Check existing session on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user && !cancelled) {
            setSession({
              username: data.user.username,
              name: data.user.name ?? null,
              role: data.user.role,
            });
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load categories for the products section once authenticated
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (!cancelled && data.categories) setCategories(data.categories);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-500" />
          <p className="text-sm text-zinc-500">Loading admin…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <AdminLogin
        onLoggedIn={(u) => setSession(u)}
        onBack={onExit}
      />
    );
  }

  return (
    <AdminShell
      user={session}
      active={section}
      onSection={setSection}
      onExit={onExit}
      onLoggedOut={() => {
        setSession(null);
        setSection("dashboard");
      }}
    >
      {section === "dashboard" && <DashboardSection />}
      {section === "orders" && <OrdersSection />}
      {section === "products" && <ProductsSection categories={categories} />}
      {section === "categories" && <CategoriesSection />}
      {section === "analytics" && <AnalyticsSection />}
    </AdminShell>
  );
}

export default AdminPanel;
