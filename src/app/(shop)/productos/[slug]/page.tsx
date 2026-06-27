import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight, Home, ShieldCheck, Sparkles, Truck, Wind, Heart, Flame } from "lucide-react";

import { ProductAddToCart } from "@/components/shop/product-add-to-cart";
import { StickyAddToCart } from "@/components/shop/sticky-add-to-cart";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { ShopHeader } from "@/components/shop/shop-header";
import { WhatsappFloatingButton } from "@/components/shop/whatsapp-button";
import { StoreFooter } from "@/components/shop/store-footer";
import { WhatsappButton } from "@/components/shop/whatsapp-button";
import { BackInStockNotify } from "@/components/shop/back-in-stock-notify";
import { Badge } from "@/components/ui/badge";
import { getCatalogProducts, getProductBySlug, getStoreSettings } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { formatCurrencyFromCents, sanitizeWhatsappNumber } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);
  if (!product) {
    return { title: "Producto no encontrado" };
  }
  const title = `${product.name} | ${settings.name}`;
  const description = product.description.slice(0, 160);
  const url = `${siteConfig.appUrl}/productos/${product.slug}`;
  const image = product.image;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: settings.name,
      type: "website",
      images: [{ url: image, width: 1200, height: 1200, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
    getCatalogProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const whatsappHref = `https://wa.me/${sanitizeWhatsappNumber(settings.whatsappNumber)}`;
  const productWhatsappHref = buildWhatsappLink(
    [
      {
        name: product.name,
        quantity: 1,
        priceCents: product.priceCents,
      },
    ],
    undefined,
    settings.whatsappNumber
  );

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [{ url: product.image, alt: product.name }];

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 3;
  const notes = parseOlfactoryNotes(product.description || "");

  // Related products: same category, exclude current product
  const relatedProducts = allProducts
    .filter((p) => p.category.slug === product.category.slug && p.id !== product.id)
    .slice(0, 8);

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
        {/* Breadcrumbs */}
        <nav className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <li>
              <Link className="flex items-center gap-1 transition hover:text-[var(--foreground)]" href="/">
                <Home className="size-3.5" />
                <span className="hidden sm:inline">Inicio</span>
              </Link>
            </li>
            <ChevronRight className="size-3 opacity-40" />
            <li>
              <Link className="transition hover:text-[var(--foreground)]" href="/productos">
                Productos
              </Link>
            </li>
            <ChevronRight className="size-3 opacity-40" />
            <li>
              <Link className="transition hover:text-[var(--foreground)]" href={`/productos?cat=${product.category.slug}`}>
                {product.category.name}
              </Link>
            </li>
            <ChevronRight className="size-3 opacity-40" />
            <li className="truncate font-medium text-[var(--foreground)]">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-4 sm:px-6 sm:pt-6 lg:gap-10 lg:px-10">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
            <ProductGallery images={galleryImages} accent={product.accent} />

            <div className="flex flex-col lg:sticky lg:top-24 lg:self-start lg:pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{product.category.name}</Badge>
                {inStock ? <Badge>Stock {product.stock}</Badge> : <Badge>Agotado</Badge>}
                {product.featured ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    <Sparkles className="size-3" />
                    Destacado
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]">
                {product.name}
              </h1>

              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)] sm:text-base sm:leading-8">
                {product.description}
              </p>

              {/* Pirámide Olfativa Visual Widget */}
              {notes && (
                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-black/40 p-4.5 backdrop-blur-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
                    <Sparkles className="size-4 text-[var(--accent)]" />
                    <h3 className="font-[family-name:var(--font-display)] text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                      Pirámide Olfativa
                    </h3>
                  </div>
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                        <Wind className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Salida (Primeros minutos)</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 capitalize">{notes.salida}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
                        <Heart className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-pink-400">Corazón (Cuerpo del perfume)</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 capitalize">{notes.corazon}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                        <Flame className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Fondo (Fijación y estela)</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 capitalize">{notes.fondo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-baseline gap-3.5">
                <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--accent)] sm:text-4xl">
                  {formatCurrencyFromCents(product.priceCents)}
                </p>
                <span className="text-lg text-[var(--muted-foreground)] line-through">
                  {formatCurrencyFromCents(Math.round(product.priceCents * 1.18))}
                </span>
                <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-400">
                  15% OFF
                </span>
                {lowStock ? (
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block w-full sm:inline sm:w-auto">
                    ¡Quedan pocas unidades!
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ProductAddToCart className="sm:flex-1" product={product} />
                <WhatsappButton className="sm:flex-1" href={productWhatsappHref}>
                  <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Pedir por WhatsApp
                </WhatsappButton>
              </div>

              <ul className="mt-7 grid gap-3 border-t border-[var(--border)] pt-6 text-sm sm:grid-cols-2">
                <li className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Truck className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">Envío coordinado</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Acordamos por WhatsApp.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">Compra segura</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Atención directa con la tienda.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 ? (
          <div className="mt-12 sm:mt-16">
            <ProductCarousel
              badge={`Más de ${product.category.name}`}
              href="/productos"
              products={relatedProducts}
              title="También te puede gustar"
            />
          </div>
        ) : null}
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

      {/* Sticky mobile CTA */}
      <StickyAddToCart product={product} />
    </>
  );
}

