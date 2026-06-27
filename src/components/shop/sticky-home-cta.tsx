"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StickyHomeCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = scrollY + winHeight > docHeight - 300;
      setVisible(scrollY > 500 && !nearBottom);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 z-20 flex justify-center px-4 transition-all duration-300 sm:hidden ${
        visible
          ? "bottom-[calc(env(safe-area-inset-bottom)+1rem)] translate-y-0 opacity-100"
          : "pointer-events-none bottom-[calc(env(safe-area-inset-bottom)+1rem)] translate-y-8 opacity-0"
      }`}
    >
      <Link
        className="flex w-full max-w-[26rem] items-center justify-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[rgba(12,12,14,0.92)] px-6 py-3 text-sm font-semibold text-[var(--accent)] shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        href="/productos"
      >
        Ver catálogo
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
