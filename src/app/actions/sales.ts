"use server";

import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  saleQuerySchema,
  createSaleSchema,
  saleStatusEnum,
  SaleQueryInput,
  CreateSaleInput,
  OrderStatus,
} from "@/lib/validations/sale";

// 1. Consulta Masiva Paginada con SLA < 400ms
export async function getSales(params?: Partial<SaleQueryInput>) {
  await connection();

  const startTime = Date.now();
  const validated = saleQuerySchema.parse(params ?? {});
  const { page, limit, search, status, sortBy, sortOrder } = validated;

  const skip = (page - 1) * limit;

  const whereCondition = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
            { customer: { email: { contains: search, mode: "insensitive" as const } } },
            { product: { name: { contains: search, mode: "insensitive" as const } } },
            { product: { category: { contains: search, mode: "insensitive" as const } } },
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
    success: true,
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

// 2. Cambio Rápido de Estado con Revalidación
export async function updateSaleStatusAction(saleId: string, newStatus: OrderStatus) {
  try {
    await connection();
    const validatedStatus = saleStatusEnum.parse(newStatus);

    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        status: validatedStatus,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return { success: true, data: updatedSale };
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error actualizando el estado.",
    };
  }
}

// 3. Creación de Registro mediante Transacción Atómica
export async function createSaleAction(input: CreateSaleInput) {
  try {
    await connection();
    const validatedData = createSaleSchema.parse(input);

    const totalAmount = Math.round(validatedData.price * validatedData.quantity * 100) / 100;

    const newSale = await prisma.$transaction(async (tx) => {
      // Buscar o crear el cliente
      let customer = await tx.customer.findFirst({
        where: { email: validatedData.customerEmail },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: validatedData.customerName,
            email: validatedData.customerEmail,
          },
        });
      }

      // Crear el producto (se incluye 'stock' exigido por tu schema.prisma)
      const product = await tx.product.create({
        data: {
          name: validatedData.productName,
          category: validatedData.category,
          price: validatedData.price,
          stock: 10, // Stock inicial por defecto
        },
      });

      // Crear el registro de la venta (se incluye 'quantity' exigido por tu schema.prisma)
      return await tx.sale.create({
        data: {
          quantity: validatedData.quantity,
          totalAmount: totalAmount,
          status: validatedData.status,
          customer: {
            connect: { id: customer.id },
          },
          product: {
            connect: { id: product.id },
          },
        },
        include: {
          customer: { select: { name: true, email: true } },
          product: { select: { name: true, category: true, price: true } },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return { success: true, data: newSale };
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al guardar el nuevo registro.",
    };
  }
}

// 4. Soft Delete de Venta (Existente)
export async function softDeleteSale(saleId: string) {
  await connection();
  
  const updated = await prisma.sale.update({
    where: { id: saleId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");

  return { success: true, id: updated.id };
}