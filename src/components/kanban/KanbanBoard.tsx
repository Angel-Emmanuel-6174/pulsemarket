// Este componente maneja el arrastrar y soltar
"use client";

import { useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export interface KanbanTask {
  id: string;
  content: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
}

interface KanbanBoardProps {
  initialData: Record<OrderStatus, KanbanTask[]>;
  onStatusChange?: (taskId: string, newStatus: OrderStatus) => Promise<void>;
}

export function KanbanBoard({ initialData, onStatusChange }: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId as OrderStatus;
    const destCol = destination.droppableId as OrderStatus;

    const sourceTasks = [...columns[sourceCol]];
    const destTasks = sourceCol === destCol ? sourceTasks : [...columns[destCol]];

    const [movedTask] = sourceTasks.splice(source.index, 1);
    const updatedTask = { ...movedTask, status: destCol };
    destTasks.splice(destination.index, 0, updatedTask);

    // Actualización optimista del cliente
    const nextState = {
      ...columns,
      [sourceCol]: sourceTasks,
      [destCol]: destTasks,
    };
    setColumns(nextState);

    // Persistencia en base de datos
    startTransition(async () => {
      try {
        if (onStatusChange) {
          await onStatusChange(draggableId, destCol);
        }
      } catch (error) {
        // Revertir a estado inicial si ocurre un fallo
        setColumns(initialData);
        console.error("Error al guardar el estado en el servidor:", error);
      }
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={`flex h-full gap-4 overflow-x-auto p-4 ${isPending ? "opacity-80" : ""}`}>
        {Object.entries(columns).map(([columnId, tasks]) => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex w-80 flex-shrink-0 flex-col rounded-xl bg-gray-100 p-4 dark:bg-gray-800/60"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200">{columnId}</h3>
                  <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {tasks.length}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-[150px]">
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded-lg bg-white p-4 shadow-sm transition-shadow dark:bg-gray-700 ${
                            snapshot.isDragging
                              ? "ring-2 ring-blue-500 shadow-lg opacity-90"
                              : "hover:shadow-md"
                          }`}
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{task.content}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Cliente: {task.customerName}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t pt-2 dark:border-gray-600">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                              ${task.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}