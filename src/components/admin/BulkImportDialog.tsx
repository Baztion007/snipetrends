"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Category } from "@/lib/types";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  onDone: () => void;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  categories,
  onDone,
}: BulkImportDialogProps) {
  const [asins, setAsins] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    createdProducts: { asin: string; title: string }[];
    skippedProducts: { asin: string; reason: string }[];
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asins.trim() || !categoryId) {
      toast.error("Paste ASINs and select a category");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asins, categoryId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Import failed");
      setResult(data);
      toast.success(`Imported ${data.created} products`, {
        description: data.skipped ? `${data.skipped} already existed` : undefined,
      });
      onDone();
    } catch (err) {
      toast.error("Import failed", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setAsins("");
    setCategoryId("");
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else onOpenChange(v); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Products</DialogTitle>
          <DialogDescription>
            Paste Amazon ASINs (one per line or comma-separated). Each ASIN creates a
            product with a placeholder title — edit them afterward to add real details.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <CheckCircle2 className="size-5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Import complete
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.created} created · {result.skipped} skipped (already existed)
                </p>
              </div>
            </div>
            {result.createdProducts.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                {result.createdProducts.slice(0, 10).map((p) => (
                  <div key={p.asin} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-mono text-xs">{p.asin}</Badge>
                    <span className="truncate text-muted-foreground">{p.title}</span>
                  </div>
                ))}
              </div>
            )}
            {result.skippedProducts.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Skipped
                </p>
                {result.skippedProducts.map((p) => (
                  <div key={p.asin} className="flex items-center gap-2 text-sm">
                    <AlertCircle className="size-3.5 text-amber-500" />
                    <Badge variant="outline" className="font-mono text-xs">{p.asin}</Badge>
                    <span className="text-muted-foreground">{p.reason}</span>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button onClick={close} className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asins">Amazon ASINs *</Label>
              <Textarea
                id="asins"
                rows={6}
                value={asins}
                onChange={(e) => setAsins(e.target.value)}
                placeholder={"B0CHX1W1XY\nB0CMDRCZBJ\nB0CHKX8W1X\n..."}
                disabled={busy}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                ASINs are 10 characters starting with &quot;B&quot; (found in Amazon URLs: /dp/BXXXXXXXXX)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={busy || categories.length === 0}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close} disabled={busy}>Cancel</Button>
              <Button type="submit" disabled={busy} className="gap-2 bg-amber-500 text-zinc-950 hover:bg-amber-400">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                Import products
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BulkImportDialog;
