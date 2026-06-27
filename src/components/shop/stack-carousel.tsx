"use client";

import { useEffect, useRef, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const cards = Array.from(carousel.children) as HTMLElement[];
    if (cards.length === 0) return;

    // Get the carousel's horizontal center relative to its viewport
    const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      // Get the card's horizontal center relative to the track
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(carouselCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Run once on mount to establish initial active card
    handleScroll();

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [activeIndex]);

  const scrollToCard = (index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const card = carousel.children[index] as HTMLElement;
    if (!card) return;

    // Calculate position to center the card
    const targetScrollLeft = card.offsetLeft - (carousel.clientWidth - card.clientWidth) / 2;

    carousel.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  };

  const handleCardClick = (e: React.MouseEvent, index: number) => {
    if (index !== activeIndex) {
      e.preventDefault();
      e.stopPropagation();
      scrollToCard(index);
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6 sm:py-4 lg:px-10 overflow-hidden">
      <p className="mb-1 text-[10px] font-medium text-[var(--muted-foreground)]">Deslizá para explorar</p>
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

      {/* Interactive carousel track */}
      <div className="carousel-wrapper">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[var(--background)] to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[var(--background)] to-transparent sm:w-20" />

        <div 
          ref={carouselRef}
          className="carousel"
        >
          {products.map((product, i) => {
            let stateClass = "is-far";
            if (i === activeIndex) {
              stateClass = "is-active";
            } else if (i === activeIndex - 1) {
              stateClass = "is-prev";
            } else if (i === activeIndex + 1) {
              stateClass = "is-next";
            }

            return (
              <div
                key={product.id}
                className={`slide ${stateClass}`}
                style={{ "--index": i } as CSSProperties}
              >
                <FlipbookCard 
                  product={product} 
                  onCardClick={(e) => handleCardClick(e, i)}
                />
              </div>
            );
          })}
        </div>

        {/* Carousel indicators */}
        <div className="mt-6 flex justify-center gap-1.5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                i === activeIndex 
                  ? "w-6 bg-[var(--accent)]" 
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Ir al perfume ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FlipbookCard({ 
  product, 
  onCardClick 
}: { 
  product: CatalogProduct; 
  onCardClick: (e: React.MouseEvent) => void;
}) {
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <article
      className="card group relative flex flex-col overflow-hidden border"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
        borderRadius: "var(--card-radius, 0.75rem)",
      }}
    >
      <Link
        className="relative block aspect-[3/4] w-full overflow-hidden bg-[#0d0d0f]"
        href={`/productos/${product.slug}`}
        onClick={onCardClick}
      >
        <Image
          alt={product.name}
          className="object-contain p-2 transition duration-700 group-hover:scale-[1.08]"
          fill
          loading="lazy"
          sizes="(max-width: 640px) 44vw, 240px"
          src={product.image}
        />

        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Gender Diagonal Ribbon — top right */}
        {product.gender === "mujer" && (
          <div className="absolute right-0 top-0 z-20 h-14 w-14 overflow-hidden pointer-events-none">
            <div className="absolute top-2 -right-5 w-18 rotate-45 bg-pink-500/20 text-center text-[7px] font-extrabold uppercase tracking-[0.16em] text-pink-300 py-0.5 border-b border-pink-500/30 backdrop-blur-[2px] shadow-sm">
              women
            </div>
          </div>
        )}
        {product.gender === "hombre" && (
          <div className="absolute right-0 top-0 z-20 h-14 w-14 overflow-hidden pointer-events-none">
            <div className="absolute top-2 -right-5 w-18 rotate-45 bg-sky-500/20 text-center text-[7px] font-extrabold uppercase tracking-[0.16em] text-sky-300 py-0.5 border-b border-sky-500/30 backdrop-blur-[2px] shadow-sm">
              men
            </div>
          </div>
        )}

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
        <div 
          className="absolute right-2 z-10 transition-all" 
          style={{
            top: product.gender === "mujer" || product.gender === "hombre" ? "1.85rem" : "0.5rem"
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <WishlistButton product={product} />
        </div>

        {/* Bottom info overlay — integrated into the card face */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-2.5">
          <span className="text-[8px] font-medium uppercase tracking-[0.14em] text-white/50">
            {product.category.name}
          </span>
          <p className="mt-0.5 line-clamp-1 font-[family-name:var(--font-display)] text-xs font-medium italic tracking-wide text-white">
            {product.name}
          </p>
          <div 
            className="mt-1.5 flex items-center justify-between gap-1.5" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="flex flex-wrap items-baseline gap-1">
              <span className="text-xs font-semibold text-[var(--accent)]">
                {formatCurrencyFromCents(product.priceCents)}
              </span>
              <span className="text-[9px] text-[var(--muted-foreground)] line-through">
                {formatCurrencyFromCents(Math.round(product.priceCents * 1.18))}
              </span>
            </div>
            <AddToCartButton product={product} />
          </div>
        </div>
      </Link>
    </article>
  );
}
