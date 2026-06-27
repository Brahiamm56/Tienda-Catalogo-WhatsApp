"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import type { AdminFormState } from "@/actions/admin-state";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import type { AdminCategory, AdminProduct } from "@/lib/admin-catalog";

type ProductDrawerProps = {
  categories: AdminCategory[];
  cloudinaryEnabled: boolean;
  createProductAction: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
  databaseReady: boolean;
  mode: "create" | "edit" | null;
  onClose: () => void;
  product: AdminProduct | null;
  updateProductAction: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
};

export function ProductDrawer({
  categories,
  cloudinaryEnabled,
  createProductAction,
  databaseReady,
  mode,
  onClose,
  product,
  updateProductAction,
}: ProductDrawerProps) {
  const isOpen = mode !== null;
  const isCreate = mode === "create";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  if (!isCreate && !product) {
    return null;
  }

  const title = isCreate ? "Nuevo producto" : product?.name ?? "Producto";

  return (
    <>
      <button
        aria-label="Cerrar drawer de producto"
        className="fixed inset-0 z-40 bg-[rgba(17,12,9,0.32)] backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />

      <aside className="animate-slide-in-right fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[var(--border)] bg-[#0c0c0e] shadow-[0_8px_40px_rgba(0,0,0,0.12)] sm:max-w-[620px]">
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[#0c0c0e] px-5 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
                {isCreate ? "Crear" : "Editar"}
              </span>
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            </div>

            <Button onClick={onClose} size="icon" type="button" variant="ghost">
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <ProductForm
              action={isCreate ? createProductAction : updateProductAction}
              categories={categories}
              cloudinaryEnabled={cloudinaryEnabled}
              disabled={!databaseReady}
              disabledReason={!databaseReady ? "Conecta Neon para guardar cambios persistentes." : undefined}
              onSuccess={onClose}
              pendingLabel={isCreate ? "Creando producto..." : "Guardando cambios..."}
              product={isCreate ? undefined : product ?? undefined}
              submitLabel={isCreate ? "Crear producto" : "Guardar cambios"}
            />
          </div>
        </div>
      </aside>
    </>
  );
}