function parseOlfactoryNotes(description: string) {
  const desc = description.toLowerCase();
  
  const salidaRegex = /(?:notas de )?salida:\s*([^\n.]+)/i;
  const corazonRegex = /(?:notas de )?(?:corazón|corazon|medio):\s*([^\n.]+)/i;
  const fondoRegex = /(?:notas de )?(?:fondo|base):\s*([^\n.]+)/i;
  
  let salida = description.match(salidaRegex)?.[1]?.trim();
  let corazon = description.match(corazonRegex)?.[1]?.trim();
  let fondo = description.match(fondoRegex)?.[1]?.trim();
  
  if (!salida && !corazon && !fondo) {
    const commonNotes = {
      salida: ["limon", "limón", "bergamota", "mandarina", "naranja", "pomelo", "lavanda", "menta", "piña", "pina", "frutal", "cítrico", "citrico", "manzana", "neroli", "pimienta", "cardamomo", "jengibre"],
      corazon: ["jazmin", "jazmín", "rosa", "orquidea", "orquídea", "canela", "coco", "azafran", "azafrán", "clavo", "nuez moscada", "geranio", "violeta", "iris", "salvia", "miel"],
      fondo: ["vainilla", "sandalo", "sándalo", "ambar", "ámbar", "almizcle", "musk", "pachuli", "pachulí", "cedro", "cuero", "tabaco", "habas", "tonka", "madera", "musgo", "vetiver"]
    };
    
    const detectedSalida: string[] = [];
    const detectedCorazon: string[] = [];
    const detectedFondo: string[] = [];
    
    commonNotes.salida.forEach(item => {
      if (desc.includes(item) && !detectedSalida.includes(item)) {
        detectedSalida.push(item.charAt(0).toUpperCase() + item.slice(1));
      }
    });
    commonNotes.corazon.forEach(item => {
      if (desc.includes(item) && !detectedCorazon.includes(item)) {
        detectedCorazon.push(item.charAt(0).toUpperCase() + item.slice(1));
      }
    });
    commonNotes.fondo.forEach(item => {
      if (desc.includes(item) && !detectedFondo.includes(item)) {
        detectedFondo.push(item.charAt(0).toUpperCase() + item.slice(1));
      }
    });
    
    if (detectedSalida.length > 0) salida = detectedSalida.slice(0, 3).join(", ");
    if (detectedCorazon.length > 0) corazon = detectedCorazon.slice(0, 3).join(", ");
    if (detectedFondo.length > 0) fondo = detectedFondo.slice(0, 3).join(", ");
  }
  
  if (salida || corazon || fondo) {
    return {
      salida: salida || "Notas cítricas o frescas",
      corazon: corazon || "Notas florales o especiadas",
      fondo: fondo || "Maderas preciosas o ámbar"
    };
  }
  
  return null;
}