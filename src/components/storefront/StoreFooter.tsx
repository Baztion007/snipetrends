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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Footer links relevant to an Amazon affiliate recommendation site.
// NOTE: "Affiliate Disclosure" and the bottom-bar disclaimer are required by
// the Amazon Associates Operating Agreement — do not remove them.
const columns = [
  {
    title: "Browse",
    links: ["Today's Deals", "Top Rated", "New Arrivals", "All Categories"],
  },
  {
    title: "About",
    links: ["How we curate", "Our mission", "Editorial guidelines", "Contact us"],
  },
  {
    title: "Disclosure",
    links: [
      "Affiliate disclosure",
      "How we make money",
      "Privacy policy",
      "Terms of use",
    ],
  },
  {
    title: "Help",
    links: ["Using this site", "FAQ", "Report an issue", "Accessibility"],
  },
];

const socials = [
  { icon: Twitter, label: "Twitter" },
  { icon: Instagram, label: "Instagram" },
  { icon: Youtube, label: "YouTube" },
  { icon: Github, label: "GitHub" },
];

export function StoreFooter() {
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    toast.success("Subscribed!", {
      description: "You'll receive the best deals in your inbox.",
    });
    setEmail("");
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
            As an Amazon Associate, ShopAffiliate earns from qualifying
            purchases. Prices and availability are accurate as of the date/time
            indicated and are subject to change. Any price and availability
            information displayed on Amazon at the time of purchase will apply.
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
                Shop<span className="text-amber-400">Affiliate</span>
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
                className="bg-amber-500 text-zinc-950 hover:bg-amber-600"
                aria-label="Subscribe"
              >
                <ArrowRight size={16} />
              </Button>
            </form>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-sm text-zinc-400 transition-colors hover:text-amber-400"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-6 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p className="text-center text-xs text-zinc-500 sm:text-left">
              © {new Date().getFullYear()} ShopAffiliate. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 text-center text-[11px] text-zinc-600 sm:text-left">
              <ShieldCheck className="size-3 text-emerald-500" />
              Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or
              its affiliates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
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
