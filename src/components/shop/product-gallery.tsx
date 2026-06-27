"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type GalleryImage = {
  url: string;
  alt: string;
};

interface ProductGalleryProps {
  images: GalleryImage[];
  accent: string;
  autoplayMs?: number;
}

export function ProductGallery({ images, accent, autoplayMs = 4500 }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const total = images.length;
  const hasMultiple = total > 1;

  // Minimum swipe distance to register (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    if (!hasMultiple) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [hasMultiple, total, autoplayMs]);

  if (total === 0) return null;

  const goTo = (next: number) => setIndex(((next % total) + total) % total);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goTo(index + 1);
    } else if (isRightSwipe) {
      goTo(index - 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
        )}
      >
        <div
          className="relative aspect-[3/4] w-full bg-[#0a0a0c]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((img, i) => (
            <Image
              key={img.url + i}
              alt={img.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 60vw, 100vw"
              src={img.url}
              className={cn(
                "object-contain p-2 transition-opacity duration-700 ease-out",
                i === index ? "opacity-100" : "opacity-0",
              )}
            />
          ))}

          {hasMultiple ? (
            <>
              <button
                type="button"
                aria-label="Imagen anterior"
                onClick={() => goTo(index - 1)}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70 hover:text-[var(--accent)] sm:left-4"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Siguiente imagen"
                onClick={() => goTo(index + 1)}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70 hover:text-[var(--accent)] sm:right-4"
              >
                <ChevronRight className="size-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Ir a imagen ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === index ? "w-5 bg-[var(--accent)]" : "w-1.5 bg-white/30 hover:bg-white/60",
                    )}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {hasMultiple ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={img.url + "-thumb-" + i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                "relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20",
                i === index
                  ? "border-[var(--accent)] shadow-md"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                alt={img.alt}
                src={img.url}
                fill
                sizes="80px"
                className="object-cover p-2"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
