"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import type { CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type ProductAddToCartProps = {
  product: Pick<CatalogProduct, "id" | "slug" | "name" | "image" | "priceCents">;
  className?: string;
};

export function ProductAddToCart({ product, className }: ProductAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const addToast = useToastStore((state) => state.addToast);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    addToast({
      message: `${quantity}× ${product.name} añadido`,
      actionLabel: "Ver carrito",
      onAction: openCart,
    });
    setQuantity(1);
  };

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <div className="flex items-center justify-between rounded-full border border-[var(--border)] bg-transparent sm:justify-start">
        <button
          aria-label="Disminuir cantidad"
          className="flex size-11 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          type="button"
        >
          <Minus className="size-4" />
        </button>
        <span className="min-w-10 text-center text-base font-semibold">
          {quantity}
        </span>
        <button
          aria-label="Aumentar cantidad"
          className="flex size-11 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          onClick={() => setQuantity((q) => q + 1)}
          type="button"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <button
        aria-label={`Añadir ${quantity} ${product.name} al carrito`}
        className="btn-press inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-5 py-3 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/18 hover:border-[var(--accent)]/50"
        onClick={handleAdd}
        style={{ borderRadius: "var(--btn-radius, 9999px)" }}
        type="button"
      >
        <Plus className="size-4" />
        Añadir al carrito
      </button>
    </div>
  );
}
