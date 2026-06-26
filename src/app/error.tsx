"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-8 shadow-2xl">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Algo salió mal</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Ha ocurrido un error inesperado en el servidor. Si estás en producción, asegúrate de tener configuradas todas las variables de entorno (como <code className="bg-[var(--surface)] px-1 py-0.5 rounded">NEXTAUTH_SECRET</code> y la base de datos).
        </p>
        <p className="text-xs text-red-400 font-mono mt-2 bg-red-500/10 p-2 rounded-lg w-full overflow-auto text-left">
          {error.message || "Error interno del servidor"}
        </p>
        <button
          onClick={() => reset()}
          className="mt-4 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-strong)]"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
