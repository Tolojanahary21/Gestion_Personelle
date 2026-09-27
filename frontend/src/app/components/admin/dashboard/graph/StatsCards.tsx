"use client";

import { Award, Building2, UserCheck, Users, type LucideIcon } from "lucide-react";
import type { DashboardData } from "../page";
import AnimatedCounter from "../../../../../components/ui/AnimatedCounter";

export default function StatsCards({ data }: { data: DashboardData }) {
  const active = new Set(["active", "actif", "actif(ve)"]);
  const activeCount = data.military.filter((item) => active.has(item.service_status.toLowerCase())).length;
  const cards: { title: string; value: number; caption: string; icon: LucideIcon; color: string }[] = [
    { title: "Personnel", value: data.personnel.length, caption: "Enregistrements backend", icon: Users, color: "blue" },
    { title: "Actifs", value: activeCount, caption: "Statut de service actif", icon: UserCheck, color: "emerald" },
    { title: "Grades", value: data.grades.length, caption: "Grades enregistrés", icon: Award, color: "amber" },
    { title: "Unités", value: data.units.length, caption: "Unités enregistrées", icon: Building2, color: "violet" },
  ];
  const colors: Record<string, string> = { blue: "bg-blue-50 text-blue-700", emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700" };
  return <section className="grid grid-cols-2 gap-3 p-3 lg:grid-cols-4">{cards.map(({ title, value, caption, icon: Icon, color }) => <article key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{title}</span><span className={`rounded-lg p-2 ${colors[color]}`}><Icon size={18} /></span></div><p className="mt-3 text-2xl font-bold tabular-nums text-slate-900"><AnimatedCounter value={value} /></p><p className="mt-1 text-xs text-slate-500">{caption}</p></article>)}</section>;
}
