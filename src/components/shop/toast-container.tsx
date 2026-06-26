"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import { useToastStore } from "@/store/toast";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[var(--accent)]/30 bg-[#1a1612]/95 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-[fadeInUp_0.25s_ease-out]"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
            <Check className="size-3.5" />
          </span>
          <p className="flex-1 text-sm font-medium text-[var(--foreground)]">
            {toast.message}
          </p>
          {toast.actionLabel && toast.onAction ? (
            <button
              className="shrink-0 rounded-full bg-[var(--accent)]/15 px-3 py-1 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/25"
              onClick={() => {
                toast.onAction?.();
                removeToast(toast.id);
              }}
              type="button"
            >
              {toast.actionLabel}
            </button>
          ) : null}
          <button
            aria-label="Cerrar"
            className="shrink-0 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            onClick={() => removeToast(toast.id)}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
