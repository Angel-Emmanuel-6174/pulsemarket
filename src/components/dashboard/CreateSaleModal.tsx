"use client";

import { useState, useTransition } from "react";
import { createSaleAction } from "@/app/actions/sales";
import { OrderStatus } from "@/lib/validations/sale";

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSaleModal({ isOpen, onClose }: CreateSaleModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    const inputData = {
      customerName: formData.get("customerName") as string,
      customerEmail: formData.get("customerEmail") as string,
      productName: formData.get("productName") as string,
      category: formData.get("category") as string,
      price: Number(formData.get("price")),
      quantity: Number(formData.get("quantity") || 1),
      status: (formData.get("status") as OrderStatus) || "PENDING",
    };

    startTransition(async () => {
      const result = await createSaleAction(inputData);
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || "Ocurrió un error al guardar el registro.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white">
        <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            + Nuevo Registro
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Cliente *
              </label>
              <input
                required
                name="customerName"
                type="text"
                placeholder="Nombre del cliente"
                className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Email Cliente *
              </label>
              <input
                required
                name="customerEmail"
                type="email"
                placeholder="cliente@ejemplo.com"
                className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Producto *
              </label>
              <input
                required
                name="productName"
                type="text"
                placeholder="Nombre del producto"
                className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Categoría *
              </label>
              <input
                required
                name="category"
                type="text"
                placeholder="Ej. Electrónica"
                className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Precio (USD) *
              </label>
              <input
                required
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Cantidad *
              </label>
              <input
                required
                name="quantity"
                type="number"
                min="1"
                defaultValue={1}
                className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Estado
              </label>
              <select
                name="status"
                defaultValue="PENDING"
                className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Crear Registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}