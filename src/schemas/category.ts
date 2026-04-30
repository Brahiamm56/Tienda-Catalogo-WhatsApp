import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minusculas, numeros y guiones."),
  description: z.string().min(10),
  order: z.coerce.number().int().min(0).max(999),
});

export type CategoryInput = z.infer<typeof categorySchema>;