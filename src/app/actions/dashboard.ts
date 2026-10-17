// acciones para el dashboard
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export async function updateSaleStatusAction(saleId: string, newStatus: OrderStatus) {
  try {
    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: { status: newStatus },
    });

    revalidatePath("/dashboard");
    return { success: true, data: updatedSale };
  } catch (error) {
    console.error("Error actualizando el estado de la venta:", error);
    throw new Error("No se pudo actualizar el estado de la venta en la base de datos.");
  }
}

export async function getDashboardData() {
  const [totalSales, pendingOrders, completedOrders, totalRevenueAggregate, salesList] = await Promise.all([
    prisma.sale.count({ where: { deletedAt: null } }),
    prisma.sale.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.sale.count({ where: { status: "COMPLETED", deletedAt: null } }),
    prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: { deletedAt: null },
    }),
    prisma.sale.findMany({
      where: { deletedAt: null },
      take: 40,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        product: { select: { name: true } },
      },
    }),
  ]);

  const metrics = {
    totalSales,
    totalRevenue: totalRevenueAggregate._sum.totalAmount ?? 0,
    pendingOrders,
    completedOrders,
  };

  const initialKanbanData: Record<OrderStatus, Array<{
    id: string;
    content: string;
    customerName: string;
    amount: number;
    status: OrderStatus;
  }>> = {
    PENDING: [],
    PROCESSING: [],
    COMPLETED: [],
    CANCELLED: [],
  };

  salesList.forEach((sale) => {
    const statusKey = sale.status as OrderStatus;
    if (initialKanbanData[statusKey]) {
      initialKanbanData[statusKey].push({
        id: sale.id,
        content: sale.product.name,
        customerName: sale.customer.name,
        amount: sale.totalAmount,
        status: statusKey,
      });
    }
  });

  return { metrics, initialKanbanData };
}