"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      aria-label="Volver arriba"
      className="fixed bottom-20 right-4 z-40 flex size-10 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--background)]/80 text-[var(--accent)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/10 sm:bottom-6 sm:right-6"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      type="button"
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
