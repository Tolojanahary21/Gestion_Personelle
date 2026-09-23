"use client";

import {
    Users,
    UserCheck,
    UserX,
    UserPlus,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

const stats = [
    {
        title: "Total personnel",
        value: "248",
        description: "Personnel enregistré",
        icon: Users,
        trend: "+8%",
        trendUp: true,
        color: "blue",
    },
    {
        title: "Personnel actif",
        value: "231",
        description: "Personnel actuellement actif",
        icon: UserCheck,
        trend: "+3%",
        trendUp: true,
        color: "emerald",
    },
    {
        title: "Personnel inactif",
        value: "17",
        description: "Personnel désactivé",
        icon: UserX,
        trend: "-2%",
        trendUp: false,
        color: "rose",
    },
    {
        title: "Nouveaux personnels",
        value: "12",
        description: "Ajoutés ce mois-ci",
        icon: UserPlus,
        trend: "+12%",
        trendUp: true,
        color: "violet",
    },
];

const colorStyles = {
    blue: {
        iconBg: "bg-blue-500/10",
        iconText: "text-blue-600 dark:text-blue-400",
        accent: "bg-blue-500",
        ring: "group-hover:ring-blue-500/20",
    },
    emerald: {
        iconBg: "bg-emerald-500/10",
        iconText: "text-emerald-600 dark:text-emerald-400",
        accent: "bg-emerald-500",
        ring: "group-hover:ring-emerald-500/20",
    },
    rose: {
        iconBg: "bg-rose-500/10",
        iconText: "text-rose-600 dark:text-rose-400",
        accent: "bg-rose-500",
        ring: "group-hover:ring-rose-500/20",
    },
    violet: {
        iconBg: "bg-violet-500/10",
        iconText: "text-violet-600 dark:text-violet-400",
        accent: "bg-violet-500",
        ring: "group-hover:ring-violet-500/20",
    },
} as const;

export default function StatCards() {
    return (
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
                const colors = colorStyles[stat.color as keyof typeof colorStyles];

                return (
                    <div
                        key={stat.title}
                        className={`group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 ${colors.ring}`}
                    >
                        {/* Barre d'accentuation supérieure */}
                        <div
                            className={`absolute inset-x-0 top-0 h-1 ${colors.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                        />

                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </p>

                                <div className="mt-3 flex items-baseline gap-2">
                                    <p className="text-4xl font-bold tracking-tight">
                                        {stat.value}
                                    </p>
                                    <span
                                        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            stat.trendUp
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                        }`}
                                    >
                                        <TrendIcon className="h-3 w-3" />
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>

                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}
                            >
                                <Icon className={`h-6 w-6 ${colors.iconText}`} />
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-muted-foreground">
                            {stat.description}
                        </p>

                        {/* Effet de lueur au survol */}
                        <div
                            className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${colors.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
                        />
                    </div>
                );
            })}
        </div>
    );
}