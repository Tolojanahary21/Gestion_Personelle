"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import { AlertCircle, Award, FileText, Languages, MonitorCog, Pencil, Plus, RefreshCw, Search, Trash2, Users, X } from "lucide-react";

type Kind = "children" | "languages" | "computer-skills" | "decorations" | "attachments";
type Field = { key: string; label: string; type?: "text" | "date" | "number" | "select" | "textarea" | "file"; required?: boolean; options?: string[]; min?: number; max?: number };
type Row = Record<string, string | number | null | undefined>;
type Person = { id_personnel?: number; id?: number | string; last_name?: string; first_names?: string; nom?: string; prenom?: string; matricule?: string; children_count?: number };
type MilitaryRecord = { personnel_id: number; matricule: string };
type Section = { key: Kind; title: string; singular: string; icon: typeof Users; idKey: string; fields: Field[]; columns: string[] };

const sections: Section[] = [
  { key: "children", title: "Enfants", singular: "Enfant", icon: Users, idKey: "id_child", fields: [
    { key: "personnel_id", label: "Personnel parent", type: "select", required: true }, { key: "last_name", label: "Nom", required: true }, { key: "first_names", label: "Prénoms", required: true }, { key: "birth_date", label: "Date de naissance", type: "date" }, { key: "birth_place", label: "Lieu de naissance" }, { key: "gender", label: "Sexe", type: "select", options: ["Male", "Female"] }, { key: "school", label: "École" }, { key: "occupation", label: "Occupation" },
  ], columns: ["Nom complet", "Personnel parent", "Date de naissance", "Sexe", "École"] },
  { key: "languages", title: "Langues", singular: "Langue", icon: Languages, idKey: "id_language", fields: [
    { key: "personnel_id", label: "Personnel", type: "select", required: true }, { key: "name", label: "Langue", required: true }, { key: "proficiency", label: "Maîtrise", type: "select", required: true, options: ["Beginner", "Intermediate", "Advanced", "Fluent", "Native"] }, { key: "level", label: "Niveau CECR", type: "select", options: ["A1", "A2", "B1", "B2", "C1", "C2", "Native"] }, { key: "certification", label: "Certification" }, { key: "certification_date", label: "Date de certification", type: "date" }, { key: "notes", label: "Notes", type: "textarea" },
  ], columns: ["Langue", "Personnel", "Maîtrise", "Niveau", "Certification"] },
  { key: "computer-skills", title: "Compétences informatiques", singular: "Compétence", icon: MonitorCog, idKey: "id_computer_skill", fields: [
    { key: "personnel_id", label: "Personnel", type: "select", required: true }, { key: "skill_name", label: "Compétence", required: true }, { key: "category", label: "Catégorie", type: "select", required: true, options: ["Programming", "Database", "Office", "Networking", "Operating System", "Design", "Security", "Other"] }, { key: "proficiency", label: "Niveau", type: "select", required: true, options: ["Beginner", "Intermediate", "Advanced", "Expert"] }, { key: "years_experience", label: "Années d’expérience", type: "number", min: 0, required: true }, { key: "certification", label: "Certification" }, { key: "certification_date", label: "Date de certification", type: "date" }, { key: "notes", label: "Notes", type: "textarea" },
  ], columns: ["Compétence", "Personnel", "Catégorie", "Niveau", "Expérience"] },
  { key: "decorations", title: "Décorations", singular: "Décoration", icon: Award, idKey: "id_decoration", fields: [
    { key: "personnel_id", label: "Personnel", type: "select", required: true }, { key: "name", label: "Nom de la décoration", required: true }, { key: "decoration_type", label: "Type", type: "select", required: true, options: ["Medal", "Order", "Commendation", "Distinction", "Other"] }, { key: "award_date", label: "Date d’attribution", type: "date", required: true }, { key: "awarding_authority", label: "Autorité attributaire" }, { key: "reference_number", label: "Référence" }, { key: "description", label: "Description", type: "textarea" }, { key: "notes", label: "Notes", type: "textarea" },
  ], columns: ["Décoration", "Personnel", "Type", "Date", "Référence"] },
  { key: "attachments", title: "Pièces jointes", singular: "Pièce jointe", icon: FileText, idKey: "id_attachment", fields: [
    { key: "personnel_id", label: "Personnel", type: "select", required: true }, { key: "file_path", label: "Fichier à téléverser", type: "file", required: true }, { key: "document_type", label: "Type de document", type: "select", required: true, options: ["Identity", "Passport", "Certificate", "Diploma", "Medical", "Military", "Decoration", "Training", "Other"] }, { key: "description", label: "Description", type: "textarea" },
  ], columns: ["Fichier", "Personnel", "Type de document", "Format", "Taille"] },
];

