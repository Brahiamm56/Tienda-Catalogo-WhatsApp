import fs from "fs";
import path from "path";
import type { Metadata } from "next";

import { ProductCard } from "@/components/shop/product-card";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { StackCarousel } from "@/components/shop/stack-carousel";
import { StickyHomeCTA } from "@/components/shop/sticky-home-cta";
import { PerfumeShowcase } from "@/components/shop/perfume-showcase";
import { ShopHeader } from "@/components/shop/shop-header";
import { WhatsappFloatingButton } from "@/components/shop/whatsapp-button";
import { StoreFooter } from "@/components/shop/store-footer";
import { CategoryFilter } from "@/components/shop/category-filter";
import { ScrollReveal } from "@/components/shop/scroll-reveal";
import { JsonLd } from "@/components/shop/json-ld";
import { sanitizeWhatsappNumber } from "@/lib/utils";
import {
  getCatalogProducts,
  getCategories,
  getFeaturedProducts,
  getRecentProducts,
  getStoreSettings,
} from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";
import {
  buildOrganizationSchema,
  buildWebsiteSchema,
  buildItemListSchema,
  buildFaqSchema,
} from "@/lib/seo";

type PerfumeMeta = { name: string; brand: string; href?: string };

function getPerfumeShowcaseData(allProducts: any[]) {
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
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort();
  } catch {}
  return {
    images: files.map((f) => `/perfumes/${f}`),
    names: files.map((f) => meta[f]?.name ?? f.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").toUpperCase()),
    brands: files.map((f) => meta[f]?.brand ?? ""),
    hrefs: files.map((f) => {
      // 1. Prioritize metadata href if defined explicitly
      if (meta[f]?.href && meta[f].href !== "/productos") {
        return meta[f].href;
      }

      // 2. Check if the image represents multiple perfumes
      const isMultiple =
        f.toLowerCase().includes("juntos") ||
        f.toLowerCase().includes("parfams") ||
        f.toLowerCase().includes("set") ||
        f.toLowerCase().includes("combo") ||
        (meta[f]?.name && meta[f].name.toLowerCase().includes("set")) ||
        (meta[f]?.name && meta[f].name.toLowerCase().includes("combo")) ||
        (meta[f]?.name && meta[f].name.toLowerCase().includes("exclusivo"));

      if (isMultiple) {
        return "/productos";
      }

      // 3. Find matching product slug in Catalog
      const name = (meta[f]?.name ?? f.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")).toLowerCase().trim();
      const filenamePrefix = f.replace(/\.[^.]+$/, "").toLowerCase().trim();

      const matchedProduct = allProducts.find((p) => {
        const pSlug = p.slug.toLowerCase();
        const pName = p.name.toLowerCase();
        return (
          pSlug === filenamePrefix ||
          pSlug.includes(filenamePrefix) ||
          filenamePrefix.includes(pSlug) ||
          pName.includes(name) ||
          name.includes(pName)
        );
      });

      if (matchedProduct) {
        return `/productos/${matchedProduct.slug}`;
      }

      // Fallback
      return `/productos?q=${encodeURIComponent(meta[f]?.name ?? f.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "))}`;
    }),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const title = `${settings.name} — Catálogo de Perfumes por WhatsApp`;
  const description = settings.description;
  const url = siteConfig.appUrl;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url,
      siteName: settings.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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

  const orgSchema = buildOrganizationSchema(settings);
  const websiteSchema = buildWebsiteSchema(settings);
  const itemListSchema = buildItemListSchema(allProducts, settings);
  const faqSchema = buildFaqSchema();

  return (
    <>
      <JsonLd data={[orgSchema, websiteSchema, itemListSchema, faqSchema]} />
      <ShopHeader
        logoUrl={settings.logoUrl}
        storeName={settings.name}
        whatsappHref={whatsappHref}
        whatsappNumber={settings.whatsappNumber}
        freeShippingThresholdCents={settings.freeShippingThresholdCents}
      />

      <main id="main-content" className="pb-16 sm:pb-12">
        {/* 3D Perfume hero showcase */}
        {/* Auto-loaded from public/perfumes/ — edit metadata.json to set names & brands */}
        <PerfumeShowcase {...getPerfumeShowcaseData(allProducts)} />

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
                  <ScrollReveal as="h2" variant="word-by-word" className="font-[family-name:var(--font-display)] text-xl font-light italic tracking-wide text-[var(--foreground)] sm:text-2xl md:text-3xl">
                    Todas las fragancias
                  </ScrollReveal>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {allProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 4} />
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
