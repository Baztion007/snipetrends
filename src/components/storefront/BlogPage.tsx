"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  FileText,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { BackToTop } from "./BackToTop";
import { useSiteSettings } from "@/lib/use-site-settings";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string | null;
  publishedAt: string | null;
  content?: string;
}

interface BlogPageProps {
  onBack: () => void;
  onOpenAdmin: () => void;
}

export function BlogPage({ onBack, onOpenAdmin }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const { siteName } = useSiteSettings();

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSlug) {
      Promise.resolve().then(() => setSelectedPost(null));
      return;
    }
    Promise.resolve().then(() => setPostLoading(true));
    fetch(`/api/blog/${selectedSlug}`)
      .then((r) => r.json())
      .then((d) => setSelectedPost(d.post || null))
      .catch(() => setSelectedPost(null))
      .finally(() => setPostLoading(false));
  }, [selectedSlug]);

  // Article view
  if (selectedSlug) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <StoreHeader
          onOpenAdmin={onOpenAdmin}
          onOpenBlog={onBack}
          onOpenWishlist={() => {}}
          onSearch={() => {}}
          categories={[]}
          activeCategory={null}
          onCategory={() => {}}
        />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <button
              onClick={() => setSelectedSlug(null)}
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to blog
            </button>

            {postLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : selectedPost ? (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {selectedPost.category && (
                  <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    {selectedPost.category}
                  </span>
                )}
                <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                  {selectedPost.title}
                </h1>
                {selectedPost.publishedAt && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    {new Date(selectedPost.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {selectedPost.coverImage && (
                  <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-muted">
                    <img
                      src={selectedPost.coverImage}
                      alt={selectedPost.title}
                      className="size-full object-cover"
                    />
                  </div>
                )}
                {selectedPost.excerpt && (
                  <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                    {selectedPost.excerpt}
                  </p>
                )}
                <div className="article-content mt-6">
                  <ReactMarkdown>{selectedPost.content || ""}</ReactMarkdown>
                </div>
                {selectedPost.tags && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {selectedPost.tags.split(",").map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        <Tag className="size-3" />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </motion.article>
            ) : (
              <div className="py-16 text-center">
                <FileText className="mx-auto size-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Post not found.</p>
                <Button onClick={() => setSelectedSlug(null)} className="mt-4">
                  Back to blog
                </Button>
              </div>
            )}
          </div>
        </main>
        <StoreFooter />
        <BackToTop />
      </div>
    );
  }

  // Blog list view
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader
        onOpenAdmin={onOpenAdmin}
        onOpenBlog={onBack}
        onOpenWishlist={() => {}}
        onSearch={() => {}}
        categories={[]}
        activeCategory={null}
        onCategory={() => {}}
      />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to store
          </button>

          <div className="mb-8">
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500 text-zinc-950">
                <FileText className="size-6" />
              </span>
              Blog & Guides
            </h1>
            <p className="mt-2 text-muted-foreground">
              Buying guides, reviews, and deal alerts from {siteName}
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <FileText className="size-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No articles yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check back soon for buying guides and reviews!
                  </p>
                </div>
                <Button onClick={onBack} variant="outline" className="mt-2 gap-2">
                  <ShoppingBag className="size-4" />
                  Browse products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map((post, i) => (
                <motion.button
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={() => setSelectedSlug(post.slug)}
                  className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-lg"
                >
                  {post.coverImage ? (
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="grid aspect-video place-items-center bg-gradient-to-br from-amber-500/10 to-emerald-500/10">
                      <FileText className="size-10 text-amber-500/40" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    {post.category && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        {post.category}
                      </span>
                    )}
                    <h2 className="text-lg font-bold leading-tight group-hover:text-amber-600">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      {post.publishedAt && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        Read more
                        <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
      <BackToTop />
    </div>
  );
}

export default BlogPage;
