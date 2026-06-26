import Image from "next/image";

import { createBannerAction, deleteBannerAction, updateBannerAction } from "@/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { BannerForm } from "@/components/admin/banner-form";
import { getAdminBanners } from "@/lib/admin-catalog";
import { isCloudinaryConfigured, isDatabaseConfigured } from "@/lib/env";

export default async function AdminBannersPage() {
  const banners = await getAdminBanners();
  const databaseReady = isDatabaseConfigured();
  const cloudinaryEnabled = isCloudinaryConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
          Banners de la home
        </h2>
      </div>

      {!databaseReady ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 text-sm">
          Conecta Neon para administrar los banners.
        </section>
      ) : null}

      <div className="space-y-6">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
          <h3 className="text-sm font-semibold">Crear banner</h3>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Aparecerá en el carrusel principal de la tienda.
          </p>
          <div className="mt-5">
            <BannerForm
              action={createBannerAction}
              cloudinaryEnabled={cloudinaryEnabled}
              disabled={!databaseReady}
              pendingLabel="Creando banner..."
              showPreview
              submitLabel="Crear banner"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Banners actuales</h3>
            <span className="text-xs text-[var(--muted-foreground)]">{banners.length} registros</span>
          </div>

          <div className="mt-5 space-y-3">
            {banners.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Aún no hay banners creados.</p>
            ) : null}

            {banners.map((banner) => (
              <details key={banner.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[#fafaf8]">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--background)]">
                    <Image
                      alt={banner.title}
                      className="object-cover"
                      fill
                      sizes="80px"
                      src={banner.imageUrl}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{banner.title}</p>
                    <p className="truncate text-xs text-[var(--muted-foreground)]">
                      orden {banner.order} · {banner.active ? "activo" : "oculto"}
                    </p>
                  </div>
                </summary>

                <div className="space-y-4 border-t border-[var(--border)] bg-[var(--surface-strong)] p-4">
                  <BannerForm
                    action={updateBannerAction}
                    banner={banner}
                    cloudinaryEnabled={cloudinaryEnabled}
                    disabled={!databaseReady}
                    pendingLabel="Guardando..."
                    showPreview
                    submitLabel="Guardar cambios"
                  />

                  <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#fff7f2] px-3 py-3">
                    <p className="text-xs">Eliminar este banner</p>
                    <ActionButton
                      action={deleteBannerAction}
                      confirmMessage={`Eliminar banner "${banner.title}"?`}
                      fields={[{ name: "bannerId", value: banner.id }]}
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
