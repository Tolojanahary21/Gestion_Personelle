"use client";

import {
  Users,
  UserCheck,
  Award,
  Building2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const stats = [
  {
    title: "Personnel",
    value: "380",
    description: "Personnel enregistré",
    icon: Users,
    trend: "+8%",
    trendText: "ce mois",
    positive: true,
  },
  {
    title: "Actifs",
    value: "350",
    description: "Personnel actuellement actif",
    icon: UserCheck,
    trend: "+5%",
    trendText: "ce mois",
    positive: true,
  },
  {
    title: "Grades",
    value: "12",
    description: "Grades enregistrés",
    icon: Award,
    trend: "+1",
    trendText: "ce mois",
    positive: true,
  },
  {
    title: "Services",
    value: "8",
    description: "Services enregistrés",
    icon: Building2,
    trend: "+2",
    trendText: "ce mois",
    positive: true,
  },
];

export default function StatsCards() {
  return (
    <section className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.positive ? TrendingUp : TrendingDown;

        return (
          <div
            key={stat.title}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/90 p-3 shadow-md shadow-black/20 backdrop-blur-xl transition duration-300 hover:border-blue-500/30 hover:bg-slate-900/90"
          >
            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-blue-600/10 blur-xl transition duration-300 group-hover:bg-blue-600/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
                  <Icon size={16} />
                </div>

                <div
                  className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${
                    stat.positive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  <TrendIcon size={11} />
                  <span className="text-[11px] font-medium">{stat.trend}</span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-slate-400">
                  {stat.title}
                </p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-white">
                  {stat.value}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
                <p className="truncate text-[11px] text-slate-500">
                  {stat.description}
                </p>
                <span className="ml-2 whitespace-nowrap text-[11px] text-slate-600">
                  {stat.trendText}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}