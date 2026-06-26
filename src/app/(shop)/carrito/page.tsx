import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { ShopHeader } from "@/components/shop/shop-header";
import { WhatsappFloatingButton } from "@/components/shop/whatsapp-button";
import { StoreFooter } from "@/components/shop/store-footer";
import { CartSummary } from "@/components/shop/cart-summary";
import { sanitizeWhatsappNumber } from "@/lib/utils";
import { getStoreSettings } from "@/lib/catalog";

export default async function CartPage() {
  const settings = await getStoreSettings();
  const whatsappHref = `https://wa.me/${sanitizeWhatsappNumber(settings.whatsappNumber)}`;

  return (
    <>
      {/* Persistent sticky header */}
      <ShopHeader
        logoUrl={settings.logoUrl}
        storeName={settings.name}
        whatsappHref={whatsappHref}
        whatsappNumber={settings.whatsappNumber}
        freeShippingThresholdCents={settings.freeShippingThresholdCents}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 sm:pb-12 lg:px-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <Link href="/" className="flex items-center gap-1 transition hover:text-[var(--foreground)]">
            <Home className="size-3.5" />
            Inicio
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-[var(--foreground)]">Carrito</span>
        </nav>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
            Tu pedido
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Carrito de compras
          </h1>
        </div>

        <CartSummary />
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