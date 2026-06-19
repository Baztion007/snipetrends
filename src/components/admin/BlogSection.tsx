"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileText, Loader2, Globe, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPostRow | null>(null);
  const [deleting, setDeleting] = useState<BlogPostRow | null>(null);
  const [busy, setBusy] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("guides");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverImage("");
    setCategory("guides");
    setTags("");
    setPublished(false);
    setFormOpen(true);
  };

  const openEdit = (p: BlogPostRow) => {
    setEditing(p);
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt || "");
    setContent("");
    setCoverImage("");
    setCategory(p.category || "guides");
    setTags("");
    setPublished(p.published);
    setFormOpen(true);
    // Load full content
    fetch(`/api/blog/${p.slug}`).then((r) => r.json()).then((d) => {
      if (d.post) {
        setContent(d.post.content || "");
        setCoverImage(d.post.coverImage || "");
        setTags(d.post.tags || "");
      }
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setBusy(true);
    try {
      const payload = { title, slug, excerpt, content, coverImage, category, tags, published };
      const url = editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      toast.success(editing ? "Post updated" : "Post created");
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
      await fetch(`/api/admin/blog/${deleting.id}`, { method: "DELETE" });
      toast.success("Post deleted");
      setDeleting(null);
      load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog & Content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            SEO articles and buying guides
          </p>
        </div>
        <Button onClick={openCreate} className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
          <Plus className="mr-2 size-4" />
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <FileText className="size-8" />
            <p className="text-sm">No blog posts yet. Create your first guide!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
                </div>
                {p.category && (
                  <Badge variant="outline" className="shrink-0">{p.category}</Badge>
                )}
                <Badge
                  variant="outline"
                  className={`shrink-0 ${p.published ? "border-emerald-500/30 text-emerald-600" : "text-muted-foreground"}`}
                >
                  {p.published ? (
                    <><Globe className="mr-1 size-3" />Published</>
                  ) : (
                    "Draft"
                  )}
                </Badge>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(p)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-rose-600 hover:bg-rose-500/10"
                    onClick={() => setDeleting(p)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Blog Post"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the article." : "Write an SEO buying guide or review."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bp-title">Title *</Label>
              <Input id="bp-title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={busy} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bp-slug">Slug (optional)</Label>
                <Input id="bp-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" disabled={busy} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bp-cat">Category</Label>
                <Input id="bp-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="guides" disabled={busy} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp-excerpt">Excerpt</Label>
              <Input id="bp-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary for the post card" disabled={busy} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp-cover">Cover Image URL</Label>
              <Input id="bp-cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." disabled={busy} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp-content">Content (Markdown)</Label>
              <Textarea id="bp-content" rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="## Best Wireless Headphones 2024..." disabled={busy} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp-tags">Tags (comma-separated)</Label>
              <Input id="bp-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="headphones, wireless, audio" disabled={busy} />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <Label htmlFor="bp-pub" className="cursor-pointer">Published</Label>
                <p className="text-xs text-muted-foreground">Visible on the public blog</p>
              </div>
              <Switch id="bp-pub" checked={published} onCheckedChange={setPublished} disabled={busy} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={busy}>Cancel</Button>
              <Button type="submit" disabled={busy} className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Create post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
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

export default BlogSection;
