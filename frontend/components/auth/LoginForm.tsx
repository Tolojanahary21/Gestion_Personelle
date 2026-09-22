
"use client";

import { useState } from "react";
import {
  login,
  getCurrentUser,
} from "@/controller/authController";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      // 1. Connexion à FastAPI
      const tokens = await login({
        username,
        password,
      });

      // 2. Récupération de l'utilisateur connecté
      const user = await getCurrentUser(
        tokens.access_token
      );

      console.log("Utilisateur connecté :", user);

      // 3. Redirection selon le rôle
      switch (user.role.toUpperCase()) {
        case "ADMIN":
          window.location.href = "/admin";
          break;

        case "HR":
          window.location.href = "/hr";
          break;

        case "MANAGER":
          window.location.href = "/manager";
          break;

        case "STAFF":
          window.location.href = "/staff";
          break;

        default:
          setError(
            `Rôle non reconnu : ${user.role}`
          );
          break;
      }
    } catch (err: any) {
      console.error("Erreur de connexion :", err);

      if (err.response?.status === 401) {
        setError("Nom d'utilisateur ou mot de passe incorrect.");
      } else if (err.response?.status === 422) {
        setError("Les données envoyées sont invalides.");
      } else {
        setError(
          "Impossible de se connecter au serveur."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-[-200px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute bottom-[-200px] left-[-100px] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute right-[-100px] top-1/3 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <span className="text-2xl font-bold text-white">
                RH
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Bienvenue
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Connectez-vous à votre espace personnel
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Nom d'utilisateur / Email
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  @
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Nom d'utilisateur ou email"
                  autoComplete="username"
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-200"
                >
                  Mot de passe
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  •
                </span>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3 pl-11 pr-24 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  {showPassword
                    ? "Masquer"
                    : "Afficher"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                disabled={isLoading}
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-blue-500"
              />

              <label
                htmlFor="remember"
                className="text-sm text-slate-400"
              >
                Se souvenir de moi
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-slate-500">
              Système de gestion des ressources humaines
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
