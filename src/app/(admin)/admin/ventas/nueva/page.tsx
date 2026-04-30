import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NewSaleForm } from "@/components/admin/new-sale-form";
import { createSaleAction } from "@/actions/sales";
import { getAdminProducts } from "@/lib/admin-catalog";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function NuevaVentaPage() {
  const databaseReady = isDatabaseConfigured();
  const products = await getAdminProducts();

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
      <div>
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
          href="/admin/ventas"
        >
          <ArrowLeft className="size-3.5" />
          Volver al historial
        </Link>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-slate-800">
          Nueva venta
        </h2>
        <p className="text-sm text-slate-500">
          Registra una venta manual. El stock se descontará automáticamente al guardarla.
        </p>
      </div>

      {!databaseReady ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Configura <code className="font-mono">DATABASE_URL</code> para registrar ventas reales.
        </div>
      ) : null}

      <NewSaleForm action={createSaleAction} products={productOptions} />
    </div>
  );
}
