"use client";

import { useState } from "react";
import { Storefront } from "@/components/storefront";
import { AdminPanel } from "@/components/admin";

type View = "store" | "admin";

export default function Home() {
  const [view, setView] = useState<View>("store");

  if (view === "admin") {
    return <AdminPanel onExit={() => setView("store")} />;
  }

  return <Storefront onOpenAdmin={() => setView("admin")} />;
}
