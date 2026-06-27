import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  const name = siteConfig.name;
  return {
    name: `${name} — Catálogo de Perfumes`,
    short_name: name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#c9a227",
    orientation: "portrait-primary",
    lang: "es-CO",
    dir: "ltr",
    categories: ["shopping", "lifestyle", "beauty"],
    icons: [
      {
        src: "/perfumes/9pm.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/perfumes/9pm.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
