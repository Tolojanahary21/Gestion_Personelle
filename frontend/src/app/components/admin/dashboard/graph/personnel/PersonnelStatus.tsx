"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardMilitaryInfo, DashboardPersonnel } from "../../page";

const colors = ["#2563eb", "#f59e0b", "#64748b", "#94a3b8"];
export default function PersonnelStatus({ personnel, military }: { personnel: DashboardPersonnel[]; military: DashboardMilitaryInfo[] }) {
  const labels: Record<string, string> = { active: "Actif", retired: "Retraité", suspended: "Suspendu" };
  const counts = new Map<string, number>();
  for (const person of personnel) {
    const status = military.find((info) => info.personnel_id === person.id_personnel)?.service_status?.toLowerCase() ?? "unknown";
    const label = labels[status] ?? (status === "unknown" ? "Non renseigné" : status);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const data = Array.from(counts, ([name, value]) => ({ name, value }));
  const total = personnel.length;
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">Statut du personnel</h2><p className="mt-1 text-xs text-slate-500">Répartition calculée depuis les fiches et statuts de service</p><div className="relative mt-3 h-44"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={46} outerRadius={67} paddingAngle={2}>{data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-xl text-slate-900">{total}</strong><span className="text-[10px] text-slate-500">Personnel</span></div></div><div className="grid grid-cols-2 gap-2">{data.length ? data.map((item, index) => <div key={item.name} className="flex items-center gap-2 text-xs"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /><span className="text-slate-600">{item.name}</span><strong className="ml-auto text-slate-900">{item.value}</strong></div>) : <p className="col-span-2 text-center text-xs text-slate-500">Aucune donnée · 0</p>}</div></section>;
}
