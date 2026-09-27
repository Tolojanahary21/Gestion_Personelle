"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardGrade, DashboardPersonnel } from "../../page";

export default function PersonnelByGrade({ personnel, grades }: { personnel: DashboardPersonnel[]; grades: DashboardGrade[] }) {
  const data = grades.map((grade) => ({ grade: grade.name, effectif: personnel.filter((person) => person.grade_id === grade.id_grade).length }));
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold text-slate-900">Personnel par grade</h2><p className="mt-1 text-xs text-slate-500">Effectifs issus des fiches du personnel</p></div><span className="text-xs text-slate-500">{personnel.length} total</span></div><div className="mt-4 h-56">{data.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="grade" interval={0} angle={-15} textAnchor="end" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="effectif" name="Personnel" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-slate-500">Aucun grade · 0</div>}</div></section>;
}
