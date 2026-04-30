import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Sans } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Studio Catalog",
    template: "%s | Studio Catalog",
  },
  description: "Plantilla reutilizable para tiendas catalogo con checkout directo por WhatsApp y panel de administracion.",
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
        {children}
      </body>
    </html>
  );
}
