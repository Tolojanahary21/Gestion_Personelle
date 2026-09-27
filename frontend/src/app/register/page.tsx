"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, ArrowLeft, BadgeCheck, LockKeyhole, UserRoundPlus } from "lucide-react";
import api from "../../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ first_names: "", last_name: "", matricule: "", email: "", username: "", password: "", confirmation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    try {
      await api.post("/auth/register", { ...form, first_names: form.first_names.trim(), last_name: form.last_name.trim(), matricule: form.matricule.trim(), email: form.email.trim(), username: form.username.trim() });
      setError("");
      router.replace("/login?registered=1");
    } catch (cause) {
      const response = cause as { response?: { data?: { detail?: unknown } } };
      const detail = response.response?.data?.detail;
      if (typeof detail === "string") setError(detail);
      else if (Array.isArray(detail)) setError(detail.map((item: { msg?: string }) => item.msg ?? "Champ invalide").join(" · "));
      else setError("Impossible de créer le compte. Vérifiez le serveur puis réessayez.");
    } finally { setLoading(false); }
  }

  const fields: { key: keyof typeof form; label: string; autoComplete: string; type?: string; minLength?: number }[] = [
    { key: "first_names", label: "Prénoms tels qu’inscrits au dossier", autoComplete: "given-name" },
    { key: "last_name", label: "Nom de famille", autoComplete: "family-name" },
    { key: "matricule", label: "Matricule du personnel", autoComplete: "off" },
    { key: "email", label: "E-mail enregistré dans le dossier", autoComplete: "email", type: "email" },
    { key: "username", label: "Nom d’utilisateur", autoComplete: "username", minLength: 3 },
    { key: "password", label: "Mot de passe (8 caractères minimum)", autoComplete: "new-password", type: "password", minLength: 8 },
    { key: "confirmation", label: "Confirmer le mot de passe", autoComplete: "new-password", type: "password", minLength: 8 },
  ];

  return <main className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950 px-4 py-8 text-white"><div className="absolute inset-0 overflow-hidden"><div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" /><div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" /></div><section className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/85 shadow-2xl shadow-black/40 backdrop-blur-xl"><header className="border-b border-white/10 px-6 py-6 sm:px-9"><Link href="/login" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft size={16} />Retour à la connexion</Link><div className="flex items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/40"><Anchor size={23} /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Espace du personnel</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Créer un compte</h1></div></div><p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Le compte sera rattaché à votre dossier personnel existant. Les nom, prénoms et matricule doivent correspondre exactement à votre dossier.</p></header><form onSubmit={(event) => void submit(event)} className="space-y-5 px-6 py-6 sm:px-9"><div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <label key={field.key} className="block"><span className="mb-1.5 block text-sm font-medium text-slate-200">{field.label}<span className="ml-1 text-red-400">*</span></span><input required minLength={field.minLength} type={field.type ?? "text"} autoComplete={field.autoComplete} disabled={loading} value={form[field.key]} onChange={(event) => update(field.key, event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60" /></label>)}</div><div className="flex items-start gap-3 rounded-xl border border-blue-400/15 bg-blue-500/5 p-4 text-sm leading-5 text-blue-100/80"><BadgeCheck size={18} className="mt-0.5 shrink-0 text-blue-300" /><p>Le rôle créé est <strong>Personnel (Staff)</strong>. Il donne accès uniquement à votre espace personnel en lecture seule.</p></div>{error && <div role="alert" aria-live="assertive" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}<button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 active:scale-[.99] disabled:cursor-wait disabled:opacity-60">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Création du compte…</> : <><UserRoundPlus size={18} />Créer mon compte</>}</button><p className="text-center text-xs text-slate-500"><LockKeyhole size={13} className="mr-1 inline" />Votre mot de passe est transmis au backend via la connexion sécurisée.</p></form></section></main>;
}
