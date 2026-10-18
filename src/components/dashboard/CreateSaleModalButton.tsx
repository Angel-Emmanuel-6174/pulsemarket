"use client";

import { useState } from "react";
import { CreateSaleModal } from "./CreateSaleModal";

export function CreateSaleModalButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        + Nuevo Registro
      </button>

      <CreateSaleModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}