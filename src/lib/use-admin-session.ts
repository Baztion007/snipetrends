"use client";

import { useEffect, useState } from "react";

/**
 * Lightweight admin session checker for the storefront header.
 * Checks /api/admin/session on mount. Returns { isAdmin, loading }.
 *
 * The cache is cleared on sign-out via invalidateAdminSession(), which
 * forces the next mount to re-check the server.
 */
let cached: boolean | null = null;

export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState<boolean>(cached ?? false);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    // Always fetch from server — don't trust the cache after sign-out.
    // The session check is a tiny endpoint, so the cost is negligible.
    let mounted = true;
    fetch("/api/admin/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted) return;
        const authed = !!data?.authenticated;
        cached = authed;
        setIsAdmin(authed);
      })
      .catch(() => {
        if (!mounted) return;
        cached = false;
        setIsAdmin(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { isAdmin, loading };
}

/** Call this to invalidate the cache (e.g. after sign-out). */
export function invalidateAdminSession() {
  cached = null;
}
