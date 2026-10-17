// componente que se muestra mientras se cargan los datos
export function KanbanSkeleton() {
    const columns = Array.from({ length: 4 });
    const cards = Array.from({ length: 3 });
  
    return (
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {columns.map((_, colIndex) => (
          <div 
            key={`col-skeleton-${colIndex}`} 
            className="flex w-80 flex-col gap-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800"
          >
            <div className="h-6 w-32 rounded bg-gray-300 animate-pulse dark:bg-gray-600" />
            <div className="flex flex-col gap-3">
              {cards.map((_, cardIndex) => (
                <div 
                  key={`card-skeleton-${cardIndex}`} 
                  className="h-24 w-full rounded bg-white shadow animate-pulse dark:bg-gray-700" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }