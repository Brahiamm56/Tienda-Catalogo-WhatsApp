"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { ProductCarousel } from "@/components/shop/product-carousel";
import type { CatalogProduct, CatalogCategory } from "@/lib/catalog";

type CategoryFilterProps = {
  categories: CatalogCategory[];
  allProducts: CatalogProduct[];
  featured: CatalogProduct[];
  recent: CatalogProduct[];
};

const MAX_GRID_PRODUCTS_HOME = 8;

export function CategoryFilter({ categories, allProducts, featured, recent }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredProducts = activeCategory
    ? allProducts.filter((p) => p.category.slug === activeCategory)
    : allProducts;

  const activeCategoryName = activeCategory
    ? categories.find((c) => c.slug === activeCategory)?.name ?? "Productos"
    : null;

  // Count products per category for badge display
  const categoryProductCounts = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.slug] = allProducts.filter((p) => p.category.slug === cat.slug).length;
    return acc;
  }, {});

  // For the home grid, limit products to avoid excessive scroll
  const gridProducts = activeCategory ? filteredProducts : allProducts.slice(0, MAX_GRID_PRODUCTS_HOME);
  const hasMoreProducts = !activeCategory && allProducts.length > MAX_GRID_PRODUCTS_HOME;

  return (
    <>
      {/* Category chips */}
      <section className="px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-light italic tracking-wide text-[var(--foreground)] sm:text-2xl md:text-3xl">
            Explorar por categoría
          </h2>
          <div className="hide-scrollbar mx-0 flex gap-2 overflow-x-auto sm:mx-0 sm:px-0">
            {/* "Todas" chip */}
            <button
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:text-sm ${
                activeCategory === null
                  ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
              }`}
              onClick={() => setActiveCategory(null)}
              type="button"
            >
              Todas
              <span className="ml-1.5 opacity-60">{allProducts.length}</span>
            </button>
            {categories.filter((c) => c.name && c.name.trim() !== "").map((category) => (
              <button
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:text-sm ${
                  activeCategory === category.slug
                    ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
                }`}
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                type="button"
              >
                {category.name}
                <span className="ml-1.5 opacity-60">{categoryProductCounts[category.slug] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* When no filter is active, show carousels + limited grid */}
      {activeCategory === null ? (
        <>
          {/* Más vendidos */}
          {featured.length > 0 ? (
            <ProductCarousel
              badge="Más buscados"
              href="/productos"
              products={featured}
              title="Más vendidos"
            />
          ) : null}

          {/* Recién agregados — only show if different from featured */}
          {recent.length > 0 && recent.some((r) => !featured.find((f) => f.id === r.id)) ? (
            <ProductCarousel
              badge="Acabados de llegar"
              href="/productos"
              products={recent.filter((r) => !featured.find((f) => f.id === r.id)).slice(0, 8)}
              title="Recién agregados"
            />
          ) : null}

          {/* Limited products grid with "Ver todos" link */}
          <section className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-10">
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                  Catálogo completo
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight sm:text-2xl">
                  Todos los productos
                </h2>
              </div>
              <Link
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition hover:gap-2 hover:underline"
                href="/productos"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {gridProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMoreProducts ? (
              <div className="flex justify-center pt-2">
                <Link
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
                  href="/productos"
                >
                  Ver los {allProducts.length} productos
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ) : null}
          </section>
        </>
      ) : (
        /* When filter is active, show only filtered products in grid */
        <section className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                Filtrado por categoría
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight sm:text-2xl">
                {activeCategoryName}
              </h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-transparent">
              <p className="text-sm text-[var(--muted-foreground)]">
                No hay productos en esta categoría.
              </p>
              <button
                className="text-sm font-medium text-[var(--accent)] transition hover:underline"
                onClick={() => setActiveCategory(null)}
                type="button"
              >
                Ver todos los productos
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
