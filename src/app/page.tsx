"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Storefront } from "@/components/storefront";
import { BlogPage } from "@/components/storefront/BlogPage";

// Code-split the admin panel so storefront visitors never download the
// admin bundle (charts, tables, forms). It loads on demand when the user
// clicks "Admin". Shows a lightweight loading skeleton meanwhile.
const AdminPanel = dynamic(
  () => import("@/components/admin").then((m) => m.AdminPanel),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen grid place-items-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-500" />
          <p className="text-sm text-zinc-500">Loading admin…</p>
        </div>
      </div>
    ),
  }
);

type View = "store" | "admin" | "blog";

export default function Home() {
  const [view, setView] = useState<View>("store");

  if (view === "admin") {
    return <AdminPanel onExit={() => setView("store")} />;
  }

  if (view === "blog") {
    return <BlogPage onBack={() => setView("store")} onOpenAdmin={() => setView("admin")} />;
  }

  return (
    <Storefront
      onOpenAdmin={() => setView("admin")}
      onOpenBlog={() => setView("blog")}
    />
  );
}
