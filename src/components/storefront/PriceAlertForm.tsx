"use client";

import { useState } from "react";
import { Bell, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

interface PriceAlertFormProps {
  product: Product;
}

export function PriceAlertForm({ product }: PriceAlertFormProps) {
  const [email, setEmail] = useState("");
  const [threshold, setThreshold] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !threshold) return;
    setBusy(true);
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          productId: product.id,
          threshold: Number(threshold),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setDone(true);
      toast.success("Price alert set!", {
        description: data.message,
      });
    } catch (err) {
      toast.error("Could not set alert", {
        description: (err as Error).message,
      });
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-xs">
        <Check className="size-4 shrink-0 text-emerald-500" />
        <span className="text-emerald-700 dark:text-emerald-400">
          Price alert active — we'll email you when the price drops.
        </span>
        <button
          onClick={() => {
            setDone(false);
            setEmail("");
            setThreshold("");
          }}
          className="ml-auto text-xs text-muted-foreground underline hover:text-foreground"
        >
          Set another
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <Bell className="size-3.5" />
        Price-drop alert
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Get notified by email when the price drops on Amazon.
      </p>
      <form onSubmit={submit} className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={busy}
          className="h-9 flex-1 text-sm"
          aria-label="Email address"
        />
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="threshold"
            required
            min="0"
            step="0.01"
            disabled={busy}
            className="h-9 w-full pl-6 text-sm sm:w-28"
            aria-label="Price threshold"
          />
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="h-9 gap-1.5 bg-amber-500 text-zinc-950 hover:bg-amber-400"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Bell className="size-3.5" />}
          <span className="text-xs">Set alert</span>
        </Button>
      </form>
    </div>
  );
}

export default PriceAlertForm;
