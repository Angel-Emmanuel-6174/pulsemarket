import { z } from "zod";

// Helper para sanitizar cadenas de texto (remueve HTML y caracteres de control ASCII)
export const sanitizeString = (val: string) => {
  return val
    .trim()
    .replace(/<[^>]*>?/gm, "") // Remover etiquetas HTML
    .replace(/\p{Control}/gu, ""); // Remueve todos los caracteres de control
};

export const saleStatusEnum = z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]);
export type OrderStatus = z.infer<typeof saleStatusEnum>;

// Esquema para consultas con sanitización en filtros de búsqueda
export const saleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeString(val) : undefined))
    .refine((val) => !val || val.length <= 100, {
      message: "El término de búsqueda no debe exceder 100 caracteres.",
    }),
  status: saleStatusEnum.optional(),
  sortBy: z.enum(["createdAt", "totalAmount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Esquema para la creación de nuevos registros (con restricción de 2 decimales)
export const createSaleSchema = z.object({
  customerName: z
    .string()
    .min(2, "El nombre del cliente debe tener al menos 2 caracteres.")
    .max(80, "El nombre del cliente no debe exceder 80 caracteres.")
    .transform(sanitizeString),
  customerEmail: z
    .string()
    .email("Ingrese un correo electrónico válido.")
    .transform((val) => val.trim().toLowerCase()),
  productName: z
    .string()
    .min(2, "El nombre del producto debe tener al menos 2 caracteres.")
    .max(100, "El nombre del producto no debe exceder 100 caracteres.")
    .transform(sanitizeString),
  category: z
    .string()
    .min(2, "La categoría debe tener al menos 2 caracteres.")
    .max(50, "La categoría no debe exceder 50 caracteres.")
    .transform(sanitizeString),
  price: z
    .coerce
    .number()
    .positive("El precio debe ser un número positivo mayor a 0.")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.toFixed(2)),
      "El precio solo puede contener un máximo de 2 decimales."
    ),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0.").default(1),
  status: saleStatusEnum.default("PENDING"),
});

// Esquemas requeridos para actualización masiva y tests unitarios
// Esquema flexible para actualización masiva de precios por IDs o por Categoría/Porcentaje
export const bulkUpdateSaleStatusSchema = z.object({
  ids: z.array(z.string().uuid("ID no válido")).min(1, "Debe seleccionar al menos un registro."),
  status: saleStatusEnum,
});

export const bulkUpdateProductPriceSchema = z.object({
  ids: z.array(z.string().uuid("ID no válido")).optional(),
  price: z
    .coerce
    .number()
    .positive("El precio debe ser positivo.")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.toFixed(2)),
      "El precio solo puede contener un máximo de 2 decimales."
    )
    .optional(),
  category: z.string().optional(),
  percentageChange: z.coerce.number().optional(),
});

// Exportación de tipos inferidos con Zod
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type SaleQueryInput = z.infer<typeof saleQuerySchema>;
export type BulkUpdateSaleStatusInput = z.infer<typeof bulkUpdateSaleStatusSchema>;
export type BulkUpdateProductPriceInput = z.infer<typeof bulkUpdateProductPriceSchema>;