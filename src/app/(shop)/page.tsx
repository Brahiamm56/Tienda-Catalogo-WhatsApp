import fs from "fs";
import path from "path";

import { ProductCard } from "@/components/shop/product-card";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { StackCarousel } from "@/components/shop/stack-carousel";
import { StickyHomeCTA } from "@/components/shop/sticky-home-cta";
import { PerfumeShowcase } from "@/components/shop/perfume-showcase";
import { ShopHeader } from "@/components/shop/shop-header";
import { WhatsappFloatingButton } from "@/components/shop/whatsapp-button";
import { StoreFooter } from "@/components/shop/store-footer";
import { CategoryFilter } from "@/components/shop/category-filter";
import { sanitizeWhatsappNumber } from "@/lib/utils";
import {
  getCatalogProducts,
  getCategories,
  getFeaturedProducts,
  getRecentProducts,
  getStoreSettings,
} from "@/lib/catalog";

type PerfumeMeta = { name: string; brand: string; href?: string };

function getPerfumeShowcaseData() {
  const dir = path.join(process.cwd(), "public", "perfumes");
  let meta: Record<string, PerfumeMeta> = {};
  try {
    const mp = path.join(dir, "metadata.json");
    if (fs.existsSync(mp)) {
      const raw = JSON.parse(fs.readFileSync(mp, "utf-8")) as Record<string, PerfumeMeta>;
      Object.entries(raw).forEach(([k, v]) => {
        if (v && typeof v === "object" && "name" in v) meta[k] = v;
      });
    }
  } catch {}
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && f !== "9pmeleixir.png")
      .sort();
  } catch {}
  return {
    images: files.map((f) => `/perfumes/${f}`),
    names: files.map((f) => meta[f]?.name ?? f.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").toUpperCase()),
    brands: files.map((f) => meta[f]?.brand ?? ""),
    hrefs: files.map((f) => meta[f]?.href ?? "/productos"),
  };
}

export default async function Home() {
  const [featured, recent, allProducts, categories, settings] = await Promise.all([
    getFeaturedProducts(),
    getRecentProducts(8),
    getCatalogProducts(),
    getCategories(),
    getStoreSettings(),
  ]);

  const whatsappHref = `https://wa.me/${sanitizeWhatsappNumber(settings.whatsappNumber)}`;

  return (
    <>
      <ShopHeader
        logoUrl={settings.logoUrl}
        storeName={settings.name}
        whatsappHref={whatsappHref}
        whatsappNumber={settings.whatsappNumber}
        freeShippingThresholdCents={settings.freeShippingThresholdCents}
      />

      <main className="pb-16 sm:pb-12">
        {/* 3D Perfume hero showcase */}
        {/* Auto-loaded from public/perfumes/ — edit metadata.json to set names & brands */}
        <PerfumeShowcase {...getPerfumeShowcaseData()} />

        {/* Smooth gradient transition from black hero to ambient background */}
        <div className="pointer-events-none h-8 bg-gradient-to-b from-black via-[#050505] to-transparent sm:h-10" />

        {/* Gold divider */}
        <div className="gold-scan-line mx-auto w-full max-w-3xl" />

        {/* Products section */}
        <div className="space-y-6 pt-2 sm:space-y-8">
        {/* Category chips — filters products in-page */}
        {categories.length > 0 ? (
          <CategoryFilter
            categories={categories}
            allProducts={allProducts}
            featured={featured}
            recent={recent}
          />
        ) : (
          <>
            {/* Más vendidos */}
            {featured.length > 0 ? (
              <ProductCarousel
                badge="Más buscados"
                href="/productos"
                products={featured}
                title="Más vendidos"
              />
            ) : null}

            {/* Perfumes Destacados */}
            {recent.length > 0 ? (
              <StackCarousel
                badge="Acabados de llegar"
                products={recent}
                title="Perfumes Destacados"
              />
            ) : null}

            {/* All products grid */}
            <section className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-10">
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-[var(--accent)] animate-gold-shimmer">
                    Catálogo completo
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-light italic tracking-wide text-[var(--foreground)] sm:text-2xl md:text-3xl">
                    Todas las fragancias
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </>
        )}


        </div>
      </main>

      {/* Floating WhatsApp button */}
      <WhatsappFloatingButton whatsappHref={whatsappHref} />

      {/* Sticky mobile CTA */}
      <StickyHomeCTA />

      {/* Store footer with hours + map */}
      <StoreFooter
        businessHours={settings.businessHours}
        description={settings.description}
        locationAddress={settings.locationAddress}
        locationLat={settings.locationLat}
        locationLng={settings.locationLng}
        socialFacebook={settings.socialFacebook}
        socialInstagram={settings.socialInstagram}
        storeName={settings.name}
        whatsappHref={whatsappHref}
      />
    </>
  );
}
