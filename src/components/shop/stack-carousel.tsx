import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import type { CatalogProduct } from "@/lib/catalog";
import { formatCurrencyFromCents } from "@/lib/utils";

type StackCarouselProps = {
  badge?: string;
  products: CatalogProduct[];
  title: string;
};

export function StackCarousel({ badge, products, title }: StackCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-10">
      {/* Header */}
      <div className="flex flex-col gap-1.5 pb-2">
        {badge ? (
          <p className="animate-gold-shimmer text-[9px] uppercase tracking-[0.28em] text-[var(--accent)]">
            {badge}
          </p>
        ) : null}
        <h2 className="font-[family-name:var(--font-display)] text-xl font-light italic tracking-wide text-[var(--foreground)] sm:text-2xl md:text-3xl">
          {title}
        </h2>
      </div>

      {/* Scroll-driven carousel track */}
      <div className="carousel-wrapper">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[var(--background)] to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[var(--background)] to-transparent sm:w-20" />

        <div className="carousel">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="slide"
              style={{ "--index": i } as CSSProperties}
            >
              <StackCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StackCard({ product }: { product: CatalogProduct }) {
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <article
      className="card group relative flex w-[var(--card-width)] flex-col overflow-hidden border"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
        borderRadius: "var(--card-radius, 0.75rem)",
      }}
    >
      <Link
        className="relative block aspect-[3/4] w-full overflow-hidden bg-[#0d0d0f]"
        href={`/productos/${product.slug}`}
      >
        <Image
          alt={product.name}
          className="object-contain p-2 transition duration-700 group-hover:scale-[1.08]"
          fill
          sizes="(max-width: 640px) 48vw, 192px"
          src={product.image}
        />

        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Status badges */}
        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
          {product.isNew && (
            <span className="rounded-sm bg-[var(--accent)] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-ink)]">
              Nuevo
            </span>
          )}
          {outOfStock && (
            <span className="rounded-sm bg-black/70 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/70 backdrop-blur-sm">
              Agotado
            </span>
          )}
          {lowStock && !outOfStock && (
            <span className="rounded-sm bg-amber-500/20 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-amber-400">
              Últimas {product.stock}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton product={product} />
        </div>

        {/* Category */}
        <div className="absolute inset-x-0 bottom-2 z-10 px-2">
          <span className="text-[8px] font-medium uppercase tracking-[0.14em] text-white/50">
            {product.category.name}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <Link
          className="line-clamp-1 font-[family-name:var(--font-display)] text-xs font-medium italic tracking-wide text-[var(--foreground)]"
          href={`/productos/${product.slug}`}
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-1.5">
          <p className="text-xs font-medium text-[var(--accent)]">
            {formatCurrencyFromCents(product.priceCents)}
          </p>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
