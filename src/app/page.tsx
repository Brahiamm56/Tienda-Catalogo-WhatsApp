import { ProductCard } from "@/components/shop/product-card";
import { BannerCarousel } from "@/components/shop/banner-carousel";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { ShopHeader } from "@/components/shop/shop-header";
import { WhatsappFloatingButton } from "@/components/shop/whatsapp-button";
import { StoreFooter } from "@/components/shop/store-footer";
import { CategoryFilter } from "@/components/shop/category-filter";
import { sanitizeWhatsappNumber } from "@/lib/utils";
import {
  getActiveBanners,
  getCatalogProducts,
  getCategories,
  getFeaturedProducts,
  getRecentProducts,
  getStoreSettings,
} from "@/lib/catalog";

export default async function Home() {
  const [banners, featured, recent, allProducts, categories, settings] = await Promise.all([
    getActiveBanners(),
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

      <main className="space-y-10 pb-28 sm:space-y-14 sm:pb-12">
        {/* Hero banner carousel */}
        <BannerCarousel banners={banners} />

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

            {/* Recién agregados */}
            {recent.length > 0 ? (
              <ProductCarousel
                badge="Acabados de llegar"
                href="/productos"
                products={recent}
                title="Recién agregados"
              />
            ) : null}

            {/* All products grid */}
            <section className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-10">
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Catálogo completo
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight sm:text-2xl">
                    Todos los productos
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
      </main>

      {/* Floating WhatsApp button */}
      <WhatsappFloatingButton whatsappHref={whatsappHref} />

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
