"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Download, Printer, RefreshCw, Users } from "lucide-react";
import api from "../../../lib/api";
import { downloadCsv, printReport } from "../../lib/personnelTransfer";
import AnimatedCounter from "../../components/ui/AnimatedCounter";

type Person = { id_personnel: number; grade_id: number | null; last_name: string; first_names: string; children_count: number };
type Military = { personnel_id: number; service_status: string; unit: string | null; recruitment_date: string | null };
type Grade = { id_grade: number; name: string };
type Unit = { id_unit: number; name: string };
type Assignment = { id_assignment: number; personnel_id: number; status: string };
type Training = { id_training: number; personnel_id: number };
type Child = { id_child: number; personnel_id: number };
type Decoration = { id_decoration: number };
type Language = { id_language: number };
type ComputerSkill = { id_computer_skill: number };
type Attachment = { id_attachment: number };
type StatisticsData = { personnel: Person[]; military: Military[]; grades: Grade[]; units: Unit[]; assignments: Assignment[]; trainings: Training[]; children: Child[]; decorations: Decoration[]; languages: Language[]; computerSkills: ComputerSkill[]; attachments: Attachment[] };
const emptyData: StatisticsData = { personnel: [], military: [], grades: [], units: [], assignments: [], trainings: [], children: [], decorations: [], languages: [], computerSkills: [], attachments: [] };
const requests = [
  ["personnel", "/personnel/"], ["military", "/military-info/"], ["grades", "/grades/"], ["units", "/units"],
  ["assignments", "/assignments/"], ["trainings", "/trainings/"], ["children", "/children/"], ["decorations", "/decorations/"],
  ["languages", "/languages/"], ["computerSkills", "/computer-skills/"], ["attachments", "/attachments/"],
] as const;

