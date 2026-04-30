"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Package, Pencil, Plus, Trash2, TrendingUp, XCircle } from "lucide-react";
import { useDeferredValue, useState, useTransition } from "react";

import type { AdminFormState } from "@/actions/admin-state";
import { initialAdminFormState } from "@/actions/admin-state";
import { ProductDrawer } from "@/components/admin/product-drawer";
import { StockAdjuster } from "@/components/admin/stock-adjuster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminCategory, AdminProduct } from "@/lib/admin-catalog";
import { formatCurrencyFromCents } from "@/lib/utils";

type ProductInventoryPanelProps = {
  adjustStockAction: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
  categories: AdminCategory[];
  cloudinaryEnabled: boolean;
  createProductAction: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
  databaseReady: boolean;
  deleteProductAction: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
  products: AdminProduct[];
  updateProductAction: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
};

const lowStockThreshold = 3;

export function ProductInventoryPanel({
  adjustStockAction,
  categories,
  cloudinaryEnabled,
  createProductAction,
  databaseReady,
  deleteProductAction,
  products,
  updateProductAction,
}: ProductInventoryPanelProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const router = useRouter();
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.slug.toLowerCase().includes(normalizedSearch) ||
      product.category.name.toLowerCase().includes(normalizedSearch) ||
      (product.sku ?? "").toLowerCase().includes(normalizedSearch);

    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockCount = products.filter((product) => product.stock <= lowStockThreshold).length;
  const publishedCount = products.filter((product) => product.status === "PUBLISHED").length;
  const draftCount = products.filter((product) => product.status === "DRAFT").length;
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const totalInventoryValueCents = products.reduce((sum, p) => sum + p.priceCents * p.stock, 0);

  function openCreateDrawer() {
    setSelectedProductId(null);
    setDrawerMode("create");
  }

  function openEditDrawer(productId: string) {
    setSelectedProductId(productId);
    setDrawerMode("edit");
  }

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedProductId(null);
  }

  function confirmDelete() {
    if (!productToDelete) return;
    const formData = new FormData();
    formData.append("productId", productToDelete.id);
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteProductAction(initialAdminFormState, formData);
      if (result.status === "error") {
        setDeleteError(result.message ?? "No se pudo eliminar.");
        router.refresh();
        return;
      }
      setProductToDelete(null);
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white px-6 py-5 shadow-sm">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Package className="size-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Total Productos</p>
            <p className="text-3xl font-bold tracking-tight">{products.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white px-6 py-5 shadow-sm">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Valor Inventario</p>
            <p className="text-2xl font-bold tracking-tight">{formatCurrencyFromCents(totalInventoryValueCents)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white px-6 py-5 shadow-sm">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <AlertTriangle className="size-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Stock Bajo</p>
            <p className="text-3xl font-bold tracking-tight">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-5 py-4 shadow-sm">
        <Input
          className="min-w-[200px] flex-1"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, código o categoría..."
          value={search}
        />

        <Select className="w-48" onChange={(e) => setCategoryFilter(e.target.value)} value={categoryFilter}>
          <option value="all">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <Select className="w-36" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
          <option value="all">Todos</option>
          <option value="PUBLISHED">Publicados</option>
          <option value="DRAFT">Borradores</option>
          <option value="ARCHIVED">Archivados</option>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-[var(--muted-foreground)] sm:block">
            {filteredProducts.length} de {products.length}
          </span>
          <Button onClick={openCreateDrawer} type="button" variant="accent">
            <Plus className="mr-2 size-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-gray-50/80">
                <th className="px-5 py-3.5 text-left font-medium text-[var(--muted-foreground)]">Producto</th>
                <th className="px-4 py-3.5 text-left font-medium text-[var(--muted-foreground)]">Código</th>
                <th className="px-4 py-3.5 text-left font-medium text-[var(--muted-foreground)]">Categoría</th>
                <th className="px-4 py-3.5 text-right font-medium text-[var(--muted-foreground)]">P. Venta</th>
                <th className="px-4 py-3.5 text-center font-medium text-[var(--muted-foreground)]">Stock</th>
                <th className="px-4 py-3.5 text-center font-medium text-[var(--muted-foreground)]">Estado</th>
                <th className="px-4 py-3.5 text-right font-medium text-[var(--muted-foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td className="px-5 py-14 text-center text-[var(--muted-foreground)]" colSpan={7}>
                    No hay productos que coincidan con los filtros.
                  </td>
                </tr>
              ) : null}

              {filteredProducts.map((product) => {
                const isCritical = product.stock === 0;
                const isLow = product.stock > 0 && product.stock <= lowStockThreshold;
                return (
                  <tr key={product.id} className="group transition-colors hover:bg-gray-50/60">
                    {/* Producto */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          <Image
                            alt={product.imageAlt || product.name}
                            className="object-cover"
                            fill
                            sizes="40px"
                            src={product.image}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[200px] truncate font-medium text-gray-900">{product.name}</p>
                          <p className="truncate text-xs text-[var(--muted-foreground)]">/{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Código / SKU */}
                    <td className="px-4 py-3.5 font-mono text-xs text-[var(--muted-foreground)]">
                      {product.sku ?? "—"}
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3.5 text-[var(--muted-foreground)]">{product.category.name}</td>

                    {/* Precio */}
                    <td className="px-4 py-3.5 text-right font-medium tabular-nums text-gray-800">
                      {formatCurrencyFromCents(product.priceCents)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={`text-base font-bold tabular-nums ${
                            isCritical ? "text-red-600" : isLow ? "text-orange-500" : "text-gray-800"
                          }`}
                        >
                          {product.stock}
                        </span>
                        <StockAdjuster
                          action={adjustStockAction}
                          currentStock={product.stock}
                          disabled={!databaseReady}
                          productId={product.id}
                        />
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                          <XCircle className="size-3" />
                          Crítico
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                          <AlertTriangle className="size-3" />
                          Bajo
                        </span>
                      ) : product.status === "DRAFT" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Borrador
                        </span>
                      ) : product.status === "ARCHIVED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Archivado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                          <CheckCircle2 className="size-3" />
                          OK
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          aria-label={`Editar ${product.name}`}
                          className="flex size-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEditDrawer(product.id)}
                          title="Editar"
                          type="button"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          aria-label={`Eliminar ${product.name}`}
                          className="flex size-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition hover:bg-red-50 hover:text-red-600"
                          disabled={!databaseReady}
                          onClick={() => {
                            setDeleteError(null);
                            setProductToDelete(product);
                          }}
                          title="Eliminar"
                          type="button"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer stats */}
        <div className="flex flex-wrap items-center gap-5 border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--muted-foreground)]">
          <span>
            Publicados: <strong className="text-gray-700">{publishedCount}</strong>
          </span>
          <span>
            Borradores: <strong className="text-gray-700">{draftCount}</strong>
          </span>
          <span>
            Stock bajo:{" "}
            <strong className={lowStockCount > 0 ? "text-orange-600" : "text-gray-700"}>{lowStockCount}</strong>
          </span>
        </div>
      </div>

      <ProductDrawer
        categories={categories}
        cloudinaryEnabled={cloudinaryEnabled}
        createProductAction={createProductAction}
        databaseReady={databaseReady}
        mode={drawerMode}
        onClose={closeDrawer}
        product={selectedProduct}
        updateProductAction={updateProductAction}
      />

      {/* Custom delete confirmation modal */}
      {productToDelete ? (
        <div
          aria-modal
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isDeleting) setProductToDelete(null);
          }}
          role="dialog"
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3 px-6 pt-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Eliminar producto</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                ¿Seguro que quieres eliminar <strong className="font-semibold text-gray-800">{productToDelete.name}</strong>? Esta acción no se puede deshacer.
              </p>
              {deleteError ? (
                <p className="text-xs text-red-600">{deleteError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex gap-2 border-t border-[var(--border)] bg-gray-50 px-4 py-3">
              <button
                className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                disabled={isDeleting}
                onClick={confirmDelete}
                type="button"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}