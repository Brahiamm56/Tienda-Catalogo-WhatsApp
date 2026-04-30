"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { NewSaleForm } from "@/components/admin/new-sale-form";
import { createSaleAction } from "@/actions/sales";

type ProductOption = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  sku: string | null;
};

type NewSaleDrawerProps = {
  products: ProductOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewSaleDrawer({ products, open, onOpenChange }: NewSaleDrawerProps) {
  const router = useRouter();

  // Lock body scroll & support Escape
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer (left side) */}
      <aside
        aria-hidden={!open}
        aria-label="Nueva venta"
        className={`fixed inset-y-0 left-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 ease-out sm:max-w-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Plus className="size-4" />
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-800">
                Nueva venta
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Registra una venta manual. El stock se descontará automáticamente.
            </p>
          </div>
          <button
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X className="size-5" />
          </button>
        </header>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {open ? (
            <NewSaleForm
              action={createSaleAction}
              compact
              onSuccess={() => {
                onOpenChange(false);
                router.refresh();
              }}
              products={products}
            />
          ) : null}
        </div>
      </aside>
    </>
  );
}
