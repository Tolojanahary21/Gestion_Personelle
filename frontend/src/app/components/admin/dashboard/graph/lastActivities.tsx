"use client";

import {
  UserPlus,
  UserCog,
  Award,
  Settings,
  FileEdit,
} from "lucide-react";

const activities = [
  {
    id: 1,
    icon: UserPlus,
    title: "Nouveau personnel ajouté",
    description: "Jean Rakoto a été ajouté au personnel",
    time: "Il y a 10 minutes",
  },
  {
    id: 2,
    icon: UserCog,
    title: "Personnel modifié",
    description: "Les informations de Marie Andria ont été mises à jour",
    time: "Il y a 35 minutes",
  },
  {
    id: 3,
    icon: Award,
    title: "Grade ajouté",
    description: "Le grade de Lieutenant a été ajouté",
    time: "Il y a 1 heure",
  },
  {
    id: 4,
    icon: FileEdit,
    title: "Dossier mis à jour",
    description: "Le dossier du personnel #0248 a été modifié",
    time: "Il y a 2 heures",
  },
  {
    id: 5,
    icon: Settings,
    title: "Paramètres modifiés",
    description: "Les paramètres du système ont été mis à jour",
    time: "Il y a 3 heures",
  },
];

export default function LastActivities() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-white">
          🕐 Activité récente
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          Les dernières actions effectuées dans le système
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] p-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
                <Icon size={14} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">
                  {activity.title}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {activity.description}
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        Voir toutes les activités
      </button>
    </div>
  );
}