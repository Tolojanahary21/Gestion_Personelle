import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AccesRefusePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-400" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold">Accès refusé</h1>
        <p className="mt-3 text-slate-300">
          Vous devez vous connecter pour accéder à cette page.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
        >
          Aller à la page de connexion
        </Link>
      </section>
    </main>
  );
}
