"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
   ========================================================= */

interface Personnel {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  grade: string;
  service: string;
  statut: "Actif" | "Inactif";
  dateEntree: string;
}

interface Formation {
  id: string;
  nom: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  participantsIds: string[];
}

interface Conge {
  id: string;
  personnelId: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  statut: "En attente" | "Approuvé" | "Refusé";
}

interface FinDeLien {
  id: string;
  personnelId: string;
  type: string;
  dateFin: string;
}

/* =========================================================
   STORAGE
   ========================================================= */

const PERSONNEL_STORAGE_KEY = "sgpnrh_personnel";
const FORMATION_STORAGE_KEY = "sgpnrh_formations";
const CONGE_STORAGE_KEY = "sgpnrh_conges";
const FIN_DE_LIEN_STORAGE_KEY = "sgpnrh_fin_de_lien";

/* =========================================================
   DEMO DATA
   ========================================================= */

const DEFAULT_PERSONNELS: Personnel[] = [
  {
    id: "personnel-001",
    matricule: "MAT-001",
    nom: "RAKOTO",
    prenom: "Jean",
    grade: "Administrateur",
    service: "Ressources Humaines",
    statut: "Actif",
    dateEntree: "2022-01-10",
  },
  {
    id: "personnel-002",
    matricule: "MAT-002",
    nom: "RABE",
    prenom: "Marie",
    grade: "Chef de service",
    service: "Informatique",
    statut: "Actif",
    dateEntree: "2021-05-15",
  },
  {
    id: "personnel-003",
    matricule: "MAT-003",
    nom: "RANDRIA",
    prenom: "Louis",
    grade: "Technicien",
    service: "Maintenance",
    statut: "Actif",
    dateEntree: "2023-03-20",
  },
  {
    id: "personnel-004",
    matricule: "MAT-004",
    nom: "RAZAFINDRA",
    prenom: "Paul",
    grade: "Agent",
    service: "Exploitation",
    statut: "Actif",
    dateEntree: "2024-02-01",
  },
  {
    id: "personnel-005",
    matricule: "MAT-005",
    nom: "RANAIVO",
    prenom: "Sarah",
    grade: "Technicien",
    service: "Informatique",
    statut: "Inactif",
    dateEntree: "2020-08-12",
  },
  {
    id: "personnel-006",
    matricule: "MAT-006",
    nom: "ANDRIAMBO",
    prenom: "Michel",
    grade: "Agent",
    service: "Logistique",
    statut: "Actif",
    dateEntree: "2023-11-10",
  },
];

const DEFAULT_FORMATIONS: Formation[] = [
  {
    id: "formation-001",
    nom: "Formation Management",
    type: "Interne",
    dateDebut: "2026-01-15",
    dateFin: "2026-01-20",
    participantsIds: ["personnel-001", "personnel-002"],
  },
  {
    id: "formation-002",
    nom: "Sécurité professionnelle",
    type: "Certifiante",
    dateDebut: "2026-04-10",
    dateFin: "2026-04-15",
    participantsIds: ["personnel-003", "personnel-004"],
  },
  {
    id: "formation-003",
    nom: "Informatique avancée",
    type: "Externe",
    dateDebut: "2026-06-01",
    dateFin: "2026-06-05",
    participantsIds: ["personnel-002", "personnel-005"],
  },
];

const DEFAULT_CONGES: Conge[] = [
  {
    id: "conge-001",
    personnelId: "personnel-001",
    type: "Congé annuel",
    dateDebut: "2026-07-01",
    dateFin: "2026-07-10",
    statut: "Approuvé",
  },
  {
    id: "conge-002",
    personnelId: "personnel-003",
    type: "Congé annuel",
    dateDebut: "2026-08-05",
    dateFin: "2026-08-15",
    statut: "Approuvé",
  },
  {
    id: "conge-003",
    personnelId: "personnel-004",
    type: "Congé exceptionnel",
    dateDebut: "2026-09-20",
    dateFin: "2026-09-22",
    statut: "En attente",
  },
];

