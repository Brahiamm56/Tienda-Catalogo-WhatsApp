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
          "btn-press inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:px-5 sm:py-3",
          className,
        )}
        onClick={(e) => {
          e.preventDefault();
          addItem(product);
          openCart();
        }}
        style={{ backgroundColor: "#000", borderRadius: "var(--btn-radius, 9999px)" }}
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
        "btn-press flex size-7 shrink-0 items-center justify-center text-white transition hover:opacity-85 sm:size-8",
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        addItem(product);
        openCart();
      }}
      style={{ backgroundColor: "#000", borderRadius: "var(--btn-radius, 9999px)" }}
      type="button"
    >
      <ShoppingCart className="size-3.5 sm:size-4" />
    </button>
  );
}