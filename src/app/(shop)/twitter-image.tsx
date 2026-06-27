import { ImageResponse } from "next/og";

import { getStoreSettings } from "@/lib/catalog";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = "Catálogo de perfumes por WhatsApp";

export default async function TwitterImage() {
  const settings = await getStoreSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
          color: "#c9a227",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, marginBottom: 20 }}>
          {settings.name}
        </div>
        <div style={{ fontSize: 36, color: "#e5e5e5", fontWeight: 300 }}>
          Catálogo de Perfumes por WhatsApp
        </div>
        <div
          style={{
            marginTop: 30,
            padding: "10px 30px",
            borderRadius: 999,
            background: "#25D366",
            color: "#fff",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          Compra fácil y rápido
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
