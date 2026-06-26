"use client";

type BannerPreviewProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
};

export function BannerPreview({ title, subtitle, ctaLabel, ctaHref, imageUrl }: BannerPreviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Vista previa
        </p>
        <p className="text-[10px] text-[var(--muted-foreground)]">Como se verá en la tienda</p>
      </div>

      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[#111]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={title || "Vista previa"}
            className="absolute inset-0 h-full w-full object-cover"
            src={imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-white/60">
            Sube una imagen para ver el preview
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end gap-2 p-4 text-white sm:gap-3 sm:p-6 md:max-w-[60%]">
          {title ? (
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight sm:text-2xl md:text-3xl">
              {title}
            </h2>
          ) : (
            <p className="text-xs italic text-white/60">El título aparecerá aquí</p>
          )}
          {subtitle ? (
            <p className="max-w-xl text-xs text-white/90 sm:text-sm">{subtitle}</p>
          ) : null}
          {ctaLabel ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] sm:px-4 sm:py-2 sm:text-sm">
              {ctaLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--muted-foreground)]">
        {ctaHref ? <span>Enlace: <span className="font-mono text-[var(--foreground)]">{ctaHref}</span></span> : null}
      </div>
    </div>
  );
}
