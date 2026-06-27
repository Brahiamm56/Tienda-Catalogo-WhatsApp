import { siteConfig } from "@/lib/site-config";
import type { StoreSettings } from "@/schemas/settings";
import type { CatalogProduct } from "@/lib/catalog";

export function buildOrganizationSchema(settings: StoreSettings) {
  const url = siteConfig.appUrl;
  const sameAs = [
    settings.socialInstagram,
    settings.socialFacebook,
  ].filter(Boolean) as string[];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: settings.name,
    description: settings.description,
    url,
    logo: settings.logoUrl || undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  if (settings.locationAddress) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: settings.locationAddress,
    };
  }

  if (settings.locationLat && settings.locationLng) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: settings.locationLat,
      longitude: settings.locationLng,
    };
  }

  return schema;
}

export function buildWebsiteSchema(settings: StoreSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.name,
    url: siteConfig.appUrl,
    description: settings.description,
    inLanguage: "es-CO",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.appUrl}/productos?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildProductSchema(
  product: CatalogProduct,
  settings: StoreSettings,
) {
  const url = `${siteConfig.appUrl}/productos/${product.slug}`;
  const price = (product.priceCents / 100).toFixed(2);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.slice(0, 300),
    image: [product.image],
    url,
    category: product.category.name,
    brand: {
      "@type": "Brand",
      name: settings.name,
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: settings.currency,
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
      seller: {
        "@type": "Organization",
        name: settings.name,
      },
    },
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildItemListSchema(
  products: CatalogProduct[],
  settings: StoreSettings,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Catálogo de ${settings.name}`,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.appUrl}/productos/${product.slug}`,
      name: product.name,
    })),
  };
}

export function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto tarda el envío?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En Resistencia hacemos entrega el mismo día 🏍️. Para envíos nacionales el tiempo estimado es de 2 a 3 días hábiles. Te enviamos el número de seguimiento por WhatsApp en cuanto despachamos tu pedido. 🚚"
        }
      },
      {
        "@type": "Question",
        "name": "¿Métodos de pago?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aceptamos transferencia bancaria y Mercado Pago 💳, efectivo en efectivo 💵 y tarjetas de crédito/débito. Coordinamos el pago directamente por WhatsApp de forma rápida y segura. ✅"
        }
      },
      {
        "@type": "Question",
        "name": "¿Los perfumes son originales?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "¡Sí, 100%! Todos nuestros perfumes son originales y certificados. Trabajamos directamente con distribuidores autorizados para garantizarte calidad y autenticidad en cada compra. ✅"
        }
      },
      {
        "@type": "Question",
        "name": "¿Puedo devolver un producto?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aceptamos devoluciones dentro de los 7 días posteriores a la entrega, siempre que el producto esté sin usar y en su empaque original. Contáctanos por WhatsApp para iniciar el proceso. 📦"
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo hago un pedido?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Es muy sencillo: elige tu fragancia favorita, agrégala al carrito y al finalizar se abrirá WhatsApp con tu pedido listo. Nuestro equipo lo confirmará en minutos. 🛒"
        }
      },
      {
        "@type": "Question",
        "name": "¿Tienen precios por mayor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "¡Sí! Ofrecemos descuentos especiales para compras al por mayor. Escríbenos directamente por WhatsApp indicando las cantidades y te enviamos cotización personalizada. 📊"
        }
      }
    ]
  };
}

