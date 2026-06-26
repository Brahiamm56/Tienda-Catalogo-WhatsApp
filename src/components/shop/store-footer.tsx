"use client";

import { Clock, ExternalLink, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import type { BusinessHour } from "@/schemas/settings";

type StoreFooterProps = {
  storeName: string;
  description?: string;
  whatsappHref: string;
  businessHours?: BusinessHour[];
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
  socialFacebook?: string;
  socialInstagram?: string;
};

const DEFAULT_HOURS: BusinessHour[] = [
  { day: "Lunes", open: "09:00", close: "18:00" },
  { day: "Martes", open: "09:00", close: "18:00" },
  { day: "Miércoles", open: "09:00", close: "18:00" },
  { day: "Jueves", open: "09:00", close: "18:00" },
  { day: "Viernes", open: "09:00", close: "18:00" },
  { day: "Sábado", open: "09:00", close: "13:00" },
  { day: "Domingo", open: "", close: "", closed: true },
];

export function StoreFooter({
  storeName,
  description,
  whatsappHref,
  businessHours,
  locationAddress,
  locationLat,
  locationLng,
  socialFacebook,
  socialInstagram,
}: StoreFooterProps) {
  const hours = businessHours && businessHours.length > 0 ? businessHours : DEFAULT_HOURS;
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);

  useEffect(() => {
    const dayMap: Record<string, number> = {
      Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3,
      Jueves: 4, Viernes: 5, Sábado: 6,
    };
    const today = new Date().getDay();
    const todayIndex = hours.findIndex((h) => dayMap[h.day] === today);
    setCurrentDayIndex(todayIndex);
  }, [hours]);
  const hasLocation = locationLat !== undefined && locationLng !== undefined;
  const googleMapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${locationLat},${locationLng}`
    : undefined;
  // OpenStreetMap embed: no API key, no X-Frame-Options blocking
  const mapEmbedUrl = hasLocation
    ? (() => {
        const lat = locationLat!;
        const lng = locationLng!;
        const delta = 0.005;
        const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
      })()
    : undefined;

  const extractSocialHandle = (url: string, defaultLabel: string) => {
    try {
      const path = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
      const handle = path.split("/")[0];
      return handle ? `@${handle}` : defaultLabel;
    } catch {
      return defaultLabel;
    }
  };

  return (
    <footer className="mt-10 border-t border-[var(--border)] sm:mt-16">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        {/* Store name + WhatsApp */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-light italic tracking-wide text-[var(--foreground)]">
              {storeName}
            </h3>
            {description ? (
              <p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                {description}
              </p>
            ) : null}
          </div>
          <a
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-5 py-2.5 text-sm font-medium text-[#25D366] transition hover:-translate-y-0.5 hover:bg-[#25D366]/15"
            href={whatsappHref}
            rel="noreferrer"
            target="_blank"
          >
            {/* WhatsApp SVG logo */}
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contactar por WhatsApp
          </a>
        </div>

        {/* Hours + Location row */}
        <div className="mt-8 grid gap-8 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Business hours */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="size-4 text-[var(--accent)]" />
              <h4 className="text-[9px] font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
                Horarios
              </h4>
            </div>
            <div className="space-y-0">
              {hours.map((h, i) => (
                <div
                  className={`flex items-center justify-between border-b py-2 text-sm last:border-0 ${
                    i === currentDayIndex
                      ? "rounded-lg border-[var(--accent)]/30 bg-[var(--accent)]/8 px-2 -mx-2"
                      : "border-[var(--border)]"
                  }`}
                  key={h.day}
                >
                  <span
                    className={`font-medium ${
                      i === currentDayIndex ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                    }`}
                  >
                    {h.day}
                    {i === currentDayIndex && (
                      <span className="ml-1.5 text-[8px] uppercase tracking-wider text-[var(--accent)]">Hoy</span>
                    )}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {h.closed || (!h.open && !h.close) ? (
                      <span className="text-xs italic">Cerrado</span>
                    ) : (
                      `${h.open} – ${h.close}`
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location / Map */}
          <div className="md:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="size-4 text-[var(--accent)]" />
              <h4 className="text-[9px] font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
                Ubicación
              </h4>
            </div>

            {locationAddress ? (
              <p className="mb-3 text-sm text-[var(--foreground)]">{locationAddress}</p>
            ) : null}

            {hasLocation && mapEmbedUrl ? (
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
                <iframe
                  allowFullScreen
                  className="h-[220px] w-full sm:h-[260px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapEmbedUrl}
                  title="Ubicación de la tienda"
                />
              </div>
            ) : null}

            {googleMapsUrl ? (
              <a
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] transition hover:underline"
                href={googleMapsUrl}
                rel="noreferrer"
                target="_blank"
              >
                Abrir en Google Maps
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-5 sm:flex-row">
          <p className="text-center text-xs text-[var(--muted-foreground)] sm:text-left">
            © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
          </p>

          {/* Social Media */}
          {(socialFacebook || socialInstagram) && (
            <div className="flex flex-wrap items-center gap-3">
              {socialInstagram && (
                <a
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition hover:-translate-y-0.5 hover:border-[#E4405F]/40 hover:text-[#E4405F]"
                  href={socialInstagram}
                  rel="noreferrer"
                  target="_blank"
                  aria-label="Instagram"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>{extractSocialHandle(socialInstagram, "Instagram")}</span>
                </a>
              )}
              {socialFacebook && (
                <a
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition hover:-translate-y-0.5 hover:border-[#1877F2]/40 hover:text-[#1877F2]"
                  href={socialFacebook}
                  rel="noreferrer"
                  target="_blank"
                  aria-label="Facebook"
                >
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                  <span>{extractSocialHandle(socialFacebook, "Facebook")}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
