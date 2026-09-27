"use client";

import {
  Users,
  UserCheck,
  Award,
  Building2,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

interface Stat {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend: string;
  trendText: string;
  positive: boolean;
  accent: string;
}

const stats: Stat[] = [
  {
    title: "Personnel",
    value: "380",
    description: "Personnel enregistré",
    icon: Users,
    trend: "+8%",
    trendText: "ce mois",
    positive: true,
    accent: "blue",
  },
  {
    title: "Actifs",
    value: "350",
    description: "Personnel actuellement actif",
    icon: UserCheck,
    trend: "+5%",
    trendText: "ce mois",
    positive: true,
    accent: "emerald",
  },
  {
    title: "Grades",
    value: "12",
    description: "Grades enregistrés",
    icon: Award,
    trend: "+1",
    trendText: "ce mois",
    positive: true,
    accent: "amber",
  },
  {
    title: "Services",
    value: "8",
    description: "Services enregistrés",
    icon: Building2,
    trend: "+2",
    trendText: "ce mois",
    positive: true,
    accent: "violet",
  },
];

const accentStyles: Record<string, { icon: string; glow: string }> = {
  blue: { icon: "bg-blue-600/10 text-blue-400", glow: "bg-blue-600/10 group-hover:bg-blue-600/20" },
  emerald: { icon: "bg-emerald-600/10 text-emerald-400", glow: "bg-emerald-600/10 group-hover:bg-emerald-600/20" },
  amber: { icon: "bg-amber-600/10 text-amber-400", glow: "bg-amber-600/10 group-hover:bg-amber-600/20" },
  violet: { icon: "bg-violet-600/10 text-violet-400", glow: "bg-violet-600/10 group-hover:bg-violet-600/20" },
};

export default function StatsCards() {
  return (
    <section className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.positive ? TrendingUp : TrendingDown;
        const accent = accentStyles[stat.accent] ?? accentStyles.blue;

        return (
          <div
            key={stat.title}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/90 p-3 shadow-md shadow-black/20 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-black/30"
          >
            <div
              className={`absolute -right-6 -top-6 h-16 w-16 rounded-full blur-xl transition duration-300 ${accent.glow}`}
            />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 ${accent.icon}`}
                >
                  <Icon size={16} />
                </div>

                <div
                  className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${
                    stat.positive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                  title={`Évolution : ${stat.trend} ${stat.trendText}`}
                >
                  <TrendIcon size={11} />
                  <span className="text-[11px] font-medium">{stat.trend}</span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-slate-400">{stat.title}</p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-white tabular-nums">
                  {stat.value}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/5 pt-2">
                <p
                  className="truncate text-[11px] text-slate-500"
                  title={stat.description}
                >
                  {stat.description}
                </p>
                <span className="shrink-0 whitespace-nowrap text-[11px] text-slate-600">
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