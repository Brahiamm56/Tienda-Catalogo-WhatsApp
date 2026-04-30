const placeholderFragments = ["change-me", "replace-with"];

const envChecklist = [
  { key: "DATABASE_URL", label: "Base de datos Neon", group: "Core" },
  { key: "NEXTAUTH_SECRET", label: "Sesion de admin", group: "Auth" },
  { key: "NEXTAUTH_URL", label: "URL de autenticacion", group: "Auth" },
  { key: "ADMIN_EMAIL", label: "Usuario administrador", group: "Auth" },
  { key: "ADMIN_PASSWORD", label: "Password inicial", group: "Auth" },
  { key: "NEXT_PUBLIC_APP_URL", label: "URL publica", group: "Store" },
  { key: "NEXT_PUBLIC_STORE_NAME", label: "Nombre de tienda", group: "Store" },
  { key: "NEXT_PUBLIC_STORE_DESCRIPTION", label: "Descripcion publica", group: "Store" },
  { key: "NEXT_PUBLIC_WHATSAPP_NUMBER", label: "WhatsApp de ventas", group: "Store" },
  { key: "NEXT_PUBLIC_CURRENCY", label: "Moneda", group: "Store" },
  { key: "CLOUDINARY_CLOUD_NAME", label: "Cloudinary cloud name", group: "Media" },
  { key: "CLOUDINARY_API_KEY", label: "Cloudinary API key", group: "Media" },
  { key: "CLOUDINARY_API_SECRET", label: "Cloudinary API secret", group: "Media" },
] as const;

function hasConfiguredValue(value?: string | null) {
  if (!value) {
    return false;
  }

  return !placeholderFragments.some((fragment) => value.includes(fragment));
}

export function isDatabaseConfigured() {
  return hasConfiguredValue(process.env.DATABASE_URL);
}

export function isCloudinaryConfigured() {
  return [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ].every((value) => hasConfiguredValue(value));
}

export function isAuthConfigured() {
  return hasConfiguredValue(process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET);
}

export function getEnvironmentChecklist() {
  return envChecklist.map((item) => ({
    ...item,
    ready: hasConfiguredValue(process.env[item.key]),
  }));
}

/**
 * Production guard. Throws if critical env vars are missing in production.
 * Call from server entry points (routes, server actions, lib/prisma) once.
 */
let assertedProductionEnv = false;
export function assertProductionEnv() {
  if (assertedProductionEnv) return;
  if (process.env.NODE_ENV !== "production") {
    assertedProductionEnv = true;
    return;
  }

  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL"];
  const missing = required.filter((key) => !hasConfiguredValue(process.env[key]));
  if (missing.length > 0) {
    // Do not include actual values, just keys.
    throw new Error(
      `[env] Missing required production env vars: ${missing.join(", ")}. ` +
        `Configure them in your hosting secret manager before booting.`,
    );
  }
  assertedProductionEnv = true;
}