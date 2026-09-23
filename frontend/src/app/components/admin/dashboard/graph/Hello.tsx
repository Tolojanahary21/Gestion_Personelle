"use client";

import { useState } from "react";
import {
  Bell,
  CalendarDays,
  Menu,
  User,
  ChevronDown,
} from "lucide-react";

interface HelloProps {
  onMenuClick?: () => void;
  adminName?: string;
}

export default function Hello({
  onMenuClick,
  adminName = "Administrateur",
}: HelloProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const today = new Date();

  const formattedDate = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Partie gauche */}
        <div className="flex min-w-0 items-center gap-3">

          {/* Menu mobile */}
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          {/* Bonjour */}
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">
              Bonjour, {adminName}
            </h1>

            <div className="mt-0.5 hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
              <CalendarDays size={12} />
              <span className="capitalize">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Partie droite */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} />

              {/* Badge notifications */}
              <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-slate-950" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-11 w-72 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                  <h3 className="text-xs font-semibold text-white">
                    Notifications
                  </h3>

                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-400">
                    3 nouvelles
                  </span>
                </div>

                <div className="divide-y divide-white/5">
                  <div className="px-3 py-2.5 transition hover:bg-white/5">
                    <p className="text-xs text-white">
                      Nouveau personnel ajouté
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Il y a quelques minutes
                    </p>
                  </div>

                  <div className="px-3 py-2.5 transition hover:bg-white/5">
                    <p className="text-xs text-white">
                      Modification grade
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Il y a 30 minutes
                    </p>
                  </div>

                  <div className="px-3 py-2.5 transition hover:bg-white/5">
                    <p className="text-xs text-white">
                      Nouvelle activité administrative
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Il y a 1 heure
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full border-t border-white/10 px-3 py-2.5 text-center text-[11px] font-medium text-blue-400 transition hover:bg-white/5 hover:text-blue-300"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div className="hidden h-7 w-px bg-white/10 sm:block" />

          {/* Profil */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-white/5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                <User size={16} className="text-white" />
              </div>

              <div className="hidden text-left lg:block">
                <p className="max-w-28 truncate text-xs font-medium text-white">
                  {adminName}
                </p>

                <p className="text-[11px] text-slate-500">
                  Administrateur
                </p>
              </div>

              <ChevronDown
                size={14}
                className="hidden text-slate-500 lg:block"
              />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-11 w-48 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-1.5 shadow-2xl">

                <div className="border-b border-white/10 px-2.5 py-2.5">
                  <p className="truncate text-xs font-medium text-white">
                    {adminName}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Administrateur
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-1.5 w-full rounded-lg px-2.5 py-2 text-left text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  Mon profil
                </button>

                <button
                  type="button"
                  className="w-full rounded-lg px-2.5 py-2 text-left text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  Paramètres
                </button>

                <button
                  type="button"
                  className="mt-1 w-full rounded-lg px-2.5 py-2 text-left text-xs text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}