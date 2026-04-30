import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/u, "Usa un color hex válido (#rrggbb).");

const httpsUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, { message: "Debe servirse por HTTPS." });

const businessHourSchema = z.object({
  day: z.string().min(1),
  open: z.string().regex(/^\d{2}:\d{2}$/u, "Formato HH:MM").or(z.literal("")),
  close: z.string().regex(/^\d{2}:\d{2}$/u, "Formato HH:MM").or(z.literal("")),
  closed: z.boolean().optional(),
});

export const storeSettingsSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  whatsappNumber: z.string().min(8).max(20).regex(/^[0-9]+$/u, "Solo dígitos."),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/u, "Código ISO 4217."),
  logoUrl: httpsUrl.or(z.literal("")).optional(),
  logoPublicId: z.string().max(255).optional(),
  themeAccent: hexColor.optional(),
  themeAccentStrong: hexColor.optional(),
  // Design tokens for store appearance
  themeBackground: hexColor.optional(),
  themeCardBg: hexColor.optional(),
  themeCardBorder: hexColor.optional(),
  themeCardRadius: z.enum(["none", "sm", "md", "lg", "xl", "2xl", "full"]).optional(),
  themeButtonRadius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
  // Business & location
  businessHours: z.array(businessHourSchema).max(14).optional(),
  locationAddress: z.string().max(255).optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  socialFacebook: httpsUrl.or(z.literal("")).optional(),
  socialInstagram: httpsUrl.or(z.literal("")).optional(),
  // Free shipping threshold (in cents). 0 or undefined = disabled.
  freeShippingThresholdCents: z.number().int().min(0).max(100_000_000).optional(),
});

export type StoreSettings = z.infer<typeof storeSettingsSchema>;
export type BusinessHour = z.infer<typeof businessHourSchema>;