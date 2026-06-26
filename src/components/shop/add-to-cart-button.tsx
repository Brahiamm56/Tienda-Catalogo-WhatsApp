"use client";

import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

type AddToCartButtonProps = {
  product: Pick<CatalogProduct, "id" | "slug" | "name" | "image" | "priceCents">;
  className?: string;
  label?: string;
};

export function AddToCartButton({ product, className, label }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  if (label) {
    return (
      <button
        aria-label={`${label} — ${product.name}`}
        className={cn(
          "btn-press inline-flex items-center justify-center gap-1.5 whitespace-nowrap border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/18 hover:border-[var(--accent)]/50 sm:px-5 sm:py-3",
          className,
        )}
        onClick={(e) => {
          e.preventDefault();
          addItem(product);
          openCart();
        }}
        style={{ borderRadius: "var(--btn-radius, 9999px)" }}
        type="button"
      >
        <ShoppingCart className="size-4" />
        {label}
      </button>
    );
  }

  return (
    <button
      aria-label={`Comprar ${product.name}`}
      className={cn(
        "btn-press flex size-7 shrink-0 items-center justify-center border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] transition hover:bg-[var(--accent)]/18 hover:border-[var(--accent)]/50 sm:size-8",
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        addItem(product);
        openCart();
      }}
      style={{ borderRadius: "var(--btn-radius, 9999px)" }}
      type="button"
    >
      <ShoppingCart className="size-3.5 sm:size-4" />
    </button>
  );
}