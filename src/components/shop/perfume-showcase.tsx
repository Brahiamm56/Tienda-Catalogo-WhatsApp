"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

type PerfumeShowcaseProps = {
  images?: string[];
  names?: string[];
  brands?: string[];
  hrefs?: string[];
};

// 3D slot configs — rotationX tilts side bottles backward in z-space for true depth
const SLOT = {
  active:   { xPercent: 0,    scale: 1.18, opacity: 1,    rotationY: 0,   rotationX: 0,   z: 80   },
  right:    { xPercent: 118,  scale: 0.46, opacity: 0.38, rotationY: -40, rotationX: -6,  z: -220 },
  left:     { xPercent: -118, scale: 0.46, opacity: 0.38, rotationY: 40,  rotationX: -6,  z: -220 },
  offRight: { xPercent: 252,  scale: 0.20, opacity: 0,    rotationY: -68, rotationX: -12, z: -420 },
  offLeft:  { xPercent: -252, scale: 0.20, opacity: 0,    rotationY: 68,  rotationX: -12, z: -420 },
};

const TILT_X = 8;   // max rotationX degrees
const TILT_Y = 11;  // max rotationY degrees

const EASE = "power4.inOut";
const DUR = 0.72;
const AUTO_DELAY = 5000;

const GLOW_COLORS: Record<string, string> = {
  "3parfams": "rgba(201, 169, 110, 0.12)",      // warm gold/amber
  "9pm": "rgba(163, 191, 250, 0.12)",           // cool steel blue/silver
  "kamra": "rgba(251, 146, 60, 0.13)",           // rich amber orange
  "club-de-nuit": "rgba(224, 242, 254, 0.10)"    // soft diamond white
};

const getGlowColor = (src: string) => {
  const key = src.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
  return GLOW_COLORS[key] || "rgba(201, 169, 110, 0.09)";
};

// Circular slot resolver helper
function getSlotForIndex(i: number, activeId: number, total: number) {
  if (i === activeId) return SLOT.active;
  if (total >= 2 && i === (activeId + 1) % total) return SLOT.right;
  if (total >= 3 && i === (activeId - 1 + total) % total) return SLOT.left;

  // Decide if it should go offRight or offLeft based on circular distance
  const diff = (i - activeId + total) % total;
  if (diff <= total / 2) {
    return SLOT.offRight;
  } else {
    return SLOT.offLeft;
  }
}

