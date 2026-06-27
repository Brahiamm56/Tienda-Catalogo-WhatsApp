"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import { formatCurrencyFromCents } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";

type StickyAddToCartProps = {
  product: Pick<CatalogProduct, "id" | "slug" | "name" | "image" | "priceCents">;
};

export function StickyAddToCart({ product }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar when scrolled past 400px (approx past the main add to cart button)
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 z-20 flex justify-center px-3 transition-all duration-300 ease-in-out sm:hidden ${
        isVisible
          ? "bottom-[calc(env(safe-area-inset-bottom)+1rem)] translate-y-0 opacity-100"
          : "bottom-[calc(env(safe-area-inset-bottom)+1rem)] translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex w-full max-w-[26rem] items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[rgba(12,12,14,0.92)] p-2 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-[var(--background)]">
            <Image alt={product.name} className="object-cover" fill sizes="40px" src={product.image} />
          </div>
          <div className="flex flex-col truncate">
            <span className="truncate text-xs font-semibold leading-tight">{product.name}</span>
            <span className="text-[11px] font-medium text-[var(--accent)]">
              {formatCurrencyFromCents(product.priceCents)}
            </span>
          </div>
        </div>
        
        <button
          className="flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/18 hover:border-[var(--accent)]/50"
          onClick={() => {
            addItem(product);
            addToast({
              message: `${product.name} añadido`,
              actionLabel: "Ver carrito",
              onAction: openCart,
            });
          }}
          style={{ borderRadius: "var(--btn-radius, 9999px)" }}
          type="button"
        >
          <ShoppingCart className="size-3.5" />
          Comprar
        </button>
      </div>
    </div>
  );
}
