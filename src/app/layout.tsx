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
