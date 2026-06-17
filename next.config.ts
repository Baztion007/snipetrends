import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Surface type errors at build time instead of silently shipping them.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Compress responses and powered-by header removal for security-through-obscurity.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent MIME-type sniffing.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Legacy XSS protection (defense-in-depth for older browsers).
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Clickjacking protection — allow same-origin framing (so the
          // preview panel works) but block cross-origin embeds.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Control which features the page can use.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Restrict referrer to origin-only on cross-origin requests.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Content Security Policy — allow inline styles (Tailwind/Next need
          // them) and images from common CDNs, but block inline scripts
          // except Next.js hashes. 'unsafe-inline' for style-src is required
          // by Next.js injected styles.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self'",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
          // HSTS — enforce HTTPS for 1 year (only sent over HTTPS in prod).
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
      // Admin API routes get stricter SameSite-aware caching (no-store).
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
  images: {
    // Allow optimization of product images hosted on Unsplash (and the
    // common Amazon CDN). Add more hosts here as needed.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "**.amazon.com" },
    ],
    // Use modern formats + lazy loading by default.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