export default function Statistique() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loadedResources, setLoadedResources] = useState<Set<string>>(() => new Set());

  const refresh = useCallback(async () => {
    const results = await Promise.allSettled(requests.map(([, path]) => api.get(path)));
    const failed = results.flatMap((result, index) => result.status === "rejected" || !Array.isArray(result.value.data) ? [requests[index][0]] : []);
    setData((previous) => {
      const merged = { ...previous } as StatisticsData;
      results.forEach((result, index) => {
        const [key] = requests[index];
        if (result.status === "fulfilled" && Array.isArray(result.value.data)) Object.assign(merged, { [key]: result.value.data });
      });
      return merged;
    });
    setLoadedResources((previous) => {
      const next = new Set(previous);
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && Array.isArray(result.value.data)) next.add(requests[index][0]);
      });
      return next;
    });
    setUpdatedAt((previous) => failed.length < requests.length ? new Date() : previous);
    setError(failed.length ? `Données indisponibles pour : ${failed.join(", ")}. Les dernières valeurs chargées sont conservées.` : "");
    setLoading(false);
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => { void refresh(); }, 0);
    const interval = window.setInterval(() => { void refresh(); }, 30_000);
    return () => { window.clearTimeout(start); window.clearInterval(interval); };
  }, [refresh]);

  const militaryById = useMemo(() => new Map(data.military.map((item) => [item.personnel_id, item])), [data.military]);
  const activeCount = data.personnel.filter((person) => militaryById.get(person.id_personnel)?.service_status?.toLowerCase() === "active").length;
  const childrenCount = data.children.length;
  const gradeRows = data.grades.map((grade) => ({ label: grade.name, count: data.personnel.filter((person) => person.grade_id === grade.id_grade).length }));
  const unitRows = data.units.map((unit) => ({ label: unit.name, count: data.military.filter((item) => item.unit === unit.name).length }));
  const latestRecruitments = useMemo(() => {
    const current = new Date();
    return Array.from({ length: 6 }, (_, index) => new Date(current.getFullYear(), current.getMonth() - 5 + index, 1)).map((date) => {
      const count = data.military.filter((item) => {
        if (!item.recruitment_date) return false;
        const recruited = new Date(`${item.recruitment_date}T00:00:00`);
        return recruited.getFullYear() === date.getFullYear() && recruited.getMonth() === date.getMonth();
      }).length;
      return { month: date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }), count };
    });
  }, [data.military]);

  const reportHeaders = ["Indicateur", "Valeur"];
  const reportRows: (string | number)[][] = [
    ["Personnel enregistré", data.personnel.length], ["Personnel actif", activeCount], ["Grades", data.grades.length], ["Unités", data.units.length],
    ["Affectations", data.assignments.length], ["Formations enregistrées", data.trainings.length], ["Enfants rattachés", childrenCount],
    ...gradeRows.map((item) => [`Personnel · ${item.label}`, item.count]),
    ...unitRows.map((item) => [`Personnel · ${item.label}`, item.count]),
    ...latestRecruitments.map((item) => [`Recrutements · ${item.month}`, item.count]),
  ];
  const exportReport = (format: "excel" | "pdf") => {
    if (format === "excel") downloadCsv("statistiques-rh.csv", reportHeaders, reportRows);
    else {
      try { printReport("Statistiques RH", reportHeaders, reportRows); }
      catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible de générer le PDF."); }
    }
  };

  const cards = [
    { label: "Effectif total", value: data.personnel.length, hint: "Fiches du backend" },
    { label: "Personnel actif", value: activeCount, hint: "Statut militaire actif" },
    { label: "Affectations", value: data.assignments.length, hint: "Enregistrements du backend" },
    { label: "Formations", value: data.trainings.length, hint: "Participants enregistrés" },
    { label: "Enfants", value: childrenCount, hint: "Liens parent-enfant réels" },
    { label: "Décorations", value: data.decorations.length, hint: "Enregistrements du backend" },
    { label: "Langues", value: data.languages.length, hint: "Compétences linguistiques" },
    { label: "Compétences informatiques", value: data.computerSkills.length, hint: "Compétences déclarées" },
    { label: "Pièces jointes", value: data.attachments.length, hint: "Métadonnées enregistrées" },
    { label: "Congés", value: "—", hint: "Données indisponibles · aucune API" },
    { label: "Fins de lien", value: "—", hint: "Données indisponibles · aucune API" },
  ];
  const resourcesByCard: Record<string, string[]> = {
    "Effectif total": ["personnel"], "Personnel actif": ["military", "personnel"],
    "Affectations": ["assignments"], "Formations": ["trainings"], "Enfants": ["children"],
    "Décorations": ["decorations"], "Langues": ["languages"],
    "Compétences informatiques": ["computerSkills"], "Pièces jointes": ["attachments"],
    "Congés": [], "Fins de lien": [],
  };

  return <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700"><Activity size={18} />Statistiques RH</div><h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Données réelles du personnel</h1><p className="mt-1 text-sm text-slate-500">Calculées depuis l’API et actualisées automatiquement toutes les 30 secondes.</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={loading} onClick={() => void refresh()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Actualiser</button><button type="button" disabled={loading || requests.some(([key]) => !loadedResources.has(key))} onClick={() => exportReport("excel")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Download size={16} />Exporter Excel</button><button type="button" disabled={loading || requests.some(([key]) => !loadedResources.has(key))} onClick={() => exportReport("pdf")} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"><Printer size={16} />Exporter PDF</button></div></header>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>{loading ? "Chargement…" : error || "Toutes les données disponibles sont à jour."}</span><span>{updatedAt ? `Dernière mise à jour : ${updatedAt.toLocaleTimeString("fr-FR")}` : ""}</span></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const resources = resourcesByCard[card.label]; const available = resources.length === 0 || resources.every((key) => loadedResources.has(key)); const value = available ? card.value : "—"; return <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{card.label}</p><Users size={17} className="text-blue-600" /></div><p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{typeof value === "number" ? <AnimatedCounter value={value} /> : value}</p><p className="mt-1 text-xs text-slate-500">{available ? card.hint : "Données indisponibles"}</p></article>; })}</section>
    <div className="grid gap-5 lg:grid-cols-2"><DataList title="Personnel par grade" rows={gradeRows} available={loadedResources.has("grades") && loadedResources.has("personnel")} /><DataList title="Personnel par unité" rows={unitRows} available={loadedResources.has("units") && loadedResources.has("military")} /></div>
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Recrutements récents</h2><p className="mt-1 text-xs text-slate-500">Comptage par mois depuis les dates de recrutement existantes.</p><div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{latestRecruitments.map((item) => <div key={item.month} className="rounded-lg bg-slate-50 p-3"><p className="text-xs capitalize text-slate-500">{item.month}</p><p className="mt-2 text-xl font-bold text-slate-900">{item.count}</p></div>)}</div></section>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4"><div><p className="font-medium text-blue-950">Gestion PDF des fiches personnel</p><p className="mt-1 text-sm text-blue-800">Les exports PDF et les outils d’import des fiches sont dans la gestion du personnel.</p></div><Link href="/personnel" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"><Printer size={16} />Ouvrir le personnel</Link></div>
  </div></div>;
}

function DataList({ title, rows, available }: { title: string; rows: { label: string; count: number }[]; available: boolean }) {
  const maximum = Math.max(1, ...rows.map((item) => item.count));
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">{title}</h2>{rows.length ? <ul className="mt-4 space-y-3">{rows.map((item) => <li key={item.label}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate text-slate-600">{item.label}</span><strong className="text-slate-900">{item.count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${(item.count / maximum) * 100}%` }} /></div></li>)}</ul> : <p className="mt-5 text-sm text-slate-500">{available ? "Aucune donnée" : "Données indisponibles"}</p>}</section>;
}
