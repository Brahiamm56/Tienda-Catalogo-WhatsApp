"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { AdminFormState } from "@/actions/admin-state";
import { initialAdminFormState } from "@/actions/admin-state";

type CategoryDeleteButtonProps = {
  action: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
  categoryId: string;
  categoryName: string;
  disabled?: boolean;
  hasProducts: boolean;
};

export function CategoryDeleteButton({
  action,
  categoryId,
  categoryName,
  disabled = false,
  hasProducts,
}: CategoryDeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    setError(null);
    const formData = new FormData();
    formData.append("categoryId", categoryId);

    startTransition(async () => {
      const result = await action(initialAdminFormState, formData);
      if (result.status === "error") {
        setError(result.message ?? "No se pudo eliminar.");
        return;
      }
      setShowConfirm(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        aria-label={`Eliminar ${categoryName}`}
        className="flex size-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowConfirm(true);
        }}
        title={`Eliminar ${categoryName}`}
        type="button"
      >
        <Trash2 className="size-4" />
      </button>

      {showConfirm ? (
        <div
          aria-modal
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => { if (!isPending) setShowConfirm(false); }}
          role="dialog"
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--surface-strong)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3 px-6 pt-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Eliminar categoría</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                ¿Seguro que quieres eliminar <strong className="font-semibold text-[var(--foreground)]">{categoryName}</strong>? {hasProducts ? "Los productos asociados serán reasignados automáticamente a otra categoría." : "Esta acción no se puede deshacer."}
              </p>
              {error ? (
                <p className="text-xs text-red-600">{error}</p>
              ) : null}
            </div>
            <div className="mt-5 flex gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <button
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface)] disabled:opacity-50"
                disabled={isPending}
                onClick={() => setShowConfirm(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                disabled={isPending}
                onClick={handleDelete}
                type="button"
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
