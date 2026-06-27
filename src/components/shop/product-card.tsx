import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { Tilt3D } from "@/components/shop/tilt-3d";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { type CatalogProduct } from "@/lib/catalog";
import { formatCurrencyFromCents } from "@/lib/utils";

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiB2aWV3Qm94PSIwIDAgOCAxMCI+PHJlY3Qgd2lkdGg9IjgiIGhlaWdodD0iMTAiIGZpbGw9IiMwYzBjMGUiLz48L3N2Zz4=";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <Tilt3D maxTilt={10} className="group relative">
      <article
        className="card-lift relative overflow-hidden border"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--card-border)",
          borderRadius: "var(--card-radius, 0.75rem)",
        }}
      >
      <Link
        className="relative block aspect-[3/4] overflow-hidden bg-[#0d0d0f]"
        href={`/productos/${product.slug}`}
      >
        <Image
          alt={product.name}
          blurDataURL={BLUR_PLACEHOLDER}
          className="h-full w-full object-contain p-3 transition duration-700 group-hover:scale-[1.08]"
          height={900}
          loading="lazy"
          placeholder="blur"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          src={product.image}
          width={720}
        />

        {/* Subtle bottom gradient for text legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Status badges — top left */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
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

        {/* Wishlist — top right */}
        <div className="absolute right-2.5 top-2.5 z-10">
          <WishlistButton product={product} />
        </div>

        {/* Category pill — bottom left */}
        <div className="absolute inset-x-0 bottom-2.5 z-10 px-2.5">
          <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/50">
            {product.category.name}
          </span>
        </div>

        {/* Hover overlay — "Ver detalle" */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] backdrop-blur-sm">
            Ver detalle
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>

      {/* Info row */}
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-3.5">
        <div className="min-w-0">
          <h3 className="truncate font-[family-name:var(--font-display)] text-sm font-medium italic tracking-wide text-[var(--foreground)] sm:text-base">
            {product.name}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-[var(--accent)]">
            {formatCurrencyFromCents(product.priceCents)}
          </p>
        </div>
        <AddToCartButton product={product} />
      </div>
      </article>
    </Tilt3D>
  );
}