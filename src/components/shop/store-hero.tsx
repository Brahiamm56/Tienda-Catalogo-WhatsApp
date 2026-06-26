"use client";

import Link from "next/link";
import { ArrowRight, Boxes, LayoutDashboard, MessageCircleMore } from "lucide-react";

import { Spotlight } from "@/components/aceternity/spotlight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGsapContext, gsap } from "@/lib/gsap";
import type { StoreSettings } from "@/schemas/settings";

export function StoreHero({ settings }: { settings: StoreSettings }) {
  const rootRef = useGsapContext<HTMLElement>(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from("[data-anim='hero-badge']", { y: 20, opacity: 0, duration: 0.5 })
      .from("[data-anim='hero-title']", { y: 30, opacity: 0, duration: 0.8 }, "-=0.3")
      .from("[data-anim='hero-desc']", { y: 20, opacity: 0, duration: 0.6 }, "-=0.5")
      .from("[data-anim='hero-cta'] > *", { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.4")
      .from(
        "[data-anim='hero-card']",
        { y: 28, opacity: 0, scale: 0.97, duration: 0.7, stagger: 0.12, ease: "expo.out" },
        "-=0.6",
      );
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden px-6 pb-10 pt-6 lg:px-10 lg:pt-10"
    >
      <div className="surface-panel relative mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-[2.5rem] px-6 py-8 md:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-10 lg:py-12">
        <div className="grid-pattern absolute inset-0 opacity-60" />
        <Spotlight />

        <div className="relative z-10 flex flex-col gap-7">
          <div data-anim="hero-badge">
            <Badge>{settings.name}</Badge>
          </div>
          <div className="space-y-4">
            <h1 data-anim="hero-title" className="max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.94] tracking-tight text-balance md:text-7xl">
              Tienda moderna con cierre directo por WhatsApp y admin de stock listo para clonar.
            </h1>
            <p data-anim="hero-desc" className="max-w-2xl text-base leading-8 text-[var(--muted-foreground)] md:text-lg">
              {settings.description}. Base pensada para desplegar en Vercel con Neon, Cloudinary, Prisma y panel administrativo desde un solo proyecto.
            </p>
          </div>

          <div data-anim="hero-cta" className="flex flex-col gap-3 sm:flex-row">
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
          <article data-anim="hero-card" className="rounded-[2rem] border border-[var(--border)] bg-[#191512] p-6 text-[#f8f2eb] shadow-[0_20px_60px_rgba(25,21,18,0.18)]">
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

          <article data-anim="hero-card" className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-strong)] p-6">
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