"use server";

import { z } from "zod";

import { getCatalogProducts } from "@/lib/catalog";
import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const querySchema = z.string().trim().min(1).max(60);
const MAX_RESULTS = 5;

export async function searchProducts(query: string) {
  const parsed = querySchema.safeParse(query);
  if (!parsed.success) return [];
  const q = parsed.data;

  // DB-backed path: do the filter in Postgres with insensitive match + LIMIT.
  if (isDatabaseConfigured()) {
    try {
      const rows = await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: {
          category: { select: { name: true, slug: true } },
          images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: MAX_RESULTS,
      });

      return rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.category,
        priceCents: p.priceCents,
        stock: p.stock,
        featured: p.featured,
        image: p.images[0]?.url ?? "",
        accent: "from-[#f6d0c7] via-[#fff8f5] to-[#d9ece8]",
      }));
    } catch {
      return [];
    }
  }

  // Demo / no-DB fallback: filter the in-memory demo set.
  const lowered = q.toLowerCase();
  const products = await getCatalogProducts();
  return products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(lowered) ||
        p.category.name.toLowerCase().includes(lowered) ||
        (p.description && p.description.toLowerCase().includes(lowered)),
    )
    .slice(0, MAX_RESULTS);
}
