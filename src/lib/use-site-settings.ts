"use client";

import { useEffect, useState } from "react";

export interface SiteSettings {
  amazonAssociateTag: string;
  amazonBaseUrl: string;
  siteName: string;
  contactEmail: string;
  disclosureOverride: string;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
  socialGithub: string | null;
}

const FALLBACK: SiteSettings = {
  amazonAssociateTag: "",
  amazonBaseUrl: "https://www.amazon.com",
  siteName: "ShopAffiliate",
  contactEmail: "",
  disclosureOverride: "",
  socialTwitter: null,
  socialInstagram: null,
  socialYoutube: null,
  socialGithub: null,
};

/**
 * Fetches public site settings once on mount and caches them in module scope
 * so repeated consumers don't refetch. Used by the header/footer to render
 * the configured site name, contact email, and social links.
 */
let cache: SiteSettings | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

async function loadSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch("/api/settings");
    const data = await res.json();
    const merged = { ...FALLBACK, ...data.settings };
    cache = merged;
    return merged;
  } catch {
    cache = FALLBACK;
    return FALLBACK;
  }
}

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? FALLBACK);

  useEffect(() => {
    let mounted = true;
    if (cache) {
      // Defer to avoid synchronous setState in the effect body.
      Promise.resolve().then(() => {
        if (mounted) setSettings(cache!);
      });
      return;
    }
    listeners.add((s) => {
      if (mounted) setSettings(s);
    });
    loadSettings().then((s) => {
      if (mounted) setSettings(s);
      listeners.forEach((l) => l(s));
    });
    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}
