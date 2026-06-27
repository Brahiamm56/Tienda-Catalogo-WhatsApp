import { z } from "zod";

export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const httpsImageUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, { message: "La imagen debe servirse por HTTPS." });

export const productSchema = z.object({
  name: z.string().min(2).max(140),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, "Usa minúsculas, números y guiones."),
  description: z.string().min(10).max(2000),
  priceCents: z.coerce.number().int().positive().max(1_000_000_000),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  categoryId: z.string().min(1).max(64),
  featured: z.coerce.boolean().default(false),
  imageUrl: httpsImageUrl.optional().or(z.literal("")),
  imageAlt: z.string().trim().max(120).optional().or(z.literal("")),
  imagePublicId: z.string().trim().max(255).optional().or(z.literal("")),
  images: z.array(z.object({
    url: httpsImageUrl,
    publicId: z.string().trim().max(255).optional().or(z.literal("")),
    alt: z.string().trim().max(120).optional().or(z.literal("")),
  })).optional(),
  sku: z.string().trim().max(64).optional().or(z.literal("")),
  status: productStatusSchema.default("PUBLISHED"),
  gender: z.string().optional().nullable().or(z.literal("")),
});

export type ProductInput = z.infer<typeof productSchema>;