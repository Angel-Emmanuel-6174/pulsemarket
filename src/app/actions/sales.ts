"use server";

import { prisma } from "@/lib/prisma";
import {
  saleQuerySchema,
  bulkUpdateSaleStatusSchema,
  SaleQueryInput,
  BulkUpdateSaleStatusInput,
} from "@/lib/validations/sale";

// 1. Consulta Masiva Paginada con SLA < 400ms
export async function getSales(params?: Partial<SaleQueryInput>) {
  const startTime = Date.now();
  const validated = saleQuerySchema.parse(params ?? {});
  const { page, limit, search, status, sortBy, sortOrder } = validated;

  const skip = (page - 1) * limit;

  // Filtro base considerando Soft Delete
  const whereCondition = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
            { product: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  // Ejecución en paralelo aprovechando índices de la BD
  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, category: true, price: true } },
      },
    }),
    prisma.sale.count({ where: whereCondition }),
  ]);

  const duration = Date.now() - startTime;

  return {
    success: true,
    data: sales,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    executionTimeMs: duration,
  };
}

// 2. Mutación Masiva (Bulk Update) de Estados
export async function bulkUpdateSaleStatus(input: BulkUpdateSaleStatusInput) {
  const { ids, status } = bulkUpdateSaleStatusSchema.parse(input);

  const updated = await prisma.sale.updateMany({
    where: {
      id: { in: ids },
      deletedAt: null,
    },
    data: {
      status,
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    updatedCount: updated.count,
  };
}

// 3. Borrado Suave (Soft Delete) de Venta
export async function softDeleteSale(id: string) {
  const deleted = await prisma.sale.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return {
    success: true,
    id: deleted.id,
  };
}