"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function PageTransition() {
  const pathname = usePathname();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsExiting(true);
    const timer = setTimeout(() => setIsExiting(false), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9995] transition-opacity duration-500 ${
        isExiting ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background:
          "linear-gradient(180deg, rgba(2,2,2,0.97) 0%, rgba(2,2,2,0.99) 100%)",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: isExiting ? 1 : 0,
          transition: "opacity 0.3s ease 0.1s",
        }}
      >
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)]" />
      </div>
    </div>
  );
}
