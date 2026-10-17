// componente para visualizar el resumen de ventas e ingresos
export interface DashboardMetrics {
    totalSales: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }
  
  interface MetricsCardsProps {
    metrics: DashboardMetrics;
  }
  
  export function MetricsCards({ metrics }: MetricsCardsProps) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Ventas Totales
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.totalSales.toLocaleString()}
          </p>
        </div>
  
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Ingresos Totales
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${metrics.totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
  
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Órdenes Pendientes
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-500">
            {metrics.pendingOrders.toLocaleString()}
          </p>
        </div>
  
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Órdenes Completadas
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.completedOrders.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }