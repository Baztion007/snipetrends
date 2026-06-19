"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderOpen, Loader2, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { Category, Product } from "@/lib/types";

interface CollectionRow {
  id: string;
  title: string;
  slug: string;
  type: string;
  published: boolean;
  updatedAt: string;
  _count: { items: number };
}

export function CollectionsSection({ categories }: { categories: Category[] }) {
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionRow | null>(null);
  const [deleting, setDeleting] = useState<CollectionRow | null>(null);
  const [busy, setBusy] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [type, setType] = useState("guide");
  const [published, setPublished] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/collections");
      const data = await res.json();
      setCollections(data.collections || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/products?limit=100");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      /* ignore */
    }
  };

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setCoverImage("");
    setType("guide");
    setPublished(false);
    setSelectedProductIds([]);
    setProductSearch("");
    setFormOpen(true);
    loadProducts();
  };

  const openEdit = async (c: CollectionRow) => {
    setEditing(c);
    setTitle(c.title);
    setSlug(c.slug);
    setType(c.type);
    setPublished(c.published);
    setDescription("");
    setCoverImage("");
    setSelectedProductIds([]);
    setProductSearch("");
    setFormOpen(true);
    loadProducts();
    // Load full collection details
    const res = await fetch(`/api/collections/${c.slug}`);
    const data = await res.json();
    if (data.collection) {
      setDescription(data.collection.description || "");
      setCoverImage(data.collection.coverImage || "");
      setSelectedProductIds(data.collection.items.map((i: { product: { id: string } }) => i.product.id));
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title,
        slug,
        description,
        coverImage,
        type,
        published,
        productIds: selectedProductIds,
      };
      const url = editing ? `/api/admin/collections/${editing.id}` : "/api/admin/collections";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      toast.success(editing ? "Collection updated" : "Collection created");
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error("Save failed", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/collections/${deleting.id}`, { method: "DELETE" });
      toast.success("Collection deleted");
      setDeleting(null);
      load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const filteredProducts = productSearch.trim()
    ? products.filter((p) =>
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(productSearch.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gift guides, editor's picks, and seasonal product lists
          </p>
        </div>
        <Button onClick={openCreate} className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
          <Plus className="mr-2 size-4" />
          New Collection
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <FolderOpen className="size-8" />
            <p className="text-sm">No collections yet. Create a gift guide!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {collections.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                  <FolderOpen className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /{c.slug} · {c._count.items} products
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 capitalize">{c.type}</Badge>
                <Badge
                  variant="outline"
                  className={`shrink-0 ${c.published ? "border-emerald-500/30 text-emerald-600" : "text-muted-foreground"}`}
                >
                  {c.published ? <><Globe className="mr-1 size-3" />Published</> : "Draft"}
                </Badge>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(c)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-rose-600 hover:bg-rose-500/10"
                    onClick={() => setDeleting(c)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
          <form onSubmit={save} className="flex flex-col flex-1 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <DialogTitle>{editing ? "Edit Collection" : "New Collection"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update the collection." : "Create a gift guide or curated product list."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="col-title">Title *</Label>
                <Input id="col-title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={busy} placeholder="Best Wireless Headphones 2024" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="col-slug">Slug (optional)</Label>
                  <Input id="col-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType} disabled={busy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="edit">Editor's Pick</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="col-desc">Description</Label>
                <Textarea id="col-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="col-cover">Cover Image URL</Label>
                <Input id="col-cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." disabled={busy} />
              </div>

              {/* Product selector */}
              <div className="space-y-2">
                <Label>Products in this collection ({selectedProductIds.length} selected)</Label>
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products to add..."
                  disabled={busy}
                  className="mb-2"
                />
                <div className="max-h-40 overflow-y-auto rounded-lg border">
                  <div className="flex flex-col gap-1.5 p-2">
                    {filteredProducts.slice(0, 30).map((p) => (
                      <label key={p.id} className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-muted">
                        <Checkbox
                          checked={selectedProductIds.includes(p.id)}
                          onCheckedChange={() => toggleProduct(p.id)}
                          className="shrink-0"
                        />
                        <span className="truncate text-sm">{p.title}</span>
                        {p.brand && <span className="ml-auto shrink-0 text-xs text-muted-foreground">{p.brand}</span>}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <Label className="cursor-pointer">Published</Label>
                  <p className="text-xs text-muted-foreground">Visible on the storefront</p>
                </div>
                <Switch checked={published} onCheckedChange={setPublished} disabled={busy} />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-6 py-4 shrink-0 bg-background">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={busy}>Cancel</Button>
              <Button type="submit" disabled={busy} className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Create collection"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete "{deleting?.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={busy} className="bg-rose-600 text-white hover:bg-rose-700">
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CollectionsSection;
