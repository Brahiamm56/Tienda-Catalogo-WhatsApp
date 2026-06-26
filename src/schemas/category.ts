import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .transform((val) =>
      val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
        .replace(/[^a-z0-9-]/g, "-")      // replace non-alphanumeric with hyphen
        .replace(/-+/g, "-")             // collapse multiple hyphens
        .replace(/^-|-$/g, "")           // trim leading/trailing hyphens
    ),
  description: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(999),
});

export type CategoryInput = z.infer<typeof categorySchema>;