const DEFAULT_FIN_DE_LIEN: FinDeLien[] = [
  {
    id: "fin-001",
    personnelId: "personnel-005",
    type: "Retraite",
    dateFin: "2026-03-31",
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

function getStorageData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const data = localStorage.getItem(key);

    if (!data) {
      return fallback;
    }

    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function getCurrentMonth() {
  return new Date().getMonth();
}

function getCurrentYear() {
  return new Date().getFullYear();
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Statistique() {
  const [showDetails, setShowDetails] = useState(false);

  const personnels = useMemo(
    () =>
      getStorageData<Personnel[]>(
        PERSONNEL_STORAGE_KEY,
        DEFAULT_PERSONNELS
      ),
    []
  );

  const formations = useMemo(
    () =>
      getStorageData<Formation[]>(
        FORMATION_STORAGE_KEY,
        DEFAULT_FORMATIONS
      ),
    []
  );

  const conges = useMemo(
    () =>
      getStorageData<Conge[]>(
        CONGE_STORAGE_KEY,
        DEFAULT_CONGES
      ),
    []
  );

  const finsDeLien = useMemo(
    () =>
      getStorageData<FinDeLien[]>(
        FIN_DE_LIEN_STORAGE_KEY,
        DEFAULT_FIN_DE_LIEN
      ),
    []
  );

  /* =========================================================
     STATISTIQUES PRINCIPALES
     ========================================================= */

  const totalPersonnel = personnels.length;

  const personnelActifs = personnels.filter(
    (personnel) => personnel.statut === "Actif"
  ).length;

  const personnelInactifs = personnels.filter(
    (personnel) => personnel.statut === "Inactif"
  ).length;

  const totalFormations = formations.length;

  const totalConges = conges.length;

  const congesApprouves = conges.filter(
    (conge) => conge.statut === "Approuvé"
  ).length;

  const totalFinsDeLien = finsDeLien.length;

  const personnelEnFormation = new Set(
    formations.flatMap((formation) => formation.participantsIds)
  ).size;

  /* =========================================================
     REPARTITION PAR GRADE
     ========================================================= */

  const repartitionGrade = useMemo(() => {
    const result: Record<string, number> = {};

    personnels.forEach((personnel) => {
      result[personnel.grade] = (result[personnel.grade] || 0) + 1;
    });

    return Object.entries(result)
      .sort((a, b) => b[1] - a[1])
      .map(([grade, total]) => ({
        grade,
        total,
        percentage:
          totalPersonnel > 0
            ? Math.round((total / totalPersonnel) * 100)
            : 0,
      }));
  }, [personnels, totalPersonnel]);

  /* =========================================================
     REPARTITION PAR SERVICE
     ========================================================= */

  const repartitionService = useMemo(() => {
    const result: Record<string, number> = {};

    personnels.forEach((personnel) => {
      result[personnel.service] =
        (result[personnel.service] || 0) + 1;
    });

    return Object.entries(result)
      .sort((a, b) => b[1] - a[1])
      .map(([service, total]) => ({
        service,
        total,
        percentage:
          totalPersonnel > 0
            ? Math.round((total / totalPersonnel) * 100)
            : 0,
      }));
  }, [personnels, totalPersonnel]);

  /* =========================================================
     EVOLUTION DES EFFECTIFS
     ========================================================= */

  const evolutionEffectif = useMemo(() => {
    const currentYear = getCurrentYear();

    return Array.from({ length: 6 }, (_, index) => {
      const month = index + 1;

      const count = personnels.filter((personnel) => {
        const dateEntree = new Date(personnel.dateEntree);

        return (
          dateEntree.getFullYear() <= currentYear &&
          dateEntree.getMonth() + 1 <= month
        );
      }).length;

      return {
        mois: new Date(
          currentYear,
          month - 1,
          1
        ).toLocaleDateString("fr-FR", {
          month: "short",
        }),
        total: count,
      };
    });
  }, [personnels]);

  /* =========================================================
     TAUX
     ========================================================= */

  const tauxActivite =
    totalPersonnel > 0
      ? Math.round((personnelActifs / totalPersonnel) * 100)
      : 0;

  const tauxFormation =
    totalPersonnel > 0
      ? Math.round((personnelEnFormation / totalPersonnel) * 100)
      : 0;

  const tauxCongesApprouves =
    totalConges > 0
      ? Math.round((congesApprouves / totalConges) * 100)
      : 0;

  /* =========================================================
     CURRENT MONTH
     ========================================================= */

  const currentMonth = getCurrentMonth();

  const formationsCeMois = formations.filter((formation) => {
    const date = new Date(formation.dateDebut);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === getCurrentYear()
    );
  }).length;

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-slate-700" />

              <span className="text-sm font-medium text-slate-500">
                Gestion du personnel
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Statistiques RH
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Vue globale des effectifs et des activités du personnel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Activity className="h-4 w-4" />
            Vue détaillée
          </button>
        </div>

        {/* ===================================================
            STAT CARDS
        =================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Effectif total"
            value={totalPersonnel}
            description="Personnels enregistrés"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            title="Personnel actif"
            value={personnelActifs}
            description={`${tauxActivite}% de l'effectif`}
            icon={<UserCheck className="h-5 w-5" />}
          />

          <StatCard
            title="Formations"
            value={totalFormations}
            description={`${formationsCeMois} ce mois`}
            icon={<GraduationCap className="h-5 w-5" />}
          />

          <StatCard
            title="Fins de lien"
            value={totalFinsDeLien}
            description="Dossiers enregistrés"
            icon={<UserMinus className="h-5 w-5" />}
          />

        </div>

        {/* ===================================================
            SECONDARY STATS
        =================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <MiniStat
            title="Inactifs"
            value={personnelInactifs}
            icon={<UserMinus className="h-4 w-4" />}
          />

          <MiniStat
            title="En formation"
            value={personnelEnFormation}
            icon={<GraduationCap className="h-4 w-4" />}
          />

          <MiniStat
            title="Congés"
            value={totalConges}
            icon={<CalendarDays className="h-4 w-4" />}
          />

          <MiniStat
            title="Congés approuvés"
            value={`${tauxCongesApprouves}%`}
            icon={<UserCheck className="h-4 w-4" />}
          />

        </div>

        {/* ===================================================
            MAIN CHARTS
        =================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Evolution */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Évolution des effectifs
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Évolution mensuelle de l'effectif
                </p>
              </div>

              <TrendingUp className="h-5 w-5 text-slate-500" />
            </div>

            <div className="flex h-56 items-end gap-3">

              {evolutionEffectif.map((item) => {

                const max =
                  Math.max(
                    ...evolutionEffectif.map(
                      (value) => value.total
                    ),
                    1
                  );

                const height =
                  (item.total / max) * 100;

                return (
                  <div
                    key={item.mois}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-xs font-medium text-slate-600">
                      {item.total}
                    </span>

                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-lg bg-slate-800 transition-all hover:bg-slate-700"
                        style={{
                          height: `${Math.max(
                            height,
                            8
                          )}%`,
                        }}
                      />
                    </div>

                    <span className="text-xs capitalize text-slate-400">
                      {item.mois}
                    </span>
                  </div>
                );
              })}

            </div>
          </section>

          {/* Activité */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Activité RH
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Indicateurs des principaux modules
                </p>
              </div>

              <Activity className="h-5 w-5 text-slate-500" />
            </div>

            <div className="space-y-5">

              <ProgressStat
                label="Personnel actif"
                value={personnelActifs}
                total={totalPersonnel}
                percentage={tauxActivite}
              />

              <ProgressStat
                label="Personnel en formation"
                value={personnelEnFormation}
                total={totalPersonnel}
                percentage={tauxFormation}
              />

              <ProgressStat
                label="Congés approuvés"
                value={congesApprouves}
                total={totalConges}
                percentage={tauxCongesApprouves}
              />

            </div>
          </section>

        </div>

        {/* ===================================================
            GRADE + SERVICE
        =================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Grades */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <Users className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Répartition par grade
                </h2>

                <p className="text-xs text-slate-500">
                  Distribution des personnels
                </p>
              </div>
            </div>

            <div className="space-y-4">

              {repartitionGrade.length === 0 ? (
                <EmptyState text="Aucune donnée disponible." />
              ) : (
                repartitionGrade.map((item) => (
                  <div key={item.grade}>

                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        {item.grade}
                      </span>

                      <span className="text-xs text-slate-500">
                        {item.total} ({item.percentage}%)
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-700"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                ))
              )}

            </div>
          </section>

          {/* Services */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <BarChart3 className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Répartition par service
                </h2>

                <p className="text-xs text-slate-500">
                  Effectif par unité
                </p>
              </div>
            </div>

            <div className="space-y-4">

              {repartitionService.length === 0 ? (
                <EmptyState text="Aucune donnée disponible." />
              ) : (
                repartitionService.map((item) => (
                  <div key={item.service}>

                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        {item.service}
                      </span>

                      <span className="text-xs text-slate-500">
                        {item.total} ({item.percentage}%)
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-700"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                ))
              )}

            </div>
          </section>

        </div>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <Activity className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Résumé RH
              </h2>

              <p className="text-xs text-slate-500">
                Synthèse des données disponibles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <SummaryItem
              label="Effectif total"
              value={`${formatNumber(totalPersonnel)} personnes`}
            />

            <SummaryItem
              label="Personnel actif"
              value={`${formatNumber(personnelActifs)} personnes`}
            />

            <SummaryItem
              label="Formations"
              value={`${formatNumber(totalFormations)} formations`}
            />

            <SummaryItem
              label="Fins de lien"
              value={`${formatNumber(totalFinsDeLien)} dossiers`}
            />

          </div>
        </section>

      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetails && (
        <ModalOverlay onClose={() => setShowDetails(false)}>

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>
                <h2 className="font-semibold text-slate-900">
                  Détails des statistiques
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Synthèse complète des indicateurs RH
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">

              <DetailCard
                title="Effectif total"
                value={totalPersonnel}
                icon={<Users className="h-5 w-5" />}
              />

              <DetailCard
                title="Actifs"
                value={personnelActifs}
                icon={<UserCheck className="h-5 w-5" />}
              />

              <DetailCard
                title="Inactifs"
                value={personnelInactifs}
                icon={<UserMinus className="h-5 w-5" />}
              />

              <DetailCard
                title="Formations"
                value={totalFormations}
                icon={<GraduationCap className="h-5 w-5" />}
              />

              <DetailCard
                title="Personnels formés"
                value={personnelEnFormation}
                icon={<TrendingUp className="h-5 w-5" />}
              />

              <DetailCard
                title="Congés"
                value={totalConges}
                icon={<CalendarDays className="h-5 w-5" />}
              />

              <DetailCard
                title="Congés approuvés"
                value={congesApprouves}
                icon={<UserCheck className="h-5 w-5" />}
              />

              <DetailCard
                title="Fins de lien"
                value={totalFinsDeLien}
                icon={<UserMinus className="h-5 w-5" />}
              />

            </div>

            <div className="border-t border-slate-200 px-5 py-4">

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Fermer
              </button>

            </div>

          </div>

        </ModalOverlay>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatNumber(value)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          {icon}
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   MINI STAT
   ========================================================= */

function MiniStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">

      <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {title}
        </p>

        <p className="text-lg font-bold text-slate-900">
          {typeof value === "number"
            ? formatNumber(value)
            : value}
        </p>
      </div>

    </div>
  );
}

/* =========================================================
   PROGRESS STAT
   ========================================================= */

function ProgressStat({
  label,
  value,
  total,
  percentage,
}: {
  label: string;
  value: number;
  total: number;
  percentage: number;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="text-xs text-slate-500">
          {value} / {total}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-slate-800 transition-all"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />

      </div>

      <p className="mt-1 text-right text-xs text-slate-400">
        {percentage}%
      </p>

    </div>
  );
}

/* =========================================================
   SUMMARY ITEM
   ========================================================= */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   DETAIL CARD
   ========================================================= */

function DetailCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          {icon}
        </div>

        <span className="text-sm font-medium text-slate-700">
          {title}
        </span>

      </div>

      <span className="text-xl font-bold text-slate-900">
        {formatNumber(value)}
      </span>

    </div>
  );
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

/* =========================================================
   MODAL OVERLAY
   ========================================================= */

function ModalOverlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}