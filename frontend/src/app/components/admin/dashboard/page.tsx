"use client";

import { useCallback, useEffect, useState } from "react";
import api from "../../../../../lib/api";
import Header from "./graph/Header";
import StatsCards from "./graph/StatsCards";
import Personnel from "./graph/Personnel";
import Effectifs from "./graph/effectifs";
import LastActivities from "./graph/lastActivities";

export interface DashboardPersonnel { id_personnel: number; grade_id: number | null; last_name: string; first_names: string }
export interface DashboardMilitaryInfo { id_military_info: number; personnel_id: number; service_status: string; recruitment_date: string | null }
export interface DashboardGrade { id_grade: number; name: string }
export interface DashboardUnit { id_unit: number; name: string }
export interface DashboardAuditLog { id_audit_log: number; action: string; entity: string; description: string | null; created_at: string }
export interface DashboardData {
  personnel: DashboardPersonnel[];
  military: DashboardMilitaryInfo[];
  grades: DashboardGrade[];
  units: DashboardUnit[];
  activities: DashboardAuditLog[];
  updatedAt: Date | null;
}

const emptyData: DashboardData = { personnel: [], military: [], grades: [], units: [], activities: [], updatedAt: null };

export default function DashboardPage({ onMenuClick }: { onMenuClick: () => void }) {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const refresh = useCallback(async () => {
    setActivitiesLoading(true);
    const [people, military, grades, units, activities] = await Promise.allSettled([
      api.get<DashboardPersonnel[]>("/personnel/"),
      api.get<DashboardMilitaryInfo[]>("/military-info/"),
      api.get<DashboardGrade[]>("/grades/"),
      api.get<DashboardUnit[]>("/units"),
      api.get<DashboardAuditLog[]>("/audit-logs/"),
    ]);
    const failures = [people, military, grades, units, activities].filter((result) => result.status === "rejected").length;
    if (activities.status === "rejected") {
      const detail = (activities.reason as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setActivitiesError(detail ?? "Le journal d’activités est indisponible. Vérifiez l’API /audit-logs/ et les droits administrateur.");
    } else setActivitiesError("");
    setData((previous) => ({
      personnel: people.status === "fulfilled" && Array.isArray(people.value.data) ? people.value.data : previous.updatedAt ? previous.personnel : [],
      military: military.status === "fulfilled" && Array.isArray(military.value.data) ? military.value.data : previous.updatedAt ? previous.military : [],
      grades: grades.status === "fulfilled" && Array.isArray(grades.value.data) ? grades.value.data : previous.updatedAt ? previous.grades : [],
      units: units.status === "fulfilled" && Array.isArray(units.value.data) ? units.value.data : previous.updatedAt ? previous.units : [],
      activities: activities.status === "fulfilled" && Array.isArray(activities.value.data) ? activities.value.data : previous.updatedAt ? previous.activities : [],
      updatedAt: failures < 5 ? new Date() : previous.updatedAt,
    }));
    setError(failures === 5 ? "Impossible de charger les données du tableau de bord. Vérifiez la connexion au serveur." : failures > 0 ? "Certaines données sont indisponibles; les sections concernées sont conservées à leur dernière valeur connue ou affichées à 0." : "");
    setLoading(false);
    setActivitiesLoading(false);
  }, []);

  useEffect(() => {
    const firstRefresh = window.setTimeout(() => { void refresh(); }, 0);
    const interval = window.setInterval(() => { void refresh(); }, 30_000);
    return () => { window.clearTimeout(firstRefresh); window.clearInterval(interval); };
  }, [refresh]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header onMenuClick={onMenuClick} notificationCount={0} />
      <div className="px-2 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-3 text-xs text-slate-500">
          <span>{loading ? "Chargement des données…" : error || "Données actualisées automatiquement"}</span>
          <span>{data.updatedAt ? `Dernière mise à jour : ${data.updatedAt.toLocaleTimeString("fr-FR")}` : ""}</span>
        </div>
        <StatsCards data={data} />
        <Personnel data={data} />
        <Effectifs data={data} />
        <LastActivities activities={data.activities} error={activitiesError} loading={activitiesLoading} onRefresh={() => void refresh()} />
      </div>
    </div>
  );
}
