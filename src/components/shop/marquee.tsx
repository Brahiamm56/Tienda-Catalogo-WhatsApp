"use client";

import { type ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  speed?: number;
  reverse?: boolean;
};

export function Marquee({ children, className = "", speed = 30, reverse = false }: MarqueeProps) {
  const duration = `${speed}s`;
  const direction = reverse ? "reverse" : "normal";

  return (
    <div className={`group relative flex overflow-hidden ${className}`}>
      <div
        className="flex shrink-0 items-center gap-8 pr-8"
        style={{
          animation: `marqueeScroll ${duration} linear infinite`,
          animationDirection: direction,
        }}
      >
        {children}
      </div>
      <div
        className="flex shrink-0 items-center gap-8 pr-8"
        style={{
          animation: `marqueeScroll ${duration} linear infinite`,
          animationDirection: direction,
        }}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}
