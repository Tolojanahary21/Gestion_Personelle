"use client";

import { useState } from "react";
import { Bell, Menu, Search, User, ChevronDown, X } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  notificationCount?: number;
}

export default function Header({
  onMenuClick,
  notificationCount = 3,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-sm sm:px-6">
      {/* Partie gauche */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            Administration navale
          </p>
          <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
            Système de Gestion du Personnel Naval
          </h1>
        </div>
      </div>

      {/* Partie droite */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        {/* Recherche */}
        <div className="hidden items-center sm:flex">
          {searchOpen ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 transition-all">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Rechercher..."
                className="w-48 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                aria-label="Fermer la recherche"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 transition hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} non lues)` : ""}`}
          className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell className="h-5 w-5" />

          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        {/* Séparateur */}
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Profil administrateur */}
        <button
          type="button"
          aria-label="Profil administrateur"
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm">
            <User className="h-5 w-5" />
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-slate-900">
              Administrateur
            </p>
            <p className="text-xs text-slate-500">Responsable système</p>
          </div>

          <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 md:block" />
        </button>
      </div>
    </header>
  );
}