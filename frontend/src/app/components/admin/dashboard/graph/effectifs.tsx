"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardData } from "../page";

export default function Effectifs({ data }: { data: DashboardData }) {
  const chartData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 11 + index, 1));
    const recruitedByMonth = new Map<string, number>();
    for (const item of data.military) {
      if (!item.recruitment_date) continue;
      const date = new Date(`${item.recruitment_date}T00:00:00`);
      if (!Number.isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        recruitedByMonth.set(key, (recruitedByMonth.get(key) ?? 0) + 1);
      }
    }
    return months.map((month) => {
      const key = `${month.getFullYear()}-${month.getMonth()}`;
      const hired = recruitedByMonth.get(key) ?? 0;
      return { month: month.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }), recruitments: hired };
    });
  }, [data.military, data.personnel.length]);
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h2 className="font-bold text-slate-900">Recrutements sur 12 mois</h2><p className="mt-1 text-xs text-slate-500">Calculé à partir des dates de recrutement présentes dans le backend</p></div><div className="mt-4 h-60">{data.military.some((entry) => entry.recruitment_date) ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}><defs><linearGradient id="realRecruitmentGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.24} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip /><Area type="monotone" dataKey="recruitments" name="Recrutements" stroke="#2563eb" fill="url(#realRecruitmentGradient)" /></AreaChart></ResponsiveContainer> : <div className="flex h-full flex-col items-center justify-center text-sm text-slate-500"><span>Aucune date de recrutement disponible</span><strong className="mt-1 text-2xl text-slate-900">0</strong></div>}</div><p className="mt-2 text-xs text-slate-500">Recrutements par mois : {chartData.reduce((sum, item) => sum + item.recruitments, 0)} sur la période affichée.</p></section>;
}
