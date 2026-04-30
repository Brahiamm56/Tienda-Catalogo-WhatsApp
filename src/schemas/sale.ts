import { z } from "zod";

export const saleStatusSchema = z.enum(["PENDING", "COMPLETED", "CANCELLED"]);

export const saleItemSchema = z.object({
  productId: z.string().min(1).max(60).optional().nullable(),
  name: z.string().min(1).max(160),
  priceCents: z.number().int().min(0).max(100_000_000),
  quantity: z.number().int().min(1).max(9999),
});

export const newSaleSchema = z.object({
  customerName: z.string().trim().max(120).optional().or(z.literal("")),
  customerPhone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+\d\s-]*$/u, "Teléfono inválido")
    .optional()
    .or(z.literal("")),
  deliveryMethod: z.enum(["pickup", "delivery", "shipping", "other"]).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  status: saleStatusSchema.default("COMPLETED"),
  items: z.array(saleItemSchema).min(1, "Agrega al menos un producto"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "MIXED"]).default("CASH"),
  paidWithCash: z.number().int().min(0).optional().default(0),
  paidWithTransfer: z.number().int().min(0).optional().default(0),
  amountReceived: z.number().int().min(0).optional().default(0),
});

export type NewSaleInput = z.infer<typeof newSaleSchema>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;
