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

export const metadata: Metadata = {
  title: "ShopAffiliate — Earn While You Shop",
  description: "Amazon-style affiliate storefront. Discover top-rated tech, today's best deals, and earn while you shop.",
  keywords: ["affiliate", "deals", "tech", "shopping", "ShopAffiliate"],
  authors: [{ name: "ShopAffiliate" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "ShopAffiliate — Earn While You Shop",
    description: "Discover top-rated tech and today's best deals.",
    siteName: "ShopAffiliate",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
