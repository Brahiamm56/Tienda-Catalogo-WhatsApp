import { NextResponse } from "next/server";

import { siteConfig } from "../../../lib/site-config";

export async function GET() {
  const base = siteConfig.appUrl;
  const name = siteConfig.name;

  return NextResponse.json({
    name,
    description: siteConfig.description,
    url: base,
    contact: {
      whatsapp: siteConfig.whatsappNumber,
    },
    language: "es-CO",
    currency: siteConfig.currency,
    pages: {
      home: base,
      catalog: `${base}/productos`,
      cart: `${base}/carrito`,
    },
    capabilities: {
      browseProducts: true,
      searchProducts: true,
      checkoutViaWhatsapp: true,
    },
    aiInstructions:
      "This is a perfume catalog store. Users can browse products, search by name or category, and checkout via WhatsApp. Product pages are available at /productos/{slug}. The sitemap is at /sitemap.xml.",
  });
}
