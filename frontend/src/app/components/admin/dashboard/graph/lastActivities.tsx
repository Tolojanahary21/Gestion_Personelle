"use client";

import { Activity, Clock } from "lucide-react";
import type { DashboardAuditLog } from "../page";

export default function LastActivities({ activities }: { activities: DashboardAuditLog[] }) {
  const sorted = [...activities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  return <section className="m-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Clock size={15} />Activité récente</h2><p className="mt-1 text-xs text-slate-500">Journal d’audit renvoyé par le backend</p></div><span className="text-xs text-slate-500">{sorted.length} activité(s)</span></div>{sorted.length ? <ul className="divide-y divide-slate-100">{sorted.map((entry) => <li key={entry.id_audit_log} className="flex items-start gap-3 py-3"><Activity size={16} className="mt-0.5 shrink-0 text-blue-600" /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-800">{entry.action} · {entry.entity}</p><p className="mt-0.5 text-xs text-slate-500">{entry.description || "Aucune description"}</p></div><time className="shrink-0 text-xs text-slate-400" dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString("fr-FR")}</time></li>)}</ul> : <div className="py-8 text-center text-sm text-slate-500">Aucune activité remontée par le backend · 0</div>}</section>;
}
