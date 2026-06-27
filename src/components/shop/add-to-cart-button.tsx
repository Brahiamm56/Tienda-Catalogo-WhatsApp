"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";

type AddToCartButtonProps = {
  product: Pick<CatalogProduct, "id" | "slug" | "name" | "image" | "priceCents">;
  className?: string;
  label?: string;
};

export function AddToCartButton({ product, className, label }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const addToast = useToastStore((state) => state.addToast);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (added) return;
    setAdded(true);
    addItem(product);
    addToast({
      message: `${product.name} añadido`,
      actionLabel: "Ver carrito",
      onAction: openCart,
    });
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
    setTimeout(() => setAdded(false), 1500);
  };

  if (label) {
    return (
      <button
        aria-label={`${label} — ${product.name}`}
        className={cn(
          "btn-press inline-flex items-center justify-center gap-1.5 whitespace-nowrap border px-5 py-3 text-sm font-medium transition duration-300",
          added
            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 scale-[1.02]"
            : "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/18 hover:border-[var(--accent)]/50",
          className,
        )}
        onClick={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        style={{ borderRadius: "var(--btn-radius, 9999px)" }}
        type="button"
      >
        {added ? <Check className="size-4 animate-badge-bounce" /> : <ShoppingCart className="size-4" />}
        {added ? "¡Añadido!" : label}
      </button>
    );
  }

  return (
    <button
      aria-label={`Comprar ${product.name}`}
      className={cn(
        "btn-press flex size-9 shrink-0 items-center justify-center border transition duration-300 sm:size-10",
        added
          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 scale-[1.05]"
          : "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/18 hover:border-[var(--accent)]/50",
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        handleAdd();
      }}
      style={{ borderRadius: "var(--btn-radius, 9999px)" }}
      type="button"
    >
      {added ? <Check className="size-3.5 sm:size-4 animate-badge-bounce" /> : <ShoppingCart className="size-3.5 sm:size-4" />}
    </button>
  );
}