export function PerfumeShowcase({
  images = [],
  names = [],
  brands = [],
  hrefs = []
}: PerfumeShowcaseProps) {
  const [active, setActive] = useState(0);
  const [displayNameIndex, setDisplayNameIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const bottleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLDivElement | null>(null);
  
  const autoAdvanceTween = useRef<gsap.core.Tween | null>(null);
  const touchStartX = useRef<number | null>(null);
  const sectionRef  = useRef<HTMLElement | null>(null);
  const headerRef   = useRef<HTMLDivElement | null>(null);
  const stageRef    = useRef<HTMLDivElement | null>(null);
  const atmosphereRef = useRef<HTMLDivElement | null>(null);
  const stRef       = useRef<ScrollTrigger | null>(null);

  const count = images.length;

  // Initial setup for starting positions
  useEffect(() => {
    if (count === 0) return;
    const els = bottleRefs.current;

    // Position each bottle according to its initial slot relative to active
    images.forEach((_, i) => {
      const el = els[i];
      if (!el) return;
      const targetSlot = getSlotForIndex(i, active, count);
      gsap.set(el, { x: 0, ...targetSlot, immediateRender: true });
    });

    // Entrance animation — spring-like bounce for hero bottle
    const activeEl = els[active];
    if (activeEl) {
      gsap.from(activeEl, {
        y: 80,
        opacity: 0,
        scale: 0.6,
        duration: 1.3,
        ease: "elastic.out(1, 0.55)",
        delay: 0.15,
      });
    }
    if (count >= 2) {
      const rightEl = els[(active + 1) % count];
      if (rightEl) {
        gsap.from(rightEl, { y: 50, opacity: 0, duration: 1, ease: "power4.out", delay: 0.35 });
      }
    }
    if (count >= 3) {
      const leftEl = els[(active - 1 + count) % count];
      if (leftEl) {
        gsap.from(leftEl, { y: 50, opacity: 0, duration: 1, ease: "power4.out", delay: 0.42 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // Slide transition function — staggered with overshoot for fluidity
  const goTo = useCallback((next: number) => {
    if (transitioning || count < 2) return;
    const normalized = ((next % count) + count) % count;
    setTransitioning(true);
    setActive(normalized);

    const els = bottleRefs.current;
    
    // Animate every bottle to its slot with staggered timing for fluid feel
    const anims = images.map((_, i) => {
      const el = els[i];
      if (!el) return Promise.resolve();
      const targetSlot = getSlotForIndex(i, normalized, count);
      const isNewActive = i === normalized;

      return new Promise<void>((resolve) => {
        gsap.to(el, {
          ...targetSlot,
          duration: isNewActive ? DUR * 1.05 : DUR,
          ease: isNewActive ? "back.out(1.2)" : EASE,
          overwrite: "auto",
          onComplete: resolve,
        });
      });
    });

    Promise.all(anims).then(() => {
      setTransitioning(false);
    });
  }, [count, transitioning, images]);

  // Setup auto-advance progress bar tween
  useEffect(() => {
    if (count < 2 || !progressBarRef.current) return;

    // Reset progress bar
    gsap.set(progressBarRef.current, { scaleX: 0 });

    const tween = gsap.to(progressBarRef.current, {
      scaleX: 1,
      duration: AUTO_DELAY / 1000, // 5 seconds
      ease: "none",
      onComplete: () => {
        goTo(active + 1);
      },
    });

    autoAdvanceTween.current = tween;

    return () => {
      tween.kill();
      autoAdvanceTween.current = null;
    };
  }, [active, count, goTo]);

  // Handle play/pause of auto-advance based on hover state
  useEffect(() => {
    if (!autoAdvanceTween.current) return;
    if (isHovered) {
      autoAdvanceTween.current.pause();
    } else {
      autoAdvanceTween.current.play();
    }
  }, [isHovered]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goTo(active - 1);
      } else if (e.key === "ArrowRight") {
        goTo(active + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, goTo]);

  // Name and brand fade transition
  useEffect(() => {
    if (!nameRef.current) return;
    
    gsap.to(nameRef.current, {
      opacity: 0,
      y: 6,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        setDisplayNameIndex(active);
        gsap.to(nameRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
        });
      },
    });
  }, [active]);

  // Scroll parallax — each layer moves at a different rate as the section exits the viewport
  useEffect(() => {
    if (!sectionRef.current) return;
    stRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom top",
      scrub: 1.6,
      onUpdate: (self) => {
        const p = self.progress;
        if (atmosphereRef.current) gsap.set(atmosphereRef.current, { y: p * -55 });
        if (headerRef.current)     gsap.set(headerRef.current,     { y: p * -95 });
        if (stageRef.current)      gsap.set(stageRef.current,      { y: p * -30 });
      },
    });
    return () => { stRef.current?.kill(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swipe handlers for touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true); // Pause progress bar
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHovered(false); // Resume progress bar
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX.current;
    
    if (diffX > 40) {
      goTo(active - 1); // Swipe right -> previous
    } else if (diffX < -40) {
      goTo(active + 1); // Swipe left -> next
    }
    
    touchStartX.current = null;
  };

  // Mouse-driven 3D tilt — active bottle follows cursor in real-time
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (transitioning || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2; // -1 → +1
    const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    const activeEl = bottleRefs.current[active];
    if (!activeEl) return;
    gsap.to(activeEl, {
      rotationX: ny * -TILT_X,
      rotationY: nx * TILT_Y,
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, [active, transitioning]);

  const handleSectionMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (transitioning) return;
    const activeEl = bottleRefs.current[active];
    if (!activeEl) return;
    // Elastic spring-back to neutral on mouse leave
    gsap.to(activeEl, {
      rotationX: 0,
      rotationY: 0,
      duration: 1.4,
      ease: "elastic.out(1, 0.45)",
      overwrite: "auto",
    });
  }, [active, transitioning]);

  if (count === 0) return null;

  // Bottle sizes — bigger on mobile for impact
  const W = "clamp(280px, 65vw, 420px)";
  const H = "clamp(320px, 60vw, 420px)";

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[75svh] w-full flex-col overflow-hidden bg-black pb-10 sm:min-h-[92svh] sm:pb-14"
      aria-label="Colección de fragancias"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleSectionMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Film grain overlay ── */}
      <div 
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Atmospheric background ── */}
      <div ref={atmosphereRef} className="pointer-events-none absolute inset-0">
        {/* Central warm bloom */}
        <div
          className="absolute left-1/2 top-[44%] h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000 ease-in-out"
          style={{ background: `radial-gradient(circle, ${getGlowColor(images[active])} 0%, transparent 62%)` }}
        />
        {/* Subtle gold grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: "linear-gradient(rgba(201,169,110,0.9) 1px,transparent 1px),linear-gradient(90deg,rgba(201,169,110,0.9) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* ── Header block ── */}
      <div ref={headerRef} className="relative z-10 flex flex-col items-center gap-2.5 pt-10 text-center sm:gap-3 sm:pt-14">
        {/* Eyebrow with decorative lines */}
        <div className="flex items-center gap-4">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--accent)]/45" />
          <span className="animate-gold-shimmer text-[8px] font-medium uppercase tracking-[0.48em] text-[var(--accent)]">
            Lion Oficial
          </span>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[var(--accent)]/45" />
        </div>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.5rem]">
          Fragancias{" "}
          <em className="font-light italic text-[var(--accent)]">Árabes</em>
        </h1>

        {/* Brand description */}
        <p className="max-w-[280px] text-xs leading-relaxed text-[var(--muted-foreground)] sm:max-w-sm sm:text-sm">
          Perfumería de lujo oriental. Las fragancias más buscadas
          del mundo árabe, directo a tu puerta.
        </p>
      </div>

      {/* ── 3D Bottle stage ── */}
      <div
        ref={stageRef}
        className="relative z-10 mx-auto mt-12 flex min-h-[460px] w-full flex-1 items-center justify-center sm:mt-16 sm:min-h-[540px] lg:min-h-[600px]"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 52%" }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            ref={(el) => { bottleRefs.current[i] = el; }}
            className="absolute flex cursor-pointer select-none flex-col items-center"
            style={{ transformStyle: "preserve-3d", willChange: "transform" }}
            onClick={() => { if (i !== active) goTo(i); }}
          >
            {/* ── Bottle image — clean, no overlay ── */}
            <div
              className={`group relative rounded-2xl border border-transparent transition-all duration-300 premium-sheen ${
                i !== active ? "hover:border-white/10 hover:bg-white/[0.02]" : "premium-sheen-active"
              }`}
              style={{
                position: "relative",
                width: W,
                height: H,
                zIndex: 1,
                cursor: i === active ? "grab" : "ew-resize",
                filter: i === active
                  ? "drop-shadow(0 12px 36px rgba(0,0,0,0.55)) drop-shadow(0 0 60px rgba(201,169,110,0.12))"
                  : "brightness(0.45) saturate(0.7) drop-shadow(0 6px 12px rgba(0,0,0,0.6))",
                transition: "filter 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className={`absolute inset-3 sm:inset-5 flex items-center justify-center ${i === active ? "floating-active" : ""}`}>
                <div className="relative h-full w-full">
                  <Image
                    src={src}
                    alt={names[i] ?? `Fragancia ${i + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 420px"
                    quality={90}
                    priority={i <= 1}
                  />
                </div>
              </div>
            </div>

            {/* ── Floor glow pod ── */}
            <div
              aria-hidden="true"
              style={{
                width: "clamp(100px, 16vw, 180px)",
                height: "28px",
                marginTop: "-8px",
                borderRadius: "50%",
                background: "rgba(201,169,110,1)",
                filter: "blur(18px)",
                opacity: i === active ? 0.5 : 0.05,
                transition: "opacity 0.8s ease",
                zIndex: 1,
              }}
            />

            {/* ── "Ver →" micro button — only on active bottle ── */}
            {i === active && (
              <Link
                href={hrefs[i] ?? "/productos"}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] transition-all duration-300 hover:text-[var(--accent-strong)]"
              >
                Ver
                <ArrowRight className="size-2.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}

            {/* ── Floor reflection ── */}
            <div
              style={{
                position: "relative",
                width: W,
                height: "clamp(50px, 7vw, 80px)",
                marginTop: "2px",
                transform: "scaleY(-1)",
                opacity: i === active ? 0.25 : 0.05,
                transition: "opacity 0.8s ease",
                zIndex: 1,
                maskImage: "linear-gradient(to top, transparent 5%, rgba(0,0,0,0.3) 40%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to top, transparent 5%, rgba(0,0,0,0.3) 40%, transparent 100%)",
                filter: "blur(1px)",
              }}
            >
              <Image src={src} alt="" fill className="object-contain" sizes="300px" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Active perfume name ── */}
      <div 
        ref={nameRef}
        className="relative z-10 mt-8 flex flex-col items-center gap-0.5 text-center sm:mt-6"
      >
        <p className="text-[8px] font-medium uppercase tracking-[0.42em] text-[var(--muted-foreground)]">
          {brands[displayNameIndex] ?? "\u00a0"}
        </p>
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          {names[displayNameIndex] ?? ""}
        </p>
      </div>

      {/* ── Navigation counter + progress bar ── */}
      {count > 1 && (
        <div className="relative z-10 mt-6 flex items-center justify-center gap-4 sm:mt-8">
          <span className="min-w-[24px] text-right text-[10px] font-medium tracking-wider tabular-nums text-[var(--muted-foreground)]">
            {String(active + 1).padStart(2, "0")}
          </span>
          
          {/* Progress bar track */}
          <div className="relative h-[2px] w-48 rounded-full bg-white/10 overflow-hidden">
            {/* Gold filler */}
            <div
              ref={progressBarRef}
              className="absolute left-0 top-0 h-full w-full bg-[var(--accent)] shadow-[0_0_8px_rgba(201,169,110,0.6)]"
              style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
            />
          </div>

          <span className="min-w-[24px] text-[10px] font-medium tracking-wider tabular-nums text-[var(--muted-foreground)]">
            {String(count).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* ── Main CTA ── */}
      <div className="relative z-10 mt-5 flex justify-center sm:mt-6">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2.5 rounded-full border border-[var(--accent)]/35 bg-[var(--accent)]/10 px-7 py-3 text-sm font-medium tracking-wide text-[var(--accent)] transition-all duration-300 hover:border-[var(--accent)]/55 hover:bg-[var(--accent)]/18 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(201,169,110,0.15)]"
        >
          Ver colección completa
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}
