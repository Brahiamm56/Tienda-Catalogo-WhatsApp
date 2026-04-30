"use client";

import { Bell, Check } from "lucide-react";
import { useState } from "react";

type BackInStockNotifyProps = {
  productName: string;
};

export function BackInStockNotify({ productName }: BackInStockNotifyProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      setError("Por favor ingresa un email válido");
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("back-in-stock-notify") ?? "[]");
      stored.push({ email, productName, ts: Date.now() });
      localStorage.setItem("back-in-stock-notify", JSON.stringify(stored));
    } catch {}
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="size-4" />
        </span>
        <p className="text-sm font-medium text-emerald-800">
          ¡Listo! Te avisaremos cuando vuelva a estar disponible.
        </p>
      </div>
    );
  }

  return (
    <form
      className="rounded-2xl border border-[var(--border)] bg-white p-4 space-y-2.5"
      onSubmit={handleSubmit}
    >
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
          <Bell className="size-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            ¿Querés que te avisemos?
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            Te enviaremos un mail apenas vuelva el stock.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Tu email"
          className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          type="email"
          value={email}
        />
        <button
          className="btn-press rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          type="submit"
        >
          Avisame
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
