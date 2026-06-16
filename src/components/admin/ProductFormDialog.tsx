"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Category, Product } from "@/lib/types";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null; // null = create
  categories: Category[];
  onSaved: () => void;
}

const BADGES = [
  { value: "__none__", label: "None" },
  { value: "deal", label: "Deal" },
  { value: "bestseller", label: "Bestseller" },
  { value: "new", label: "New" },
];

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSaved,
}: ProductFormDialogProps) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    compareAtPrice: "",
    brand: "",
    categoryId: "",
    badge: "__none__",
    rating: "",
    reviewCount: "",
    stock: "",
    affiliateUrl: "",
    featured: false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        title: product.title,
        description: product.description ?? "",
        image: product.image,
        price: String(product.price),
        compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
        brand: product.brand ?? "",
        categoryId: product.categoryId,
        badge: product.badge ?? "__none__",
        rating: String(product.rating),
        reviewCount: String(product.reviewCount),
        stock: String(product.stock),
        affiliateUrl: product.affiliateUrl,
        featured: product.featured,
      });
    } else {
      setForm({
        title: "",
        description: "",
        image: "",
        price: "",
        compareAtPrice: "",
        brand: "",
        categoryId: categories[0]?.id ?? "",
        badge: "__none__",
        rating: "0",
        reviewCount: "0",
        stock: "0",
        affiliateUrl: "",
        featured: false,
      });
    }
    setErrors({});
  }, [open, product, categories]);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.image.trim()) e.image = "Image URL is required";
    if (form.price === "" || isNaN(Number(form.price)))
      e.price = "Valid price required";
    if (!form.categoryId) e.categoryId = "Category required";
    if (!form.affiliateUrl.trim()) e.affiliateUrl = "Affiliate URL required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      image: form.image.trim(),
      price: Number(form.price),
      compareAtPrice:
        form.compareAtPrice.trim() === "" ? null : Number(form.compareAtPrice),
      brand: form.brand.trim() || null,
      categoryId: form.categoryId,
      badge: form.badge === "__none__" ? null : form.badge,
      rating: form.rating === "" ? 0 : Number(form.rating),
      reviewCount: form.reviewCount === "" ? 0 : Number(form.reviewCount),
      stock: form.stock === "" ? 0 : Number(form.stock),
      affiliateUrl: form.affiliateUrl.trim(),
      featured: form.featured,
      images: [form.image.trim()],
    };

    try {
      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      toast.success(isEdit ? "Product updated" : "Product created", {
        description: payload.title,
      });
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error("Could not save product", {
        description: (err as Error).message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the product details below."
              : "Fill in the details to add a new affiliate product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pf-title">Title *</Label>
            <Input
              id="pf-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              disabled={saving}
            />
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-desc">Description</Label>
            <Textarea
              id="pf-desc"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-image">Image URL *</Label>
            <Input
              id="pf-image"
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="https://..."
              disabled={saving}
            />
            {errors.image && (
              <p className="text-xs text-rose-500">{errors.image}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf-price">Price *</Label>
              <Input
                id="pf-price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                disabled={saving}
              />
              {errors.price && (
                <p className="text-xs text-rose-500">{errors.price}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-compare">Compare-at</Label>
              <Input
                id="pf-compare"
                type="number"
                step="0.01"
                value={form.compareAtPrice}
                onChange={(e) => set("compareAtPrice", e.target.value)}
                placeholder="optional"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-stock">Stock</Label>
              <Input
                id="pf-stock"
                type="number"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf-brand">Brand</Label>
              <Input
                id="pf-brand"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-rating">Rating</Label>
              <Input
                id="pf-rating"
                type="number"
                step="0.1"
                max="5"
                min="0"
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-reviews">Reviews</Label>
              <Input
                id="pf-reviews"
                type="number"
                value={form.reviewCount}
                onChange={(e) => set("reviewCount", e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => set("categoryId", v)}
                disabled={saving || categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-rose-500">{errors.categoryId}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Badge</Label>
              <Select
                value={form.badge}
                onValueChange={(v) => set("badge", v)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BADGES.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-aff">Affiliate URL *</Label>
            <Input
              id="pf-aff"
              value={form.affiliateUrl}
              onChange={(e) => set("affiliateUrl", e.target.value)}
              placeholder="https://..."
              disabled={saving}
            />
            {errors.affiliateUrl && (
              <p className="text-xs text-rose-500">{errors.affiliateUrl}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <Label htmlFor="pf-feat" className="cursor-pointer">
                Featured product
              </Label>
              <p className="text-xs text-muted-foreground">
                Show in featured sections
              </p>
            </div>
            <Switch
              id="pf-feat"
              checked={form.featured}
              onCheckedChange={(v) => set("featured", v)}
              disabled={saving}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEdit ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductFormDialog;
