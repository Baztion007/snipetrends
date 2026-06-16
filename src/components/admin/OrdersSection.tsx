"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  Loader2,
  Mail,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/format";

interface OrderRow {
  id: string;
  productId: string;
  quantity: number;
  total: number;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    image: string;
    price: number;
  };
}

const statusConfig: Record<
  string,
  { label: string; class: string; icon: typeof Clock }
> = {
  completed: {
    label: "Completed",
    class: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    class: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    icon: Clock,
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-rose-500/15 text-rose-600 border-rose-500/30",
    icon: XCircle,
  },
};

export function OrdersSection() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rangeFilter, setRangeFilter] = useState<string>("30");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);
      params.set("range", rangeFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, rangeFilter]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const filtered = search.trim()
    ? orders.filter(
        (o) =>
          o.product?.title?.toLowerCase().includes(search.toLowerCase()) ||
          o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
          o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          o.id.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  // Summary stats from the loaded orders
  const totalRevenue = filtered
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + o.total, 0);
  const completedCount = filtered.filter((o) => o.status === "completed").length;
  const pendingCount = filtered.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track affiliate orders and revenue
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Revenue
                </p>
                {loading ? (
                  <Skeleton className="mt-1 h-7 w-24" />
                ) : (
                  <p className="text-xl font-bold">{formatPrice(totalRevenue)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Pending
                </p>
                {loading ? (
                  <Skeleton className="mt-1 h-7 w-12" />
                ) : (
                  <p className="text-xl font-bold">{pendingCount}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Completed
                </p>
                {loading ? (
                  <Skeleton className="mt-1 h-7 w-12" />
                ) : (
                  <p className="text-xl font-bold">{completedCount}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, customer, or order ID…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={rangeFilter} onValueChange={setRangeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <ScrollArea className="max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur z-10">
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ShoppingCart className="h-8 w-8" />
                      <p className="text-sm">No orders found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((o) => {
                  const cfg = statusConfig[o.status] || statusConfig.pending;
                  const SIcon = cfg.icon;
                  return (
                    <TableRow key={o.id} className="hover:bg-muted/40">
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          #{o.id.slice(-6).toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-muted">
                            <img
                              src={o.product?.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <p className="truncate text-sm font-medium">
                            {o.product?.title || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {o.customerName || o.customerEmail ? (
                          <div className="min-w-0">
                            <p className="truncate text-sm">
                              {o.customerName || "—"}
                            </p>
                            {o.customerEmail && (
                              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <Mail className="h-3 w-3 shrink-0" />
                                {o.customerEmail}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Guest</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{o.quantity}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(o.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${cfg.class}`}>
                          <SIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

export default OrdersSection;
