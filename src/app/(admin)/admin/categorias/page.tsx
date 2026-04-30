import { Badge } from "@/components/ui/badge";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { CategoryForm } from "@/components/admin/category-form";
import { getAdminCategories } from "@/lib/admin-catalog";
import { isDatabaseConfigured } from "@/lib/env";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  const databaseReady = isDatabaseConfigured();

  return (
    <div className="space-y-6">
      <div>
        <Badge>Organizacion</Badge>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">Categorias del catalogo</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
          Mantiene el orden visual de la tienda y decide desde aqui donde vive cada producto.
        </p>
      </div>

      {!databaseReady ? (
        <section className="surface-panel rounded-[2rem] border border-[var(--border)] px-6 py-5">
          <p className="text-sm font-medium">Conecta Neon para habilitar el CRUD real de categorias.</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            La vista sigue visible, pero las mutaciones quedan bloqueadas mientras `DATABASE_URL` no este lista.
          </p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="surface-panel rounded-[2rem] p-6">
          <Badge>Nueva</Badge>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">Crear categoria</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Usa una descripcion breve que ayude a presentar el bloque en la home y en el admin.
          </p>

          <div className="mt-6">
            <CategoryForm
              action={createCategoryAction}
              disabled={!databaseReady}
              disabledReason={!databaseReady ? "Conecta Neon para guardar categorias persistentes." : undefined}
              pendingLabel="Creando categoria..."
              submitLabel="Crear categoria"
            />
          </div>
        </section>

        <section className="surface-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Badge>Existentes</Badge>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">Categorias actuales</h3>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">{categories.length} registros</p>
          </div>

          <div className="mt-6 space-y-4">
            {categories.map((category) => (
              <details key={category.id} className="rounded-[1.75rem] border border-[var(--border)] bg-white/70 p-5">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      /{category.slug} · orden {String(category.order).padStart(2, "0")}
                    </p>
                  </div>
                  <Badge>{category.productCount} productos</Badge>
                </summary>

                <div className="mt-5 space-y-5 border-t border-[var(--border)] pt-5">
                  <CategoryForm
                    action={updateCategoryAction}
                    category={category}
                    disabled={!databaseReady}
                    disabledReason={!databaseReady ? "Conecta Neon para editar registros persistentes." : undefined}
                    pendingLabel="Guardando categoria..."
                    submitLabel="Guardar cambios"
                  />

                  <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[#fff7f2] px-4 py-4">
                    <div>
                      <p className="text-sm font-medium">Eliminar categoria</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        Solo puedes borrarla cuando no tenga productos asociados.
                      </p>
                    </div>

                    <ActionButton
                      action={deleteCategoryAction}
                      confirmMessage={`Eliminar ${category.name}?`}
                      fields={[{ name: "categoryId", value: category.id }]}
                      idleLabel="Eliminar"
                      pendingLabel="Eliminando..."
                    />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}