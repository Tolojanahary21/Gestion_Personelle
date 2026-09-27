 
"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut, X } from "lucide-react";

interface DeconnexionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Deconnexion({
  isOpen,
  onClose,
}: DeconnexionProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogout = async () => {
    // Suppression des informations d'authentification
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch (error) {
      console.error("Impossible de fermer la session côté serveur :", error);
    }

    // Si tu utilises d'autres clés d'authentification,
    // tu peux également les supprimer ici.

    // Fermeture de la popup
    onClose();

    // Retour vers la page de connexion
    router.replace("/login");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Confirmer la déconnexion
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Voulez-vous vraiment vous déconnecter ?
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
