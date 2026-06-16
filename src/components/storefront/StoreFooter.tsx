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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const columns = [
  {
    title: "About",
    links: [
      "Our story",
      "Careers",
      "Press",
      "Sustainability",
      "Investor relations",
    ],
  },
  {
    title: "Earn / Affiliate",
    links: [
      "Become an affiliate",
      "Affiliate program",
      "Creator hub",
      "Commission rates",
      "Resources",
    ],
  },
  {
    title: "Help",
    links: ["Contact us", "Shipping", "Returns", "Track order", "FAQ"],
  },
  {
    title: "Connect",
    links: ["Blog", "Newsletter", "Community", "Events", "Partnerships"],
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
              Curated affiliate picks from brands you trust. Every purchase
              supports independent creators.
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
                  placeholder="Your email"
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
              <h3 className="text-sm font-semibold text-white">
                {col.title}
              </h3>
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
          <p className="text-center text-xs text-zinc-500 sm:text-left">
            © {new Date().getFullYear()} ShopAffiliate. All rights reserved.
            As an Amazon Associate we earn from qualifying purchases.
          </p>
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
