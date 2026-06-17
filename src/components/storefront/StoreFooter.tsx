"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Mail,
  ArrowRight,
  Info,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSiteSettings } from "@/lib/use-site-settings";

export type FooterNav =
  | "deals"
  | "top-rated"
  | "new"
  | "all-categories"
  | "how-we-curate"
  | "our-mission"
  | "editorial-guidelines"
  | "contact"
  | "affiliate-disclosure"
  | "how-we-make-money"
  | "privacy"
  | "terms"
  | "using-this-site"
  | "faq"
  | "report-issue"
  | "accessibility";

// Affiliate-relevant footer. "Affiliate disclosure" and the bottom-bar
// disclaimer are required by the Amazon Associates Operating Agreement.
const columns: { title: string; links: { label: string; nav: FooterNav }[] }[] = [
  {
    title: "Browse",
    links: [
      { label: "Today's Deals", nav: "deals" },
      { label: "Top Rated", nav: "top-rated" },
      { label: "New Arrivals", nav: "new" },
      { label: "All Categories", nav: "all-categories" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "How we curate", nav: "how-we-curate" },
      { label: "Our mission", nav: "our-mission" },
      { label: "Editorial guidelines", nav: "editorial-guidelines" },
      { label: "Contact us", nav: "contact" },
    ],
  },
  {
    title: "Disclosure",
    links: [
      { label: "Affiliate disclosure", nav: "affiliate-disclosure" },
      { label: "How we make money", nav: "how-we-make-money" },
      { label: "Privacy policy", nav: "privacy" },
      { label: "Terms of use", nav: "terms" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Using this site", nav: "using-this-site" },
      { label: "FAQ", nav: "faq" },
      { label: "Report an issue", nav: "report-issue" },
      { label: "Accessibility", nav: "accessibility" },
    ],
  },
];

const socials = [
  { icon: Twitter, label: "Twitter", key: "socialTwitter" as const },
  { icon: Instagram, label: "Instagram", key: "socialInstagram" as const },
  { icon: Youtube, label: "YouTube", key: "socialYoutube" as const },
  { icon: Github, label: "GitHub", key: "socialGithub" as const },
];

// Longer informational blurbs shown in a toast for legal/about links.
const infoText: Partial<Record<FooterNav, { title: string; body: string }>> = {
  "how-we-curate": {
    title: "How we curate",
    body: "Our editors research and test products across categories. We prioritize verified reviews, value, and long-term reliability.",
  },
  "our-mission": {
    title: "Our mission",
    body: "To help you make confident buying decisions by surfacing the best products — without the noise.",
  },
  "editorial-guidelines": {
    title: "Editorial guidelines",
    body: "Recommendations are independent. Affiliate relationships never influence ratings or placement.",
  },
  contact: {
    title: "Contact us",
    body: "", // filled dynamically in handleNav
  },
  "affiliate-disclosure": {
    title: "Affiliate disclosure",
    body: "As an Amazon Associate, ShopAffiliate earns from qualifying purchases at no extra cost to you.",
  },
  "how-we-make-money": {
    title: "How we make money",
    body: "We earn a small commission when you buy through our links. This never affects the price you pay.",
  },
  privacy: {
    title: "Privacy policy",
    body: "We only store what's needed to run the site (cart, wishlist in your browser). No third-party tracking beyond analytics.",
  },
  terms: {
    title: "Terms of use",
    body: "Content is for general information. Prices and availability are set by Amazon and may change.",
  },
  "using-this-site": {
    title: "Using this site",
    body: "Browse, filter, and compare. Click 'View on Amazon' on any product to complete your purchase on Amazon.",
  },
  faq: {
    title: "FAQ",
    body: "Q: Do I pay more? A: No — the price is identical. Q: Who handles shipping? A: Amazon, with Prime benefits.",
  },
  "report-issue": {
    title: "Report an issue",
    body: "", // filled dynamically in handleNav
  },
  accessibility: {
    title: "Accessibility",
    body: "We aim for WCAG 2.1 AA. Keyboard navigation, ARIA labels, and contrast are prioritized throughout.",
  },
};

interface StoreFooterProps {
  onNavigate?: (nav: FooterNav) => void;
}

export function StoreFooter({ onNavigate }: StoreFooterProps) {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const settings = useSiteSettings();
  const { siteName, contactEmail, disclosureOverride, socialTwitter, socialInstagram, socialYoutube, socialGithub } = settings;
  const socialMap = { socialTwitter, socialInstagram, socialYoutube, socialGithub };
  const contactInfo = contactEmail || "hello@shopaffiliate.example";
  const disclosureText = disclosureOverride?.trim()
    ? disclosureOverride
    : `As an Amazon Associate, ${siteName} earns from qualifying purchases. Prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply.`;

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Subscription failed");
      toast.success("Subscribed!", {
        description: "You'll receive the best deals in your inbox.",
      });
      setEmail("");
    } catch (err) {
      toast.error("Could not subscribe", {
        description: (err as Error).message,
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleNav = (nav: FooterNav) => {
    // Browse links delegate to the parent for real filtering actions.
    const browseNavs: FooterNav[] = ["deals", "top-rated", "new", "all-categories"];
    if (browseNavs.includes(nav)) {
      onNavigate?.(nav);
      return;
    }
    // Info/legal links show a toast summary (no dedicated pages exist yet).
    const info = infoText[nav];
    if (info) {
      let body = info.body;
      if (nav === "contact") body = `Email ${contactInfo} with questions or partnership inquiries.`;
      if (nav === "report-issue") body = `Spotted a broken link? Email ${contactInfo}. Thanks for helping us improve!`;
      if (nav === "affiliate-disclosure") body = `As an Amazon Associate, ${siteName} earns from qualifying purchases at no extra cost to you.`;
      toast(info.title, { description: body });
    }
  };

  return (
    <footer className="mt-auto bg-zinc-950 text-zinc-300">
      {/* Affiliate disclosure banner (Amazon Associates requirement) */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-zinc-400">
            <span className="font-semibold text-zinc-200">
              Affiliate disclosure:
            </span>{" "}
            {disclosureText}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand + newsletter */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-amber-500 text-zinc-950">
                <ShoppingBag size={18} />
              </span>
              <span className="text-lg font-bold text-white">
                {siteName}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-zinc-400">
              We independently research and recommend the best products. When
              you buy through our links, we may earn a commission — at no extra
              cost to you.
            </p>
            <form
              onSubmit={subscribe}
              className="mt-4 flex gap-2"
              aria-label="Subscribe to newsletter"
            >
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Get the best deals by email"
                  aria-label="Email address"
                  className="border-zinc-700 bg-zinc-900 pl-9 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-amber-500"
                />
              </div>
              <Button
                type="submit"
                disabled={subscribing}
                className="bg-amber-500 text-zinc-950 hover:bg-amber-600"
                aria-label="Subscribe"
              >
                {subscribing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </Button>
            </form>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      type="button"
                      onClick={() => handleNav(l.nav)}
                      className="text-left text-sm text-zinc-400 transition-colors hover:text-amber-400"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-6 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p className="text-center text-xs text-zinc-500 sm:text-left">
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 text-center text-[11px] text-zinc-600 sm:text-left">
              <ShieldCheck className="size-3 text-emerald-500" />
              Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or
              its affiliates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {socials.map((s) => {
              const url = socialMap[s.key];
              if (!url) return null;
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-zinc-400 transition-colors hover:text-amber-400"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default StoreFooter;
