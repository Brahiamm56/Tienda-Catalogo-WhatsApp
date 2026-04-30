import type { CSSProperties } from "react";

import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Sans } from "next/font/google";

import { getStoreSettings } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { storeSettingsSchema } from "@/schemas/settings";

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

const CARD_RADIUS_MAP: Record<string, string> = {
  none: "0px", sm: "0.25rem", md: "0.5rem", lg: "0.75rem",
  xl: "1rem", "2xl": "1.5rem", full: "9999px",
};
const BUTTON_RADIUS_MAP: Record<string, string> = {
  none: "0px", sm: "0.25rem", md: "0.5rem", lg: "0.75rem", full: "9999px",
};

function getContrastColor(hex: string) {
  let cleaned = hex.replace("#", "");
  if (cleaned.length === 3) {
    cleaned = cleaned.split("").map((c) => c + c).join("");
  }
  if (cleaned.length !== 6) return "#ffffff";

  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

// Strict re-validation: even if DB has been tampered with, only validated values
// (hex colors / known enum keys) reach the rendered style attribute. React escapes
// values placed in `style`, so CSS injection / breakout is not possible.
function buildThemeStyle(rawSettings: unknown): CSSProperties {
  const parsed = storeSettingsSchema.safeParse(rawSettings);
  if (!parsed.success) return {};
  const s = parsed.data;
  const style: Record<string, string> = {};
  if (s.themeAccent) {
    style["--accent"] = s.themeAccent;
    style["--accent-fg"] = getContrastColor(s.themeAccent);
  }
  if (s.themeAccentStrong) style["--accent-strong"] = s.themeAccentStrong;
  if (s.themeBackground) style["--background"] = s.themeBackground;
  if (s.themeCardBg) style["--card-bg"] = s.themeCardBg;
  if (s.themeCardBorder) style["--card-border"] = s.themeCardBorder;
  if (s.themeCardRadius) style["--card-radius"] = CARD_RADIUS_MAP[s.themeCardRadius] ?? "1rem";
  if (s.themeButtonRadius) style["--btn-radius"] = BUTTON_RADIUS_MAP[s.themeButtonRadius] ?? "9999px";
  return style as CSSProperties;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();
  const themeStyle = buildThemeStyle(settings);

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          displayFont.variable,
          bodyFont.variable,
          "min-h-screen bg-[var(--background)] font-[family-name:var(--font-sans)] text-[var(--foreground)] antialiased",
        )}
        style={themeStyle}
      >
        {children}
      </body>
    </html>
  );
}
