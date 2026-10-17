// componente para visualizar el resumen de ventas e ingresos y su respectivo estado de carga
export function MetricsSkeleton() {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={`metric-skeleton-${i}`} 
            className="h-28 rounded-xl bg-gray-100 p-5 animate-pulse dark:bg-gray-800" 
          />
        ))}
      </div>
    );
  } 