"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Crown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatCompact } from "@/lib/format";

interface AnalyticsData {
  stats: {
    totalProducts: number;
    totalCategories: number;
    totalClicks: number;
    featuredCount: number;
    lowStock: number;
    catalogValue: number;
  };
  clicksPerDay: { date: string; count: number }[];
  topProducts: {
    id: string;
    title: string;
    image: string;
    price: number;
    clicks: number;
  }[];
}

const BAR_COLORS = ["#f59e0b", "#10b981", "#f43f5e", "#8b5cf6", "#06b6d4"];

export function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalClicks = data?.stats.totalClicks ?? 0;
  const last7 =
    data?.clicksPerDay.slice(-7).reduce((s, d) => s + d.count, 0) ?? 0;
  const prev7 =
    data?.clicksPerDay.slice(-14, -7).reduce((s, d) => s + d.count, 0) ?? 0;
  const trend =
    prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Affiliate click performance · last 14 days
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <MousePointerClick className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total clicks
                </p>
                {loading ? (
                  <Skeleton className="mt-1 h-7 w-20" />
                ) : (
                  <p className="text-2xl font-bold">
                    {formatCompact(totalClicks)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Last 7 days
                </p>
                {loading ? (
                  <Skeleton className="mt-1 h-7 w-20" />
                ) : (
                  <p className="text-2xl font-bold">
                    {last7}
                    {trend !== null && (
                      <span
                        className={`ml-2 text-sm font-medium ${
                          trend >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Catalog value
                </p>
                {loading ? (
                  <Skeleton className="mt-1 h-7 w-24" />
                ) : (
                  <p className="text-2xl font-bold">
                    {formatPrice(data?.stats.catalogValue ?? 0)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-amber-500" />
            Daily Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data?.clicksPerDay ?? []}
                margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border) / 0.5)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(d: string) => d.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={42}>
                  {(data?.clicksPerDay ?? []).map((_, i) => (
                    <Cell
                      key={i}
                      fill={BAR_COLORS[i % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top products table */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-amber-500" />
            Top Products by Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : data?.topProducts.length ? (
            <div className="space-y-2">
              {data.topProducts.map((p, i) => {
                const maxClicks = data.topProducts[0].clicks || 1;
                const pct = Math.round((p.clicks / maxClicks) * 100);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-600">
                      {i + 1}
                    </span>
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img
                        src={p.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        {p.clicks}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No click data yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsSection;
