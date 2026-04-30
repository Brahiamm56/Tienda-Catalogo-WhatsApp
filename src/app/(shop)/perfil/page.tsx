import { ShopHeader } from "@/components/shop/shop-header";
import { WhatsappFloatingButton } from "@/components/shop/whatsapp-button";
import { StoreFooter } from "@/components/shop/store-footer";
import { ProfilePage } from "@/components/shop/profile-page";
import { getStoreSettings } from "@/lib/catalog";
import { sanitizeWhatsappNumber } from "@/lib/utils";

export const metadata = {
  title: "Mi Perfil",
};

export default async function PerfilPage() {
  const settings = await getStoreSettings();
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

      <main className="pb-28 sm:pb-12">
        <ProfilePage />
      </main>

      <WhatsappFloatingButton whatsappHref={whatsappHref} />

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
