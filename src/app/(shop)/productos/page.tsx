import { ShopHeader } from "@/components/shop/shop-header";
import { WhatsappFloatingButton } from "@/components/shop/whatsapp-button";
import { StoreFooter } from "@/components/shop/store-footer";
import { CatalogView } from "@/components/shop/catalog-view";
import { sanitizeWhatsappNumber } from "@/lib/utils";
import { getCatalogProducts, getCategories, getStoreSettings } from "@/lib/catalog";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; favoritos?: string }>;
}) {
  const { q, favoritos } = await searchParams;
  const [products, categories, settings] = await Promise.all([
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

      <main className="min-h-screen">
        <CatalogView
          categories={categories}
          initialQuery={q ?? ""}
          products={products}
          showFavoritesOnly={favoritos === "true"}
        />
      </main>

      {/* Floating WhatsApp button */}
      <WhatsappFloatingButton whatsappHref={whatsappHref} />

      {/* Store footer */}
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