"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Anchor, Baby, LogOut, ShieldCheck, UserRound } from "lucide-react";
import api from "../../../lib/api";

type UserProfile = { username: string; role: string; personnel_id: number | null };
type Personnel = { id_personnel: number; last_name: string; first_names: string; grade_id: number | null; email: string | null };
type Military = { matricule: string; unit: string | null; specialty: string | null; service_status: string };
type Child = { id_child: number; last_name: string; first_names: string };

export default function MonEspacePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Personnel | null>(null);
  const [military, setMilitary] = useState<Military | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const frame = requestAnimationFrame(() => {
      void (async () => {
        try {
          const { data: user } = await api.get<UserProfile>("/auth/me", { signal: controller.signal });
          if (!user.personnel_id) throw new Error("Votre compte n’est rattaché à aucun dossier personnel.");
          setUsername(user.username);
          const [person, militaryInfo, childrenList] = await Promise.all([
            api.get<Personnel>(`/personnel/${user.personnel_id}`, { signal: controller.signal }),
            api.get<Military>(`/military-info/personnel/${user.personnel_id}`, { signal: controller.signal }),
            api.get<Child[]>(`/children/personnel/${user.personnel_id}`, { signal: controller.signal }),
          ]);
          setProfile(person.data); setMilitary(militaryInfo.data); setChildren(childrenList.data);
        } catch (cause) {
          if (!controller.signal.aborted) {
            const detail = (cause as { response?: { data?: { detail?: string } } }).response?.data?.detail;
            setError(detail ?? (cause instanceof Error ? cause.message : "Impossible de charger votre dossier."));
          }
        } finally { if (!controller.signal.aborted) setLoading(false); }
      })();
    });
    return () => { cancelAnimationFrame(frame); controller.abort(); };
  }, []);

  async function logout() { try { await api.post("/auth/logout"); } finally { router.replace("/login"); router.refresh(); } }

  return <main className="min-h-screen bg-slate-50 px-4 py-10"><div className="mx-auto max-w-4xl"><header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-950 p-6 text-white shadow-xl"><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600"><Anchor size={24} /></span><div><p className="text-xs font-semibold uppercase tracking-widest text-blue-300">Espace personnel</p><h1 className="mt-1 text-2xl font-bold">Mon dossier</h1></div></div><button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"><LogOut size={16} />Déconnexion</button></header>{error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}{loading ? <p className="mt-6 text-sm text-slate-500">Chargement de votre dossier…</p> : profile && <div className="mt-6 grid gap-5 md:grid-cols-3"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2"><div className="flex items-center gap-3"><UserRound className="text-blue-600" /><div><h2 className="text-lg font-bold text-slate-900">{profile.first_names} {profile.last_name}</h2><p className="text-sm text-slate-500">Compte : {username}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="Matricule" value={military?.matricule ?? "—"} /><Info label="Unité" value={military?.unit ?? "—"} /><Info label="Fonction" value={military?.specialty ?? "—"} /><Info label="Statut" value={military?.service_status ?? "—"} /><Info label="E-mail" value={profile.email ?? "—"} /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Baby className="text-blue-600" /><h2 className="font-semibold text-slate-900">Enfants ({children.length})</h2></div>{children.length ? <ul className="mt-4 space-y-2">{children.map((child) => <li key={child.id_child} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{child.first_names} {child.last_name}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Aucun enfant enregistré.</p>}</section><div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 md:col-span-3"><ShieldCheck size={18} />Accès lecture seule à votre propre dossier.</div></div>}</div></main>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-medium text-slate-900">{value}</p></div>; }
