import { Suspense } from "react";
import { auth, signOut } from "@/auth";
import { getDashboardData, updateSaleStatusAction } from "@/app/actions/dashboard";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { MetricsSkeleton } from "@/components/dashboard/MetricsSkeleton";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { KanbanSkeleton } from "@/components/kanban/KanbanSkeleton";
import Link from "next/link";

// 1. Componente dinámico para el encabezado con la sesión del usuario
async function DashboardHeader() {
  const session = await auth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Panel de Control - PulseMarket
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Bienvenido, <span className="font-semibold text-gray-700 dark:text-gray-200">{session?.user?.name || "Usuario"}</span> ({session?.user?.email})
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Enlace al CRUD Paginado */}
        <Link
          href="/dashboard/products"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Ver Tabla CRUD (Productos/Ventas)
        </Link>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </form>
      </div>
    </header>
  );
}

// 2. Componente dinámico para las métricas y el Kanban
async function DashboardContent() {
  const { metrics, initialKanbanData } = await getDashboardData();

  return (
    <div className="space-y-6">
      <MetricsCards metrics={metrics} />
      
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          Gestión de Órdenes (Kanban Drag & Drop)
        </h2>
        <KanbanBoard 
          initialData={initialKanbanData} 
          onStatusChange={async (id, status) => {
            "use server";
            await updateSaleStatusAction(id, status);
          }} 
        />
      </div>
    </div>
  );
}

// 3. Contenedor principal síncrono compatible con pre-rendering estático de Next.js
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Límite de Suspense para la sesión */}
        <Suspense
          fallback={
            <div className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800" />
          }
        >
          <DashboardHeader />
        </Suspense>

        {/* Límite de Suspense para las métricas y Kanban */}
        <Suspense
          fallback={
            <div className="space-y-6">
              <MetricsSkeleton />
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <KanbanSkeleton />
              </div>
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}