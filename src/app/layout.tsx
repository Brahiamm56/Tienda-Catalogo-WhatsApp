import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const bodyFont = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Lion";
const storeDescription =
  process.env.NEXT_PUBLIC_STORE_DESCRIPTION ??
  "Catálogo de perfumes con checkout directo por WhatsApp. Compra fácil, rápido y seguro.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${storeName} — Catálogo de Perfumes por WhatsApp`,
    template: `%s | ${storeName}`,
  },
  description: storeDescription,
  keywords: [
    "perfumes",
    "catálogo de perfumes",
    "comprar perfumes online",
    "perfumes por WhatsApp",
    "tienda de perfumes",
    "fragancias",
    "perfumes originales",
    "perfumes árabes",
    "perfumes unisex",
    "checkout por WhatsApp",
    "catálogo online",
    storeName,
  ],
  authors: [{ name: storeName }],
  creator: storeName,
  publisher: storeName,
  category: "Ecommerce",
  applicationName: storeName,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: appUrl,
    siteName: storeName,
    title: `${storeName} — Catálogo de Perfumes por WhatsApp`,
    description: storeDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${storeName} — Catálogo de Perfumes por WhatsApp`,
    description: storeDescription,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// NOTE: Custom theme colors (background, accent, radii) are intentionally NOT
// applied here. They live only in the (shop) layout so the admin panel keeps
// its own neutral design and is not affected when the merchant changes the
// store theme in /admin/ajustes.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          displayFont.variable,
          bodyFont.variable,
          "min-h-screen bg-[var(--background)] font-[family-name:var(--font-sans)] text-[var(--foreground)] antialiased",
        )}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--accent-ink)]"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
