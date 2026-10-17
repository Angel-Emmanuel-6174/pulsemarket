import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-100 p-8 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow dark:bg-gray-800">
        <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">Panel de Control - PulseMarket</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bienvenido, {session?.user?.name || "Usuario"}
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
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <h2 className="font-semibold">Información de la Sesión (JWT Activo)</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              <strong>Email:</strong> {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}