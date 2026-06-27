import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/productos", "/productos/*", "/carrito"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/productos", "/productos/*"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*", "/carrito"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/productos", "/productos/*"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*", "/carrito"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/productos", "/productos/*"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*", "/carrito"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/productos", "/productos/*"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*", "/carrito"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/productos", "/productos/*"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*", "/carrito"],
      },
      {
        userAgent: "CCBot",
        allow: ["/", "/productos", "/productos/*"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*", "/carrito"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: ["/", "/productos", "/productos/*"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*", "/carrito"],
      },
      {
        userAgent: "Amazonbot",
        allow: ["/", "/productos", "/productos/*"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*", "/carrito"],
      },
      {
        userAgent: "Bytespider",
        allow: ["/", "/productos", "/productos/*"],
        disallow: ["/admin", "/admin/*", "/login", "/api/*", "/carrito"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
