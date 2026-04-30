"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export function Spotlight({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div
        animate={{
          opacity: [0.55, 0.9, 0.55],
          scale: [1, 1.06, 1],
        }}
        className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(211,93,71,0.24)_0%,_rgba(211,93,71,0)_68%)]"
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        animate={{
          opacity: [0.4, 0.8, 0.4],
          x: [0, 18, 0],
        }}
        className="absolute right-[-5rem] top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(69,145,156,0.22)_0%,_rgba(69,145,156,0)_70%)]"
        transition={{ duration: 11, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
    </div>
  );
}