import { NextResponse } from "next/server";

import { hasAdminAccess } from "@/lib/admin";
import { getAuthSession } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { isCloudinaryConfigured } from "@/lib/env";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// Top-level folders allowed; subfolders allowed only if they start with one of these.
// Path traversal (".."), null bytes and absolute paths are explicitly rejected.
const ALLOWED_FOLDER_PREFIXES = ["catalog", "banners", "branding"];

function isAllowedFolder(folder: string): boolean {
  if (!folder || folder.length > 120) return false;
  if (folder.includes("..") || folder.includes("\0") || folder.startsWith("/")) return false;
  if (!/^[a-z0-9/_-]+$/i.test(folder)) return false;
  const root = folder.split("/")[0];
  return ALLOWED_FOLDER_PREFIXES.includes(root);
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Inicia sesion para solicitar uploads." }, { status: 401 });
  }

  if (!hasAdminAccess(session.user.role)) {
    return NextResponse.json({ error: "No tienes permisos para subir imagenes." }, { status: 403 });
  }

  // 30 signature requests per minute per user.
  const rl = rateLimit({
    key: `upload:${session.user.id ?? session.user.email ?? getClientIp(request)}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.success) return rateLimitResponse(rl);

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Configura Cloudinary en el .env antes de solicitar firmas de upload." },
      { status: 503 },
    );
  }

  let body: { folder?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const folderRaw = typeof body.folder === "string" ? body.folder.trim() : "catalog";
  if (!isAllowedFolder(folderRaw)) {
    return NextResponse.json({ error: "Carpeta no permitida." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder: folderRaw, timestamp },
    process.env.CLOUDINARY_API_SECRET ?? "",
  );

  return NextResponse.json({
    timestamp,
    folder: folderRaw,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}