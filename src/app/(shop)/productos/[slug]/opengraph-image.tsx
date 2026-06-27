import { ImageResponse } from "next/og";

import { getProductBySlug, getStoreSettings } from "@/lib/catalog";
import { formatCurrencyFromCents } from "@/lib/utils";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);

  const name = product?.name ?? "Producto";
  const price = product
    ? formatCurrencyFromCents(product.priceCents, settings.currency)
    : "";
  const category = product?.category.name ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "60px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
          color: "#fff",
          fontFamily: "serif",
        }}
      >
        {category ? (
          <div style={{ fontSize: 24, color: "#c9a227", marginBottom: 16, textTransform: "uppercase", letterSpacing: 2 }}>
            {category}
          </div>
        ) : null}
        <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>
          {name}
        </div>
        {price ? (
          <div style={{ fontSize: 36, color: "#c9a227", fontWeight: 600 }}>
            {price}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 30,
            padding: "10px 30px",
            borderRadius: 999,
            background: "#25D366",
            color: "#fff",
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          Pedir por WhatsApp
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
