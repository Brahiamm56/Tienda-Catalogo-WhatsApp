"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { CatalogBanner } from "@/lib/catalog";

type BannerCarouselProps = {
  banners: CatalogBanner[];
};

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = banners.length;

  const scrollToIndex = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const safe = (index + total) % total;
      scroller.scrollTo({ left: safe * scroller.clientWidth, behavior: "smooth" });
    },
    [total],
  );

  useEffect(() => {
    if (total <= 1) return;
    const id = window.setInterval(() => {
      scrollToIndex(activeIndex + 1);
    }, 5500);
    return () => window.clearInterval(id);
  }, [activeIndex, scrollToIndex, total]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const idx = Math.round(scroller.scrollLeft / scroller.clientWidth);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  if (total === 0) return null;

  return (
    <section className="px-4 pt-4 sm:px-6 lg:px-10 lg:pt-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(20,17,15,0.10)] sm:rounded-3xl">
        {/* Carousel scroller */}
        <div
          className="hide-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
          onScroll={handleScroll}
          ref={scrollerRef}
        >
          {banners.map((banner) => (
            <div
              className="relative w-full shrink-0 snap-start overflow-hidden"
              key={banner.id}
            >
              {/* Image container — controlled height so image is fully visible */}
              <div className="relative h-[240px] w-full sm:h-[320px] md:h-[380px] lg:h-[420px]">
                <Image
                  alt={banner.title}
                  className="object-cover object-center"
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
                  src={banner.imageUrl}
                />
              </div>

              {/* Gradient overlays */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-black/40 to-transparent" />

              {/* Content overlay */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2.5 p-5 sm:gap-3 sm:p-8 md:max-w-[55%] md:p-10 lg:p-12">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-3xl md:text-4xl lg:text-5xl">
                  {banner.title}
                </h2>
                {banner.subtitle ? (
                  <p className="max-w-lg text-xs leading-5 text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] sm:text-sm sm:leading-6 md:text-base">
                    {banner.subtitle}
                  </p>
                ) : null}
                {banner.ctaLabel && banner.ctaHref ? (
                  <Link
                    className="group mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(211,93,71,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_8px_30px_rgba(211,93,71,0.5)] sm:px-6 sm:py-3 sm:text-base"
                    href={banner.ctaHref}
                  >
                    {banner.ctaLabel}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {total > 1 ? (
          <>
            <button
              aria-label="Anterior"
              className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--foreground)] shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 md:flex"
              onClick={() => scrollToIndex(activeIndex - 1)}
              type="button"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--foreground)] shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 md:flex"
              onClick={() => scrollToIndex(activeIndex + 1)}
              type="button"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 sm:bottom-4">
              {banners.map((banner, idx) => (
                <button
                  aria-label={`Ir a banner ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 ${idx === activeIndex
                      ? "h-2 w-7 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                      : "h-2 w-2 bg-white/50 hover:bg-white/70"
                    }`}
                  key={banner.id}
                  onClick={() => scrollToIndex(idx)}
                  type="button"
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
