import { z } from "zod";

// Esquema de consulta paginada para Ventas
export const saleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]).optional(),
  sortBy: z.enum(["createdAt", "totalAmount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type SaleQueryInput = z.infer<typeof saleQuerySchema>;

// Esquema para actualización masiva de estados de ventas (Bulk Update)
export const bulkUpdateSaleStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "Debe seleccionar al menos un registro"),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]),
});

export type BulkUpdateSaleStatusInput = z.infer<typeof bulkUpdateSaleStatusSchema>;

// Esquema para actualización masiva de precios de productos por categoría
export const bulkUpdateProductPriceSchema = z.object({
  category: z.string().min(1, "La categoría es requerida"),
  percentageChange: z.number().refine((val) => val !== 0, "El porcentaje no puede ser cero"),
});

export type BulkUpdateProductPriceInput = z.infer<typeof bulkUpdateProductPriceSchema>;