// pagina del dashboard
import { Suspense } from "react";
import { auth, signOut } from "@/auth";
import { getDashboardData, updateSaleStatusAction } from "@/app/actions/dashboard";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { MetricsSkeleton } from "@/components/dashboard/MetricsSkeleton";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { KanbanSkeleton } from "@/components/kanban/KanbanSkeleton";

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

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado del Dashboard */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Panel de Control - PulseMarket
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bienvenido, <span className="font-semibold text-gray-700 dark:text-gray-200">{session?.user?.name || "Usuario"}</span> ({session?.user?.email})
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Cerrar Sesión
            </button>
          </form>
        </header>

        {/* Contenido Principal con Skeletons */}
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