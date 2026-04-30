import type { CSSProperties } from "react";

import { getStoreSettings } from "@/lib/catalog";
import { storeSettingsSchema } from "@/schemas/settings";

export const dynamic = "force-dynamic";

const CARD_RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",
};

const BUTTON_RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
};

function getContrastColor(hex: string) {
  let cleaned = hex.replace("#", "");
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleaned.length !== 6) return "#ffffff";

  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

// Strict re-validation: even if the DB row is tampered with, only validated
// values (hex colors / known enum keys) reach the rendered style attribute.
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

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();
  const themeStyle = buildThemeStyle(settings);

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"
      style={themeStyle}
    >
      {children}
    </div>
  );
}
