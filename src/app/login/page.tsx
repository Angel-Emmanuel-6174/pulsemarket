import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">PulseMarket</h1>
          <p className="mt-2 text-sm text-slate-400">
            Inicia sesión para acceder al panel de analítica e inventario
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
            >
              Continuar con Google
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
            >
              Continuar con GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}