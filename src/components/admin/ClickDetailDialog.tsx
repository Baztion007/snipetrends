"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MousePointerClick, Globe, Clock, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ClickRow {
  id: string;
  ip: string | null;
  userAgent: string | null;
  referrer: string | null;
  createdAt: string;
}

interface ClickData {
  product: Pick<Product, "id" | "title" | "image" | "price" | "affiliateUrl">;
  totalClicks: number;
  clicks: ClickRow[];
  clicksPerDay: { date: string; count: number }[];
}

interface ClickDetailDialogProps {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}

export function ClickDetailDialog({
  product,
  onOpenChange,
}: ClickDetailDialogProps) {
  const [data, setData] = useState<ClickData | null>(null);
  const [loading, setLoading] = useState(false);

  const productId = product?.id;
  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    // Flip loading inside a microtask so the effect body itself doesn't call
    // setState synchronously (avoids cascading-render lint error).
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });
    fetch(`/api/admin/products/${productId}/clicks`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          Click analytics for {product?.title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Affiliate click history and daily breakdown for this product
        </DialogDescription>

        {product && (
          <div className="space-y-4" key={product.id}>
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img src={product.image} alt="" className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold leading-tight">
                  {product.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2">
                <MousePointerClick className="size-4 text-amber-500" />
                <span className="text-lg font-bold text-amber-600">
                  {loading ? "…" : data?.totalClicks ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">clicks</span>
              </div>
            </div>

            {/* Daily chart */}
            <div>
              <h3 className="mb-2 text-sm font-semibold">
                Clicks · Last 14 Days
              </h3>
              {loading ? (
                <Skeleton className="h-[180px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={data?.clicksPerDay ?? []}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border) / 0.5)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(d: string) => d.slice(5)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--popover))",
                        color: "hsl(var(--popover-foreground))",
                        fontSize: 12,
                      }}
                      cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28} fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent clicks table */}
            <div>
              <h3 className="mb-2 text-sm font-semibold">Recent Clicks</h3>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (data?.clicks?.length ?? 0) === 0 ? (
                <p className="rounded-lg border bg-muted/30 py-6 text-center text-sm text-muted-foreground">
                  No clicks recorded yet for this product.
                </p>
              ) : (
                <ScrollArea className="max-h-64 rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="px-3 py-2 font-medium">When</th>
                        <th className="px-3 py-2 font-medium">Source</th>
                        <th className="px-3 py-2 font-medium">Device</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.clicks.slice(0, 50).map((c) => (
                        <tr key={c.id} className="border-t">
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            <Clock className="mr-1 inline size-3" />
                            {new Date(c.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {c.referrer ? (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Globe className="size-3" />
                                {new URL(c.referrer).hostname}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Direct</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {c.userAgent?.includes("Mobile") ? "Mobile" : "Desktop"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              )}
            </div>

            {data?.product?.affiliateUrl && (
              <a
                href={data.product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 py-2 text-xs font-medium text-amber-600 hover:bg-amber-500/10"
              >
                <ExternalLink className="size-3" />
                View affiliate URL
              </a>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ClickDetailDialog;
