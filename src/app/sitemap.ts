import type { MetadataRoute } from "next";

import { getCatalogProducts, getCategories } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.appUrl;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/productos`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/carrito`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];

  const [products, categories] = await Promise.all([
    getCatalogProducts(),
    getCategories(),
  ]);

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/productos/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
    images: [product.image],
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/productos?cat=${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
