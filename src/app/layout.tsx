import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shopaffiliate.example";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ShopAffiliate — Top-Rated Tech Picks & Daily Deals",
    template: "%s | ShopAffiliate",
  },
  description:
    "Independently curated tech recommendations. Compare top-rated electronics, today's best deals, and find the right product — then buy securely on Amazon.",
  keywords: [
    "best tech deals",
    "product reviews",
    "top rated electronics",
    "affiliate recommendations",
    "compare gadgets",
    "ShopAffiliate",
  ],
  authors: [{ name: "ShopAffiliate" }],
  creator: "ShopAffiliate",
  publisher: "ShopAffiliate",
  applicationName: "ShopAffiliate",
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
    shortcut: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "ShopAffiliate — Top-Rated Tech Picks & Daily Deals",
    description:
      "Independently curated tech recommendations. Compare top-rated electronics and today's best deals, then buy securely on Amazon.",
    siteName: "ShopAffiliate",
    type: "website",
    url: baseUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopAffiliate — Top-Rated Tech Picks & Daily Deals",
    description:
      "Independently curated tech recommendations and the best daily deals.",
  },
};

// JSON-LD structured data for Organization + WebSite (AEO-friendly).
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ShopAffiliate",
  url: baseUrl,
  description:
    "Independently curated affiliate product recommendations across tech categories.",
  slogan: "Earn while you shop",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ShopAffiliate",
  url: baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured data for search engines / AEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
