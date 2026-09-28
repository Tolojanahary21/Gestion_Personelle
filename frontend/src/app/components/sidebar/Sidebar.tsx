"use client";

import { useState } from "react";
import Deconnexion from "./Deconnexion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Ship,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { usePreferences } from "../../providers/PreferencesProvider";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (value: boolean) => void;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "PRINCIPAL",
    items: [
      { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
      { label: "Personnel", href: "/personnel", icon: Users },
      { label: "Dossiers", href: "/dossiers", icon: FolderOpen },
      { label: "Grades", href: "/grade", icon: Shield },
      { label: "Unités navales", href: "/unites-navales", icon: Ship },
    ],
  },
  {
    title: "GESTION",
    items: [
      { label: "Affectations", href: "/affectations", icon: ClipboardList },
      { label: "Formations", href: "/formations", icon: GraduationCap },
      { label: "Congés", href: "/conges", icon: CalendarDays },
      { label: "Fin de lien", href: "/fin-de-lien", icon: FileText },
    ],
  },
  {
    title: "ANALYSE",
    items: [{ label: "Statistiques", href: "/statistiques", icon: BarChart3 }],
  },
  {
    title: "SYSTÈME",
    items: [
      { label: "Administration", href: "/administration", icon: UserCog },
      { label: "Paramètres", href: "/parametres", icon: Settings },
    ],
  },
];
        

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const open = isOpen ?? internalIsOpen;
  const closeSidebar = setIsOpen ?? setInternalIsOpen;
  const [showLogout, setShowLogout] = useState(false);
  const { t } = usePreferences();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => closeSidebar(true)}
          className="fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-lg transition hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      {/* Overlay mobile */}
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => closeSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:sticky lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-20 shrink-0 items-center border-b border-slate-800 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40">
            <Ship className="h-6 w-6" />
          </div>

          <div className="ml-3 min-w-0">
            <h1 className="truncate text-lg font-bold tracking-wide">SGPNRH</h1>
            <p className="truncate text-[10px] uppercase tracking-widest text-slate-400">
              Personnel Naval
            </p>
          </div>

          <button
            type="button"
            aria-label="Fermer le menu"
            className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            onClick={() => closeSidebar(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin scrollbar-thumb-slate-800">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-500">
                {t(section.title)}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => closeSidebar(false)}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white hover:translate-x-0.5"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                      )}

                      <Icon
                        className={`mr-3 h-5 w-5 shrink-0 transition-colors ${
                          active
                            ? "text-white"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />

                      <span className="truncate">{t(item.label)}</span>

                      {active && (
                        <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800 p-2">
          <button
            type="button"
            onClick={() => setShowLogout(true)}
            className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-950/40 hover:text-red-400"
          >
            <LogOut className="mr-3 h-5 w-5" />
            {t("Déconnexion")}
          </button>
        </div>
      </aside>
      <Deconnexion
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
      />
    </>
  );
}
