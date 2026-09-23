 
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  UserCog,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Personnels",
    href: "/admin/personnels",
    icon: Users,
  },
  {
    label: "Grades",
    href: "/admin/grades",
    icon: ShieldCheck,
  },
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: UserCog,
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  isOpen = true,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72
          flex-col border-r border-white/10
          bg-slate-950 text-white
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/admin"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <span className="font-bold">RH</span>
            </div>

            <div>
              <h1 className="font-semibold">
                Administration
              </h1>

              <p className="text-xs text-slate-500">
                Gestion RH
              </p>
            </div>
          </Link>

          {/* Close mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu principal
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-3
                  text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon size={20} />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={20} />

            <span>Déconnexion</span>
          </button>

          {/* User */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <span className="text-sm font-semibold">
                A
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                Administrateur
              </p>

              <p className="truncate text-xs text-slate-500">
                ADMIN
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

