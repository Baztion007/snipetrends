"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  PackageOpen,
  Loader2,
  BarChart3,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatPrice, formatCompact, discountPercent } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { ProductFormDialog } from "./ProductFormDialog";
import { ClickDetailDialog } from "./ClickDetailDialog";
import { BulkImportDialog } from "./BulkImportDialog";

const badgeClass: Record<string, string> = {
  deal: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  bestseller: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  new: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

export function ProductsSection({ categories }: { categories: Category[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [statsProduct, setStatsProduct] = useState<Product | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (catFilter !== "all") params.set("categoryId", catFilter);
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      setProducts(data.products || []);
    } catch (e) {
      toast.error("Failed to load products", {
        description: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [q, catFilter]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/clicks/export?days=30");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `affiliate-clicks-30d-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV exported", { description: "Last 30 days of clicks." });
    } catch (e) {
      toast.error("Export failed", { description: (e as Error).message });
    } finally {
      setExporting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      toast.success("Product deleted", { description: deleting.title });
      setDeleting(null);
      load();
    } catch (e) {
      toast.error("Delete failed", { description: (e as Error).message });
    } finally {
      setDeleteBusy(false);
    }
  };

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} item{products.length === 1 ? "" : "s"} in catalog
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
        <Button
          variant="outline"
          onClick={() => setImportOpen(true)}
          className="gap-2"
        >
          <Upload className="size-4" />
          <span className="hidden sm:inline">Import ASINs</span>
        </Button>
        <Button
          variant="outline"
          onClick={exportCsv}
          disabled={exporting}
          className="gap-2"
        >
          {exporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          <span className="hidden sm:inline">Export clicks</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <ScrollArea className="max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur z-10">
              <TableRow>
                <TableHead className="w-[70px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Stock
                </TableHead>
                <TableHead className="hidden lg:table-cell">Badge</TableHead>
                <TableHead className="hidden xl:table-cell text-right">
                  Rating
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-12 w-12 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="ml-auto h-4 w-10" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Skeleton className="ml-auto h-4 w-14" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <PackageOpen className="h-8 w-8" />
                      <p className="text-sm">No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const disc = discountPercent(p.price, p.compareAtPrice);
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <p className="font-medium truncate">{p.title}</p>
                        {p.brand && (
                          <p className="text-xs text-muted-foreground">
                            {p.brand}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {catName(p.categoryId)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-semibold">{formatPrice(p.price)}</div>
                        {p.compareAtPrice && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatPrice(p.compareAtPrice)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right">
                        <span
                          className={
                            p.stock < 50
                              ? "text-rose-600 font-medium"
                              : p.stock < 100
                              ? "text-amber-600"
                              : ""
                          }
                        >
                          {p.stock}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {p.badge ? (
                          <Badge
                            variant="outline"
                            className={badgeClass[p.badge] || ""}
                          >
                            {p.badge}
                            {disc ? ` -${disc}%` : ""}
                          </Badge>
                        ) : disc ? (
                          <Badge variant="outline">-{disc}%</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-right">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {p.rating.toFixed(1)}
                          <span className="text-muted-foreground">
                            ({formatCompact(p.reviewCount)})
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setStatsProduct(p)}
                            className="h-8 w-8"
                            aria-label={`Click stats for ${p.title}`}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(p)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleting(p)}
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        categories={categories}
        onSaved={load}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleting?.title}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteBusy}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleteBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClickDetailDialog
        product={statsProduct}
        onOpenChange={(o) => !o && setStatsProduct(null)}
      />
      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        categories={categories}
        onDone={load}
      />
    </div>
  );
}

export default ProductsSection;
