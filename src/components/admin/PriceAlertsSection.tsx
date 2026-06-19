"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlertRow {
  id: string;
  email: string;
  threshold: number;
  triggered: boolean;
  triggeredAt: string | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    image: string;
    price: number;
  } | null;
}

export function PriceAlertsSection() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });
    fetch(`/api/admin/price-alerts?filter=${filter}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setAlerts(d.alerts || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Price Alerts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visitors subscribed to price-drop notifications
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All alerts</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="triggered">Triggered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Bell className="size-8" />
            <p className="text-sm">No price alerts yet. Visitors can subscribe from product pages.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[600px] rounded-xl border">
          <div className="space-y-1 p-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                {a.product && (
                  <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    <img src={a.product.image} alt="" className="size-full object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {a.product?.title || "Unknown product"}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Mail className="size-3" />
                    {a.email}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">${a.threshold.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">threshold</p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 ${a.triggered ? "border-emerald-500/30 text-emerald-600" : "text-muted-foreground"}`}
                >
                  {a.triggered ? "Triggered" : "Waiting"}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default PriceAlertsSection;
