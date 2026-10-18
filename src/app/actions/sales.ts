import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleQuerySchema, SaleQueryInput } from "@/lib/validations/sale";

// 1. Consulta Masiva Paginada con SLA < 400ms
export async function getSales(params?: Partial<SaleQueryInput>) {
  // Garantiza a Next.js que esta funcion se ejecuta dinamicamente en tiempo de peticion
  await connection();

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

  const [data, total] = await Promise.all([
    prisma.sale.findMany({
      where: whereCondition,
      take: limit,
      skip: skip,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, category: true, price: true } },
      },
    }),
    prisma.sale.count({ where: whereCondition }),
  ]);

  const executionTimeMs = Date.now() - startTime;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      executionTimeMs,
    },
  };
}

export async function softDeleteSale(saleId: string) {
  await connection();
  return await prisma.sale.update({
    where: { id: saleId },
    data: { deletedAt: new Date() },
  });
}