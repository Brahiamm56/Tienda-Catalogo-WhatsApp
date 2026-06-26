import { Suspense } from "react";
import { Receipt, ShoppingBag, TrendingUp, Wallet } from "lucide-react";

import { NewSaleTrigger } from "@/components/admin/new-sale-trigger";
import StatsCard from "@/components/admin/stats-card";
import { getAdminProducts } from "@/lib/admin-catalog";
import { getSales, getSalesSummary } from "@/lib/admin-sales";
import { isDatabaseConfigured } from "@/lib/env";
import { formatCurrencyFromCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-[var(--surface-strong)] text-[var(--muted-foreground)] border-[var(--border)]",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminVentasPage() {
  const databaseReady = isDatabaseConfigured();
  const [sales, summary, products] = await Promise.all([
    getSales(50),
    getSalesSummary(),
    getAdminProducts(),
  ]);

  const productOptions = products
    .filter((p) => p.status === "PUBLISHED")
    .map((p) => ({
      id: p.id,
      name: p.name,
      priceCents: p.priceCents,
      stock: p.stock,
      sku: p.sku ?? null,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--foreground)]">
            Ventas
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Historial completo de ventas registradas y resumen del período.
          </p>
        </div>

        <Suspense fallback={null}>
          <NewSaleTrigger products={productOptions} />
        </Suspense>
      </div>

      {!databaseReady ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Configura <code className="font-mono">DATABASE_URL</code> para registrar y listar ventas reales.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={Wallet}
          title="Hoy"
          value={formatCurrencyFromCents(summary.todayCents)}
        />
        <StatsCard
          icon={TrendingUp}
          title="Últimos 7 días"
          value={formatCurrencyFromCents(summary.last7DaysCents)}
        />
        <StatsCard
          icon={ShoppingBag}
          title="Total ventas"
          value={summary.salesCount.toString()}
        />
        <StatsCard
          icon={Receipt}
          title="Completadas"
          value={`${summary.completedCount} / ${summary.pendingCount} pend.`}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground)]">
            Historial
          </h3>
          <span className="text-xs text-slate-400">{sales.length} registro{sales.length === 1 ? "" : "s"}</span>
        </div>

        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Receipt className="mb-3 size-10 text-slate-300" />
            <p className="text-sm font-medium text-[var(--muted-foreground)]">Aún no hay ventas registradas.</p>
            <p className="mt-1 text-xs text-slate-400">
              Pulsa <span className="font-semibold">Nueva venta</span> para registrar la primera.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-[var(--surface)]/60 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Entrega</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[var(--surface)]/60">
                    <td className="whitespace-nowrap px-5 py-3 text-[var(--muted-foreground)]">{formatDate(sale.createdAt)}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-[var(--foreground)]">{sale.customerName ?? "Mostrador"}</p>
                      {sale.customerPhone ? (
                        <p className="text-xs text-slate-400">{sale.customerPhone}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">{sale.itemCount}</td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">{sale.deliveryMethod ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          STATUS_STYLE[sale.status] ?? STATUS_STYLE.PENDING
                        }`}
                      >
                        {STATUS_LABEL[sale.status] ?? sale.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-[var(--foreground)]">
                      {formatCurrencyFromCents(sale.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
