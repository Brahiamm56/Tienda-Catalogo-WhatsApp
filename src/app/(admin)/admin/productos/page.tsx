import { createProductAction, deleteProductAction, updateProductAction, updateProductStockAction } from "@/actions/admin";
import { ProductInventoryPanel } from "@/components/admin/product-inventory-panel";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-catalog";
import { isCloudinaryConfigured, isDatabaseConfigured } from "@/lib/env";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  const databaseReady = isDatabaseConfigured();
  const cloudinaryReady = isCloudinaryConfigured();

  return (
    <div className="space-y-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
        Productos y stock
      </h2>

      {!databaseReady ? (
        <section className="rounded-[2rem] border border-[var(--border)] bg-white/70 px-6 py-5 shadow-[0_16px_40px_rgba(28,19,13,0.07)]">
          <p className="text-sm font-medium">Completa `DATABASE_URL` para habilitar las mutaciones reales del admin.</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Mientras tanto puedes revisar la estructura del panel, pero crear, editar y borrar seguiran deshabilitados.
          </p>
        </section>
      ) : null}

      {categories.length === 0 ? (
        <section className="rounded-[2rem] border border-[var(--border)] bg-white/70 px-6 py-5 shadow-[0_16px_40px_rgba(28,19,13,0.07)]">
          <p className="text-sm font-medium">Crea al menos una categoria antes de cargar productos.</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            El formulario queda bloqueado hasta tener una categoria persistida a la que asociar el inventario.
          </p>
        </section>
      ) : null}

      <ProductInventoryPanel
        adjustStockAction={updateProductStockAction}
        categories={categories}
        cloudinaryEnabled={cloudinaryReady}
        createProductAction={createProductAction}
        databaseReady={databaseReady && categories.length > 0}
        deleteProductAction={deleteProductAction}
        products={products}
        updateProductAction={updateProductAction}
      />
    </div>
  );
}