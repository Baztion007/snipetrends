"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Tags,
  MousePointerClick,
  Star,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Crown,
  ExternalLink,
} from "lucide-react";
import {
  Area,
  AreaChart,
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

const CAT_COLORS = ["#f59e0b", "#10b981", "#f43f5e", "#8b5cf6", "#06b6d4", "#a3a3a3"];

interface DashboardData {
  stats: {
    totalProducts: number;
    totalCategories: number;
    totalClicks: number;
    featuredCount: number;
    lowStock: number;
    catalogValue: number;
  };
  clicksPerDay: { date: string; count: number }[];
  clicksByCategory: { name: string; clicks: number }[];
  topProducts: {
    id: string;
    title: string;
    image: string;
    price: number;
    clicks: number;
  }[];
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  tint,
  loading,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  sub?: string;
  tint: "amber" | "emerald" | "rose" | "violet" | "sky" | "zinc";
  loading?: boolean;
}) {
  const tints: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    rose: "bg-rose-500/10 text-rose-500",
    violet: "bg-violet-500/10 text-violet-500",
    sky: "bg-cyan-500/10 text-cyan-500",
    zinc: "bg-zinc-500/10 text-zinc-500",
  };
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : (
              <p className="mt-1.5 text-2xl font-bold tracking-tight truncate">
                {value}
              </p>
            )}
            {sub && !loading && (
              <p className="mt-0.5 text-xs text-muted-foreground truncate">{sub}</p>
            )}
          </div>
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tints[tint]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSection() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxClick = data
    ? Math.max(1, ...data.clicksPerDay.map((d) => d.count))
    : 1;

  const totalCatClicks = data
    ? data.clicksByCategory.reduce((s, c) => s + c.clicks, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Affiliate performance — clicks drive your Amazon commission
        </p>
      </div>

      {error && (
        <Card className="border-rose-500/40 bg-rose-500/5">
          <CardContent className="p-4 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Hero affiliate metric */}
      <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-emerald-500/5">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/15 text-amber-500">
                <MousePointerClick className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total Affiliate Clicks
                </p>
                {loading ? (
                  <Skeleton className="mt-1 h-9 w-28" />
                ) : (
                  <p className="text-3xl font-bold tracking-tight">
                    {formatCompact(data?.stats.totalClicks ?? 0)}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Click-throughs to Amazon generate your commission
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <ExternalLink className="size-3.5" />
              Revenue is reported by Amazon Associates
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          icon={Package}
          label="Products"
          value={data ? String(data.stats.totalProducts) : ""}
          tint="amber"
          loading={loading}
        />
        <KpiCard
          icon={Tags}
          label="Categories"
          value={data ? String(data.stats.totalCategories) : ""}
          tint="emerald"
          loading={loading}
        />
        <KpiCard
          icon={Star}
          label="Featured"
          value={data ? String(data.stats.featuredCount) : ""}
          tint="sky"
          loading={loading}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Low Stock"
          value={data ? String(data.stats.lowStock) : ""}
          tint="rose"
          loading={loading}
        />
        <KpiCard
          icon={DollarSign}
          label="Catalog Value"
          value={data ? formatPrice(data.stats.catalogValue) : ""}
          tint="zinc"
          loading={loading}
        />
      </div>

      {/* Clicks chart + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              Affiliate Clicks · Last 14 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={data?.clicksPerDay ?? []}
                  margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="clickFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    labelFormatter={(d: string) => d}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fill="url(#clickFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#f59e0b" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Peak: {maxClick} clicks/day
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-4 w-4 text-amber-500" />
              Top by Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.topProducts.length ? (
              <ul className="space-y-3">
                {data.topProducts.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-600">
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
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-emerald-600">
                      {p.clicks}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No click data yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clicks by category */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Tags className="h-4 w-4 text-emerald-500" />
            Clicks by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[240px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={data?.clicksByCategory ?? []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border) / 0.5)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
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
                <Bar dataKey="clicks" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {(data?.clicksByCategory ?? []).map((_, i) => (
                    <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {totalCatClicks} total clicks across all categories
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardSection;
