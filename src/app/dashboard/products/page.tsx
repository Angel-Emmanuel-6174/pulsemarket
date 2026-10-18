import Link from "next/link";
import { getSales, softDeleteSale } from "@/app/actions/sales";

// Fuerza el renderizado dinámico SSR y evita la generación estática durante 'next build'
export const dynamic = "force-dynamic";

export default async function ProductsCRUDPage({
  searchParams,
}: {
  searchParams?: { page?: string; search?: string };
}) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const search = searchParams?.search || "";
  const limit = 10;

  const { data: sales, pagination } = await getSales({
    page: isNaN(page) ? 1 : page,
    limit,
    search: search.trim() !== "" ? search : undefined,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado */}
        <header className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gestión de Productos y Ventas (CRUD Paginado)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Consulta optimizada sobre +10,000 registros en Supabase
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
          >
            ← Volver al Dashboard
          </Link>
        </header>

        {/* Buscador y Tabla */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <form method="GET" className="mb-4">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar por cliente o producto..."
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Monto Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales?.map((sale) => (
                  <tr key={sale.id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-3 font-mono text-xs">{sale.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {sale.customer.name}
                    </td>
                    <td className="px-4 py-3">{sale.product.name}</td>
                    <td className="px-4 py-3">${sale.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <form
                        action={async () => {
                          "use server";
                          await softDeleteSale(sale.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
                        >
                          Soft Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>
              Página <strong>{pagination?.page}</strong> de <strong>{pagination?.totalPages}</strong> ({pagination?.total} registros)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/dashboard/products?page=${page - 1}&search=${encodeURIComponent(search)}`}
                  className="rounded bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
                >
                  Anterior
                </Link>
              )}
              {page < (pagination?.totalPages || 1) && (
                <Link
                  href={`/dashboard/products?page=${page + 1}&search=${encodeURIComponent(search)}`}
                  className="rounded bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}