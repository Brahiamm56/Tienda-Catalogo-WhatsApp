"use client";

import { type ReactNode, useRef } from "react";

import { gsap, ScrollTrigger, useGsapContext } from "@/lib/gsap";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger children by word — splits text content into spans */
  as?: "div" | "section" | "h2" | "h3" | "p" | "span";
  variant?: "fade-up" | "word-by-word" | "scale-in" | "clip-reveal";
  delay?: number;
};

export function ScrollReveal({
  children,
  className = "",
  as: Tag = "div",
  variant = "fade-up",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useGsapContext<HTMLElement>(() => {
    const el = ref.current;
    if (!el) return;

    if (variant === "word-by-word") {
      const words = el.querySelectorAll("[data-reveal-word]");
      if (words.length > 0) {
        gsap.from(words, {
          opacity: 0.15,
          y: 8,
          duration: 0.5,
          stagger: 0.04,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom 60%",
            toggleActions: "play none none reverse",
          },
          delay,
        });
      }
      return;
    }

    if (variant === "scale-in") {
      gsap.from(el, {
        opacity: 0,
        scale: 0.92,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        delay,
      });
      return;
    }

    if (variant === "clip-reveal") {
      gsap.from(el, {
        opacity: 0,
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        delay,
      });
      return;
    }

    // Default: fade-up
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
      delay,
    });
  }, [variant, delay]);

  // For word-by-word, we need to wrap each word in a span
  if (variant === "word-by-word" && typeof children === "string") {
    const words = children.split(" ");
    return (
      <Tag ref={ref as any} className={className}>
        {words.map((word, i) => (
          <span key={i} data-reveal-word className="inline-block">
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}

type ParallaxLayerProps = {
  children: ReactNode;
  className?: string;
  speed?: number;
};

export function ParallaxLayer({ children, className = "", speed = 0.3 }: ParallaxLayerProps) {
  const ref = useGsapContext<HTMLDivElement>(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      yPercent: -speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

type PinnedSectionProps = {
  children: ReactNode;
  className?: string;
  pinSpacing?: boolean;
};

export function PinnedSection({ children, className = "", pinSpacing = true }: PinnedSectionProps) {
  const ref = useGsapContext<HTMLElement>(() => {
    const el = ref.current;
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom top",
      pin: true,
      pinSpacing,
    });
  }, []);

  return (
    <section ref={ref as any} className={className}>
      {children}
    </section>
  );
}
