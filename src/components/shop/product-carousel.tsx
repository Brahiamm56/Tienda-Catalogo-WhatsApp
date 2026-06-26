"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";

import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { useGsapContext, gsap, ScrollTrigger } from "@/lib/gsap";
import type { CatalogProduct } from "@/lib/catalog";
import { formatCurrencyFromCents } from "@/lib/utils";

type ProductCarouselProps = {
  badge?: string;
  href?: string;
  products: CatalogProduct[];
  title: string;
};

export function ProductCarousel({ badge, href, products, title }: ProductCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useGsapContext<HTMLElement>((self) => {
    const root = self as unknown as { selector?: (s: string) => Element[] };
    void root;
    // Header reveal
    gsap.from("[data-anim='carousel-head'] > *", {
      y: 18,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: "[data-anim='carousel-head']",
        start: "top 90%",
        once: true,
      },
    });
    // Cards stagger
    gsap.from("[data-anim='carousel-track'] > article", {
      y: 32,
      opacity: 0,
      duration: 0.55,
      ease: "power3.out",
      stagger: 0.07,
      scrollTrigger: {
        trigger: "[data-anim='carousel-track']",
        start: "top 88%",
        once: true,
      },
    });
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [products.length]);

  if (products.length === 0) return null;

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);

    // Calculate active index based on card width + gap
    const cardWidth = el.querySelector("article")?.offsetWidth ?? 200;
    const gap = 12;
    const idx = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(idx, products.length - 1));
  }, [products.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.offsetWidth ?? 200;
    const gap = 12;
    const distance = (cardWidth + gap) * 2 * (direction === "left" ? -1 : 1);
    el.scrollBy({ left: distance, behavior: "smooth" });
  };

  // Number of dots to show (total visible "pages")
  const totalDots = Math.max(1, products.length - 1);

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-4 px-4 sm:px-6 lg:px-10"
    >
      <div data-anim="carousel-head" className="flex items-end justify-between gap-3">
        <div className="space-y-0.5">
          {badge ? (
            <p className="text-[9px] uppercase tracking-[0.28em] text-[var(--accent)] animate-gold-shimmer">{badge}</p>
          ) : null}
          <h2 className="font-[family-name:var(--font-display)] text-xl font-light italic tracking-wide text-[var(--foreground)] sm:text-2xl md:text-3xl">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {href ? (
            <Link className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)] transition hover:text-[var(--accent)]" href={href}>
              Ver más
            </Link>
          ) : null}
          <div className="hidden gap-1 sm:flex">
            <button
              aria-label="Desplazar a la izquierda"
              className={`flex size-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--accent)]/30 hover:text-[var(--accent)] ${
                !canScrollLeft ? "pointer-events-none opacity-20" : ""
              }`}
              onClick={() => scroll("left")}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              aria-label="Desplazar a la derecha"
              className={`flex size-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--accent)]/30 hover:text-[var(--accent)] ${
                !canScrollRight ? "pointer-events-none opacity-20" : ""
              }`}
              onClick={() => scroll("right")}
              type="button"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        data-anim="carousel-track"
        className="carousel-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-4 sm:gap-4"
        ref={scrollerRef}
      >
        {products.map((product) => (
          <CarouselCard key={product.id} product={product} />
        ))}
      </div>

      {/* Scroll indicator dots — mobile only */}
      {products.length > 2 ? (
        <div className="flex justify-center gap-1.5 sm:hidden">
          {Array.from({ length: totalDots }).map((_, i) => (
            <span
              key={i}
              className={`h-px rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 bg-[var(--accent)]"
                  : "w-1.5 bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CarouselCard({ product }: { product: CatalogProduct }) {
  return (
    <article
      className="group flex w-[44vw] max-w-[200px] shrink-0 snap-start flex-col overflow-hidden border transition-all duration-300 hover:-translate-y-1 sm:w-[calc(50%-8px)] sm:max-w-none md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
        borderRadius: "var(--card-radius, 0.75rem)",
      }}
    >
      <Link className="relative block aspect-[3/4] w-full overflow-hidden bg-[#0d0d0f]" href={`/productos/${product.slug}`}>
        <Image
          alt={product.name}
          className="object-cover transition duration-700 group-hover:scale-[1.06]"
          fill
          sizes="(max-width: 640px) 44vw, (max-width: 768px) 210px, 260px"
          src={product.image}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        {product.featured ? (
          <span className="absolute left-2 top-2 rounded-sm bg-[var(--accent)] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-ink)]">
            Destacado
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-3.5">
        <Link
          className="line-clamp-1 font-[family-name:var(--font-display)] text-xs font-medium italic tracking-wide text-[var(--foreground)] sm:text-sm"
          href={`/productos/${product.slug}`}
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-1.5">
          <p className="text-xs font-medium text-[var(--accent)] sm:text-sm">{formatCurrencyFromCents(product.priceCents)}</p>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