const endpointFor = (key: Kind) => `/${key}/`;
const personId = (person: Person) => person.id_personnel ?? person.id;
const personLabel = (person: Person) => `${person.last_name ?? person.nom ?? ""} ${person.first_names ?? person.prenom ?? ""}`.trim();
const readableError = (error: unknown) => {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item: { msg?: string }) => item.msg ?? "Valeur invalide").join(" · ");
  return "La requête a échoué. Vérifiez les données et la connexion au serveur.";
};

export default function Dossiers() {
  const [activeKey, setActiveKey] = useState<Kind>("children");
  const [rows, setRows] = useState<Record<Kind, Row[]>>({ children: [], languages: [], "computer-skills": [], decorations: [], attachments: [] });
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [parentSearch, setParentSearch] = useState("");
  const [showAllParents, setShowAllParents] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState("all");
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const section = sections.find((item) => item.key === activeKey)!;

  const load = useCallback(async (preserveError = false) => {
    setLoading(true);
    const results = await Promise.allSettled([
      ...sections.map((item) => api.get<Row[]>(endpointFor(item.key))),
      api.get<Person[]>("/personnel/"),
      api.get<MilitaryRecord[]>("/military-info/"),
    ]);
    const nextRows = {} as Record<Kind, Row[]>;
    sections.forEach((item, index) => {
      const result = results[index];
      nextRows[item.key] = result.status === "fulfilled" && Array.isArray(result.value.data) ? result.value.data : [];
    });
    const peopleResult = results[sections.length];
    const militaryResult = results[sections.length + 1] as PromiseSettledResult<{ data: MilitaryRecord[] }>;
    const militaryRecords = militaryResult.status === "fulfilled" && Array.isArray(militaryResult.value.data) ? militaryResult.value.data : [];
    const militaryByPerson = new Map<number, string>(militaryRecords.map((item) => [item.personnel_id, item.matricule]));
    setRows(nextRows);
    setPersonnel(peopleResult.status === "fulfilled" && Array.isArray(peopleResult.value.data) ? (peopleResult.value.data as Person[]).map((person) => ({ ...person, matricule: String(militaryByPerson.get(Number(personId(person))) ?? "") })) : []);
    const failures = results.filter((result) => result.status === "rejected").length;
    if (failures || !preserveError) setError(failures ? `${failures} source(s) n’ont pas pu être chargées. Les autres listes restent disponibles.` : "");
    setLoading(false);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => { void load(); });
    return () => cancelAnimationFrame(frame);
  }, [load]);

  const personName = (id: unknown) => {
    const person = personnel.find((item) => String(personId(item)) === String(id));
    return person ? `${person.matricule ? `${person.matricule} · ` : ""}${personLabel(person)}` : id == null ? "Personnel non associé" : `Personnel #${id}`;
  };
  async function removeUploadedFile(path: string) {
    if (!path.startsWith("/upload/")) return;
    const filename = path.split("/").pop();
    if (filename) await fetch(`/api/uploads/${encodeURIComponent(filename)}`, { method: "DELETE", credentials: "same-origin" });
  }
  const visibleRows = useMemo(() => rows[activeKey].filter((row) => {
    const matchesPerson = personFilter === "all" || String(row.personnel_id) === personFilter;
    const haystack = Object.values(row).join(" ").toLocaleLowerCase();
    return matchesPerson && haystack.includes(search.toLocaleLowerCase());
  }), [activeKey, personFilter, rows, search]);

  const openCreate = () => {
    const initial: Record<string, string> = {};
    section.fields.forEach((field) => { initial[field.key] = field.key === "personnel_id" ? (personFilter === "all" ? "" : personFilter) : field.key === "years_experience" ? "0" : ""; });
    setForm(initial); setSelected(null); setSelectedFile(null); setParentSearch(initial.personnel_id ? personName(initial.personnel_id) : ""); setShowAllParents(false); setError(""); setModal("create");
  };
  const openEdit = (row: Row) => {
    const values: Record<string, string> = {};
    section.fields.forEach((field) => { values[field.key] = row[field.key] == null ? "" : String(row[field.key]).slice(0, field.type === "date" ? 10 : undefined); });
    setForm(values); setSelected(row); setSelectedFile(null); setParentSearch(values.personnel_id ? personName(values.personnel_id) : ""); setShowAllParents(false); setError(""); setModal("edit");
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(""); if (activeKey === "children" && !form.personnel_id) { setError("S?lectionnez le personnel parent dans la liste."); setSaving(false); return; }
    if (activeKey === "attachments" && modal === "create" && !selectedFile) { setError("Sélectionnez un fichier à téléverser."); setSaving(false); return; }
    const payload: Row = {};
    for (const field of section.fields) {
      const value = form[field.key]?.trim() ?? "";
      if (!value) { payload[field.key] = field.type === "number" ? 0 : null; continue; }
      payload[field.key] = field.key === "personnel_id" || field.type === "number" ? Number(value) : value;
    }
    let uploadedPath = "";
    try {
      if (activeKey === "attachments" && selectedFile) {
        const fileForm = new FormData(); fileForm.set("file", selectedFile);
        const uploadResponse = await fetch("/api/uploads", { method: "POST", body: fileForm, credentials: "same-origin" });
        const uploadData = await uploadResponse.json() as { file_name?: string; file_path?: string; file_type?: string; file_size?: number; detail?: string };
        if (!uploadResponse.ok || !uploadData.file_path) throw new Error(uploadData.detail ?? "Le téléversement du fichier a échoué.");
        uploadedPath = uploadData.file_path;
        Object.assign(payload, uploadData);
      } else if (activeKey === "attachments" && selected) {
        payload.file_path = selected.file_path;
        payload.file_name = selected.file_name;
        payload.file_type = selected.file_type;
        payload.file_size = selected.file_size;
      }
      if (modal === "edit" && selected) {
        await api.put(`${endpointFor(activeKey)}${selected[section.idKey]}`, payload);
        if (activeKey === "children" && String(selected.personnel_id) !== String(payload.personnel_id)) {
          const previousId = String(selected.personnel_id);
          const nextId = String(payload.personnel_id);
          const previousCount = rows.children.filter((child) => String(child.personnel_id) === previousId).length;
          const nextCount = rows.children.filter((child) => String(child.personnel_id) === nextId).length;
          await Promise.all([
            api.put(`/personnel/${previousId}`, { children_count: Math.max(0, previousCount - 1) }),
            api.put(`/personnel/${nextId}`, { children_count: nextCount + 1 }),
          ]);
        }
      } else await api.post(endpointFor(activeKey), payload);
      if (activeKey === "children") window.dispatchEvent(new Event("sgpnrh-children-updated"));
      if (uploadedPath && modal === "edit" && selected?.file_path) await removeUploadedFile(String(selected.file_path));
      setModal(null); setSelectedFile(null); await load();
    } catch (caught) {
      if (uploadedPath) await removeUploadedFile(uploadedPath);
      if (activeKey === "children") window.dispatchEvent(new Event("sgpnrh-children-updated"));
      setError(readableError(caught)); await load(true);
    }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!selected) return;
    setSaving(true); setError("");
    try { await api.delete(`${endpointFor(activeKey)}${selected[section.idKey]}`); if (activeKey === "children") window.dispatchEvent(new Event("sgpnrh-children-updated")); if (activeKey === "attachments") await removeUploadedFile(String(selected.file_path ?? "")); setModal(null); setSelected(null); await load(); }
    catch (caught) { setError(readableError(caught)); await load(true); }
    finally { setSaving(false); }
  };

  const displayValue = (row: Row, column: string) => {
    const v = (key: string) => row[key];
    switch (activeKey) {
      case "children": return column === "Nom complet" ? `${v("last_name") ?? ""} ${v("first_names") ?? ""}` : column === "Personnel parent" ? personName(v("personnel_id")) : column === "Date de naissance" ? (v("birth_date") ? new Date(String(v("birth_date"))).toLocaleDateString("fr-FR") : "—") : column === "Sexe" ? (v("gender") ?? "—") : (v("school") ?? "—");
      case "languages": return column === "Langue" ? v("name") : column === "Personnel" ? personName(v("personnel_id")) : column === "Maîtrise" ? v("proficiency") : column === "Niveau" ? (v("level") ?? "—") : (v("certification") ?? "—");
      case "computer-skills": return column === "Compétence" ? v("skill_name") : column === "Personnel" ? personName(v("personnel_id")) : column === "Catégorie" ? v("category") : column === "Niveau" ? v("proficiency") : `${v("years_experience") ?? 0} an(s)`;
      case "decorations": return column === "Décoration" ? v("name") : column === "Personnel" ? personName(v("personnel_id")) : column === "Type" ? v("decoration_type") : column === "Date" ? new Date(String(v("award_date"))).toLocaleDateString("fr-FR") : (v("reference_number") ?? "—");
      case "attachments": return column === "Fichier" ? v("file_name") : column === "Personnel" ? personName(v("personnel_id")) : column === "Type de document" ? v("document_type") : column === "Format" ? (v("file_type") ?? "—") : v("file_size") == null ? "—" : `${v("file_size")} octets`;
    }
  };
  const renderValue = (row: Row, column: string) => {
    if (activeKey === "attachments" && column === "Fichier" && typeof row.file_path === "string" && row.file_path.startsWith("/upload/")) {
      const filename = row.file_path.split("/").pop() ?? "";
      return <a href={`/api/uploads/${encodeURIComponent(filename)}?name=${encodeURIComponent(String(row.file_name ?? "document"))}`} className="inline-flex items-center gap-1 font-medium text-blue-700 underline-offset-2 hover:underline">{String(row.file_name ?? "Télécharger")}</a>;
    }
    return displayValue(row, column);
  };

  return <div className="mx-auto max-w-7xl space-y-5 p-4 pt-16 md:p-7"><header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Dossiers du personnel</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Informations complémentaires</h1><p className="mt-1 text-sm text-slate-500">Données synchronisées avec les tables du backend.</p></div><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Actualiser</button></header>
    {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
    <nav className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">{sections.map((item) => { const Icon = item.icon; return <button key={item.key} type="button" onClick={() => { setActiveKey(item.key); setPersonFilter("all"); }} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${activeKey === item.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={16} />{item.title}</button>; })}</nav>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div><h2 className="font-semibold text-slate-900">{section.title}</h2><p className="mt-1 text-xs text-slate-500">{visibleRows.length} enregistrement(s)</p></div><div className="flex flex-wrap gap-2"><label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher…" className="w-48 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></label><select value={personFilter} onChange={(event) => setPersonFilter(event.target.value)} className="max-w-52 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"><option value="all">Tous les personnels</option>{personnel.map((item) => <option key={String(personId(item))} value={personId(item)}>{personName(personId(item))}</option>)}</select><button type="button" onClick={openCreate} disabled={!personnel.length} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} />Ajouter</button></div></div>{activeKey === "attachments" && <p className="border-b border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-blue-800">Téléversement sécurisé (10 Mo max). Les fichiers sont stockés dans public/upload et téléchargeables par les administrateurs.</p>}
      {loading ? <p className="p-8 text-center text-sm text-slate-500">Chargement des données…</p> : !visibleRows.length ? <p className="p-10 text-center text-sm text-slate-500">Aucun enregistrement dans cette liste.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{section.columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}<th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleRows.map((row) => <tr key={String(row[section.idKey])} className="hover:bg-slate-50/70">{section.columns.map((column) => <td key={column} className="max-w-64 truncate px-4 py-3 text-slate-700">{renderValue(row, column) ?? "—"}</td>)}<td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" aria-label="Modifier" onClick={() => openEdit(row)} className="rounded-md p-2 text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button><button type="button" aria-label="Supprimer" onClick={() => { setSelected(row); setModal("delete"); }} className="rounded-md p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
    </section>
    {modal && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><section role="dialog" aria-modal="true" aria-labelledby="dossier-dialog-title" className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm"><header className="flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4"><div><h2 id="dossier-dialog-title" className="font-bold text-slate-900">{modal === "delete" ? `Supprimer ${section.singular.toLowerCase()}` : `${modal === "edit" ? "Modifier" : "Ajouter"} · ${section.singular}`}</h2><p className="mt-1 text-xs text-slate-500">Les changements sont enregistrés directement dans le backend.</p></div><button type="button" onClick={() => setModal(null)} disabled={saving} aria-label="Fermer" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></header>
      {modal === "delete" ? <div className="p-5"><p className="text-sm text-slate-700">Confirmer la suppression de cet enregistrement ? Cette action est définitive.</p>{error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}<footer className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Annuler</button><button type="button" disabled={saving} onClick={() => void remove()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Suppression…" : "Supprimer"}</button></footer></div> : <form onSubmit={(event) => void submit(event)} className="p-5"><div className="grid gap-4 sm:grid-cols-2">{section.fields.map((field) => <label key={field.key} className={`block ${field.type === "textarea" ? "sm:col-span-2" : ""}`}><span className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}{field.required && <span className="text-red-500"> *</span>}</span>{field.key === "personnel_id" && activeKey === "children" ? <div><input type="search" value={parentSearch} onChange={(event) => { setParentSearch(event.target.value); setForm((current) => ({ ...current, personnel_id: "" })); setShowAllParents(false); }} placeholder="Rechercher un parent par nom ou matricule…" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /><div className="mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-200" role="listbox" aria-label="Personnel parent">{personnel.filter((item) => `${personLabel(item)} ${item.matricule ?? ""}`.toLocaleLowerCase().includes(parentSearch.toLocaleLowerCase())).slice(0, showAllParents ? undefined : 5).map((item) => <button key={String(personId(item))} type="button" role="option" aria-selected={form.personnel_id === String(personId(item))} onClick={() => { setForm((current) => ({ ...current, personnel_id: String(personId(item)) })); setParentSearch(personName(personId(item))); }} className={`block w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${form.personnel_id === String(personId(item)) ? "bg-blue-50 font-semibold text-blue-800" : "text-slate-700"}`}>{item.matricule ? <span className="mr-2 font-semibold">{item.matricule}</span> : null}{personLabel(item)}</button>)}</div>{personnel.filter((item) => `${personLabel(item)} ${item.matricule ?? ""}`.toLocaleLowerCase().includes(parentSearch.toLocaleLowerCase())).length > 5 && <button type="button" onClick={() => setShowAllParents((value) => !value)} className="mt-1 text-xs font-semibold text-blue-700 hover:underline">{showAllParents ? "Réduire la liste" : "Voir tout"}</button>}</div> : field.key === "personnel_id" ? <select required value={form[field.key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"><option value="">Choisir un personnel</option>{personnel.map((item) => <option key={String(personId(item))} value={personId(item)}>{personName(personId(item))}</option>)}</select> : field.type === "file" ? <div><input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,.docx,.xlsx" required={field.required && modal === "create"} onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700" /><p className="mt-1 text-xs text-slate-500">{selectedFile ? `${selectedFile.name} (${Math.ceil(selectedFile.size / 1024)} Ko)` : selected?.file_name ? `Fichier actuel : ${selected.file_name}` : "PDF, image, TXT, DOCX ou XLSX · 10 Mo maximum"}</p></div> : field.type === "select" ? <select required={field.required} value={form[field.key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"><option value="">Sélectionner…</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : field.type === "textarea" ? <textarea value={form[field.key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /> : <input required={field.required} type={field.type ?? "text"} min={field.min} max={field.max} value={form[field.key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />}</label>)}</div>{error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}<footer className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setModal(null)} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700">Annuler</button><button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer"}</button></footer></form>}
    </section></div>}
  </div>;
}




