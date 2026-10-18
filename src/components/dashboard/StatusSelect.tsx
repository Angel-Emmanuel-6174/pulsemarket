"use client";

import { useTransition } from "react";
import { OrderStatus } from "@/lib/validations/sale";
import { updateSaleStatusAction } from "@/app/actions/sales";

interface StatusSelectProps {
  saleId: string;
  currentStatus: OrderStatus;
}

const statusBadgeStyles: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300",
};

export function StatusSelect({ saleId, currentStatus }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      const res = await updateSaleStatusAction(saleId, newStatus);
      if (!res.success) {
        alert(res.error || "No se pudo actualizar el estado.");
      }
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleStatusChange}
      disabled={isPending}
      className={`text-xs font-semibold px-2.5 py-1 rounded-md border cursor-pointer transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        statusBadgeStyles[currentStatus] ?? "bg-gray-100 text-gray-800"
      } ${isPending ? "opacity-50 cursor-wait" : "hover:opacity-80"}`}
    >
      <option value="PENDING">PENDING</option>
      <option value="PROCESSING">PROCESSING</option>
      <option value="COMPLETED">COMPLETED</option>
      <option value="CANCELLED">CANCELLED</option>
    </select>
  );
}