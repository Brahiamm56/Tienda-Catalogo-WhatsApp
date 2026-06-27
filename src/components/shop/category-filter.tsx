"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { StackCarousel } from "@/components/shop/stack-carousel";
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
  const [activeGender, setActiveGender] = useState<string | null>(null);

  const filteredProducts = allProducts.filter((p) => {
    const matchesCategory = activeCategory ? p.category.slug === activeCategory : true;
    const matchesGender = activeGender ? p.gender === activeGender : true;
    return matchesCategory && matchesGender;
  });

  const activeCategoryName = activeCategory
    ? categories.find((c) => c.slug === activeCategory)?.name ?? "Productos"
    : null;

  // Count products per category for badge display
  const categoryProductCounts = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.slug] = allProducts.filter((p) => p.category.slug === cat.slug).length;
    return acc;
  }, {});

  // For the home grid, limit products to avoid excessive scroll
  const gridProducts = (activeCategory || activeGender) ? filteredProducts : allProducts.slice(0, MAX_GRID_PRODUCTS_HOME);
  const hasMoreProducts = !activeCategory && !activeGender && allProducts.length > MAX_GRID_PRODUCTS_HOME;

  return (
    <>
      {/* Filters section */}
      <section className="px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-light italic tracking-wide text-[var(--foreground)] sm:text-2xl md:text-3xl">
            Explorar catálogo
          </h2>
          
          {/* Gender Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Género / Colección</span>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                type="button"
                onClick={() => setActiveGender(null)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:text-sm ${
                  activeGender === null
                    ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setActiveGender(activeGender === "hombre" ? null : "hombre")}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:text-sm ${
                  activeGender === "hombre"
                    ? "border-sky-500/40 bg-sky-500/10 text-sky-400 font-semibold"
                    : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-sky-500/30 hover:text-[var(--foreground)]"
                }`}
              >
                Hombre
              </button>
              <button
                type="button"
                onClick={() => setActiveGender(activeGender === "mujer" ? null : "mujer")}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:text-sm ${
                  activeGender === "mujer"
                    ? "border-pink-500/40 bg-pink-500/10 text-pink-400 font-semibold"
                    : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-pink-500/30 hover:text-[var(--foreground)]"
                }`}
              >
                Mujer
              </button>
              <button
                type="button"
                onClick={() => setActiveGender(activeGender === "unisex" ? null : "unisex")}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:text-sm ${
                  activeGender === "unisex"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-400 font-semibold"
                    : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-amber-500/30 hover:text-[var(--foreground)]"
                }`}
              >
                Unisex
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Familias Olfativas</span>
            <div className="hide-scrollbar flex gap-2 overflow-x-auto">
              <button
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:text-sm ${
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
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:text-sm ${
                    activeCategory === category.slug
                      ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
                  }`}
                  key={category.id}
                  onClick={() => setActiveCategory(activeCategory === category.slug ? null : category.slug)}
                  type="button"
                >
                  {category.name}
                  <span className="ml-1.5 opacity-60">{categoryProductCounts[category.slug] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* When no filter is active, show carousels + limited grid */}
      {activeCategory === null && activeGender === null ? (
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

          {/* Perfumes Destacados — only show if different from featured */}
          {recent.length > 0 && recent.some((r) => !featured.find((f) => f.id === r.id)) ? (
            <StackCarousel
              badge="Acabados de llegar"
              products={recent.filter((r) => !featured.find((f) => f.id === r.id)).slice(0, 8)}
              title="Perfumes Destacados"
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
        /* When filter is active, show interactive carousel + remaining products in grid */
        <>
          {filteredProducts.length > 0 ? (
            <div className="space-y-8">
              {/* Carrusel Lindo (StackCarousel) with the first 6 products */}
              <StackCarousel
                badge={activeCategory ? activeCategoryName ?? "Filtrado" : "Colección"}
                products={filteredProducts.slice(0, 6)}
                title="Perfumes Destacados"
              />

              {/* Grid with remaining products (from index 6 onwards) */}
              {filteredProducts.length > 6 && (
                <section className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-10 mt-8">
                  <div className="flex items-end justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                        Colección Completa
                      </p>
                      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight sm:text-2xl">
                        Fragancias Adicionales
                      </h2>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {filteredProducts.slice(6).length} {filteredProducts.slice(6).length === 1 ? "producto" : "productos"} restantes
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {filteredProducts.slice(6).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 py-12">
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-transparent">
                <p className="text-sm text-[var(--muted-foreground)]">
                  No hay productos que coincidan con los filtros seleccionados.
                </p>
                <button
                  className="text-sm font-medium text-[var(--accent)] transition hover:underline"
                  onClick={() => {
                    setActiveCategory(null);
                    setActiveGender(null);
                  }}
                  type="button"
                >
                  Limpiar filtros
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
