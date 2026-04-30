import Link from "next/link";
import { ArrowRight, Boxes, LayoutDashboard, MessageCircleMore } from "lucide-react";

import { Spotlight } from "@/components/aceternity/spotlight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StoreSettings } from "@/schemas/settings";

export function StoreHero({ settings }: { settings: StoreSettings }) {
  return (
    <section className="relative overflow-hidden px-6 pb-10 pt-6 lg:px-10 lg:pt-10">
      <div className="surface-panel relative mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-[2.5rem] px-6 py-8 md:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-10 lg:py-12">
        <div className="grid-pattern absolute inset-0 opacity-60" />
        <Spotlight />

        <div className="relative z-10 flex flex-col gap-7">
          <Badge>{settings.name}</Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.94] tracking-tight text-balance md:text-7xl">
              Tienda moderna con cierre directo por WhatsApp y admin de stock listo para clonar.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--muted-foreground)] md:text-lg">
              {settings.description}. Base pensada para desplegar en Vercel con Neon, Cloudinary, Prisma y panel administrativo desde un solo proyecto.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent">
              <Link href="/productos">
                Ver catalogo
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">
                Entrar al admin
                <LayoutDashboard className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative z-10 grid gap-4">
          <article className="rounded-[2rem] border border-[var(--border)] bg-[#191512] p-6 text-[#f8f2eb] shadow-[0_20px_60px_rgba(25,21,18,0.18)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[#d8c9bc]">
              <span>Arquitectura</span>
              <Boxes className="size-4" />
            </div>
            <div className="mt-8 space-y-2">
              <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">Catalogo + Admin + WhatsApp</p>
              <p className="text-sm leading-6 text-[#d8c9bc]">
                Front, rutas API, auth, base de datos y storage preparados en un mismo repo para reutilizar por cliente.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--border)] bg-white/80 p-6">
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
              <MessageCircleMore className="size-4 text-[var(--accent)]" />
              Checkout sin pasarela: el pedido sale directo al WhatsApp del negocio.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--muted-foreground)]">Deploy</p>
                <p className="mt-1 font-semibold">Vercel</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">DB</p>
                <p className="mt-1 font-semibold">Neon + Prisma 7</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Uploads</p>
                <p className="mt-1 font-semibold">Cloudinary</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Admin</p>
                <p className="mt-1 font-semibold">Credenciales seguras</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}