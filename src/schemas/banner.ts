import { z } from "zod";

// Allow either an absolute https URL or a same-origin relative path.
// Reject javascript:, data:, vbscript:, file:, etc.
const safeHrefSchema = z
  .string()
  .trim()
  .max(255)
  .refine(
    (value) => {
      if (value === "") return true;
      if (value.startsWith("/") && !value.startsWith("//")) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Usa una URL https:// o una ruta interna que empiece con /." },
  );

const safeImageUrlSchema = z
  .string()
  .url("Sube o pega la URL de la imagen.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  }, { message: "La imagen debe servirse por HTTPS." });

export const bannerSchema = z.object({
  title: z.string().min(2, "Título obligatorio."),
  subtitle: z.string().trim().max(180).optional().or(z.literal("")),
  ctaLabel: z.string().trim().max(40).optional().or(z.literal("")),
  ctaHref: safeHrefSchema.optional().or(z.literal("")),
  imageUrl: safeImageUrlSchema,
  imagePublicId: z.string().trim().max(255).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(999).default(0),
  active: z.coerce.boolean().default(true),
});

export type BannerInput = z.infer<typeof bannerSchema>;
