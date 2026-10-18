"use server";

import { prisma } from "@/lib/prisma";
import {
  bulkUpdateProductPriceSchema,
  BulkUpdateProductPriceInput,
} from "@/lib/validations/sale";

// Ajuste Masivo de Precios por Categoría (Bulk Update)
export async function bulkUpdateProductPrices(input: BulkUpdateProductPriceInput) {
  // Reemplaza la línea 11 (o donde parsees el input) por:
const { category, percentageChange = 0 } = bulkUpdateProductPriceSchema.parse(input);

// Ahora el cálculo de la línea 13 no marcará error:
const multiplier = 1 + percentageChange / 100;

  // Transacción segura para actualizar precios en lote
  const products = await prisma.product.findMany({
    where: { category, deletedAt: null },
    select: { id: true, price: true },
  });

  const updatePromises = products.map((product) =>
    prisma.product.update({
      where: { id: product.id },
      data: {
        price: Math.round(product.price * multiplier * 100) / 100,
        updatedAt: new Date(),
      },
    })
  );

  await prisma.$transaction(updatePromises);

  return {
    success: true,
    affectedProducts: products.length,
  };
}