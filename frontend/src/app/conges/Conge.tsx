
'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'

/* =========================================================
   TYPES
   ========================================================= */

export type CongeType =
  | 'Annuel'
  | 'Maladie'
  | 'Exceptionnel'
  | 'Maternité'
  | 'Autre'

export type CongeStatut =
  | 'En attente'
  | 'Approuvé'
  | 'Refusé'
  | 'En cours'
  | 'Terminé'

export interface Conge {
  id: string
  personnelId: string
  personnelNom: string
  matricule: string
  type: CongeType
  dateDebut: string
  dateFin: string
  nombreJours: number
  motif: string
  lieu: string
  statut: CongeStatut
  observation: string
}

export interface CongeFormData {
  personnelId: string
  type: CongeType
  dateDebut: string
  dateFin: string
  motif: string
  lieu: string
  statut: CongeStatut
  observation: string
}

interface PersonnelOption {
  id: string
  nom: string
  prenom: string
  matricule: string
}

/* =========================================================
   STORAGE
   ========================================================= */

const CONGES_STORAGE_KEY = 'sgpnrh_conges'
const PERSONNEL_STORAGE_KEY = 'sgpnrh_personnel'

const isBrowser = () => typeof window !== 'undefined'

/* =========================================================
   DONNÉES DE DÉMONSTRATION
   ========================================================= */

const defaultConges: Conge[] = [
  {
    id: 'conge-001',
    personnelId: 'personnel-001',
    personnelNom: 'RAKOTO Jean',
    matricule: 'PN-2026-001',
    type: 'Annuel',
    dateDebut: '2026-09-01',
    dateFin: '2026-09-10',
    nombreJours: 10,
    motif: 'Congé annuel',
    lieu: 'Antananarivo',
    statut: 'Approuvé',
    observation: '',
  },
  {
    id: 'conge-002',
    personnelId: 'personnel-002',
    personnelNom: 'RABE Michel',
    matricule: 'PN-2026-002',
    type: 'Exceptionnel',
    dateDebut: '2026-09-20',
    dateFin: '2026-09-22',
    nombreJours: 3,
    motif: 'Événement familial',
    lieu: 'Toamasina',
    statut: 'En cours',
    observation: 'Autorisation exceptionnelle accordée.',
  },
  {
    id: 'conge-003',
    personnelId: 'personnel-004',
    personnelNom: 'RASOANAIVO Louis',
    matricule: 'PN-2026-004',
    type: 'Maladie',
    dateDebut: '2026-08-05',
    dateFin: '2026-08-12',
    nombreJours: 8,
    motif: 'Arrêt maladie',
    lieu: '',
    statut: 'Terminé',
    observation: '',
  },
  {
    id: 'conge-004',
    personnelId: 'personnel-005',
    personnelNom: 'RAKOTOMALALA Andry',
    matricule: 'PN-2026-005',
    type: 'Annuel',
    dateDebut: '2026-10-10',
    dateFin: '2026-10-20',
    nombreJours: 11,
    motif: 'Congé annuel',
    lieu: 'Fianarantsoa',
    statut: 'En attente',
    observation: '',
  },
]

const fallbackPersonnelOptions: PersonnelOption[] = [
  {
    id: 'personnel-001',
    nom: 'RAKOTO',
    prenom: 'Jean',
    matricule: 'PN-2026-001',
  },
  {
    id: 'personnel-002',
    nom: 'RABE',
    prenom: 'Michel',
    matricule: 'PN-2026-002',
  },
]

const congeTypes: CongeType[] = [
  'Annuel',
  'Maladie',
  'Exceptionnel',
  'Maternité',
  'Autre',
]

const congeStatuts: CongeStatut[] = [
  'En attente',
  'Approuvé',
  'Refusé',
  'En cours',
  'Terminé',
]

/* =========================================================
   FORMULAIRE VIDE
   ========================================================= */

const emptyForm: CongeFormData = {
  personnelId: '',
  type: 'Annuel',
  dateDebut: '',
  dateFin: '',
  motif: '',
  lieu: '',
  statut: 'En attente',
  observation: '',
}

/* =========================================================
   OUTILS STORAGE
   ========================================================= */

export function getCongesFromStorage(): Conge[] {
  if (!isBrowser()) return defaultConges

  try {
    const raw = localStorage.getItem(CONGES_STORAGE_KEY)

    if (!raw) return defaultConges

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) return defaultConges

    return parsed as Conge[]
  } catch {
    return defaultConges
  }
}

function saveCongesToStorage(conges: Conge[]) {
  if (!isBrowser()) return

  localStorage.setItem(CONGES_STORAGE_KEY, JSON.stringify(conges))
}

function getPersonnelOptions(): PersonnelOption[] {
  if (!isBrowser()) return fallbackPersonnelOptions

  try {
    const raw = localStorage.getItem(PERSONNEL_STORAGE_KEY)

    if (!raw) return fallbackPersonnelOptions

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) return fallbackPersonnelOptions

    return parsed
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({
        id: p.id ?? p.id_personnel ?? '',
        nom: p.nom ?? p.last_name ?? '',
        prenom: p.prenom ?? p.first_names ?? '',
        matricule: p.matricule ?? '',
      }))
      .filter((p) => p.id)
  } catch {
    return fallbackPersonnelOptions
  }
}

/* =========================================================
   UTILITAIRES
   ========================================================= */

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`
}

function calculateDays(dateDebut: string, dateFin: string): number {
  if (!dateDebut || !dateFin) return 0

  const start = new Date(`${dateDebut}T00:00:00`)
  const end = new Date(`${dateFin}T00:00:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0
  }

  const difference = end.getTime() - start.getTime()

  if (difference < 0) return 0

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1
}

function formatDate(value: string): string {
  if (!value) return '—'

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

const statutStyles: Record<CongeStatut, string> = {
  'En attente': 'border-amber-200 bg-amber-50 text-amber-700',
  Approuvé: 'border-blue-200 bg-blue-50 text-blue-700',
  Refusé: 'border-red-200 bg-red-50 text-red-700',
  'En cours': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Terminé: 'border-slate-200 bg-slate-100 text-slate-600',
}

const typeStyles: Record<CongeType, string> = {
  Annuel: 'border-blue-200 bg-blue-50 text-blue-700',
  Maladie: 'border-red-200 bg-red-50 text-red-700',
  Exceptionnel: 'border-violet-200 bg-violet-50 text-violet-700',
  Maternité: 'border-pink-200 bg-pink-50 text-pink-700',
  Autre: 'border-slate-200 bg-slate-100 text-slate-600',
}

/* =========================================================
   PAGE CONGÉS
   ========================================================= */

export default function Conge() {
  const [conges, setConges] = useState<Conge[]>(() =>
    getCongesFromStorage(),
  )

  const [personnelOptions, setPersonnelOptions] = useState<PersonnelOption[]>(
    () => getPersonnelOptions(),
  )

  const [search, setSearch] = useState('')

  const [typeFilter, setTypeFilter] = useState<
    'Tous' | CongeType
  >('Tous')

  const [statutFilter, setStatutFilter] = useState<
    'Tous' | CongeStatut
  >('Tous')

  const [showForm, setShowForm] = useState(false)

  const [formMode, setFormMode] = useState<
    'create' | 'view' | 'edit'
  >('create')

  const [form, setForm] = useState<CongeFormData>(emptyForm)

  const [selectedConge, setSelectedConge] = useState<Conge | null>(null)

  const [showDelete, setShowDelete] = useState(false)

  /* =======================================================
     SAUVEGARDE
     ======================================================= */

  function persist(next: Conge[]) {
    setConges(next)
    saveCongesToStorage(next)
  }

  function refreshOptions() {
    setPersonnelOptions(getPersonnelOptions())
  }

  /* =======================================================
     STATISTIQUES
     ======================================================= */

  const totalConges = conges.length

  const totalEnAttente = conges.filter(
    (conge) => conge.statut === 'En attente',
  ).length

  const totalEnCours = conges.filter(
    (conge) => conge.statut === 'En cours',
  ).length

  const totalApprouves = conges.filter(
    (conge) => conge.statut === 'Approuvé',
  ).length

  const totalJours = useMemo(
    () =>
      conges.reduce(
        (total, conge) => total + (conge.nombreJours || 0),
        0,
      ),
    [conges],
  )

  /* =======================================================
     RECHERCHE / FILTRE
     ======================================================= */

  const filteredConges = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return conges
      .filter((conge) => {
        const matchesSearch =
          !normalizedSearch ||
          conge.personnelNom.toLowerCase().includes(normalizedSearch) ||
          conge.matricule.toLowerCase().includes(normalizedSearch) ||
          conge.type.toLowerCase().includes(normalizedSearch) ||
          conge.motif.toLowerCase().includes(normalizedSearch) ||
          conge.lieu.toLowerCase().includes(normalizedSearch)

        const matchesType =
          typeFilter === 'Tous' || conge.type === typeFilter

        const matchesStatut =
          statutFilter === 'Tous' ||
          conge.statut === statutFilter

        return matchesSearch && matchesType && matchesStatut
      })
      .sort((a, b) =>
        (b.dateDebut || '').localeCompare(a.dateDebut || ''),
      )
  }, [conges, search, typeFilter, statutFilter])

  /* =======================================================
     AJOUTER
     ======================================================= */

  function openCreate() {
    refreshOptions()

    setFormMode('create')
    setForm({ ...emptyForm })
    setSelectedConge(null)
    setShowForm(true)
  }

  /* =======================================================
     VOIR
     ======================================================= */

  function openView(conge: Conge) {
    refreshOptions()

    setSelectedConge(conge)

    setFormMode('view')

    setForm({
      personnelId: conge.personnelId,
      type: conge.type,
      dateDebut: conge.dateDebut,
      dateFin: conge.dateFin,
      motif: conge.motif,
      lieu: conge.lieu,
      statut: conge.statut,
      observation: conge.observation,
    })

    setShowForm(true)
  }

  /* =======================================================
     MODIFIER
     ======================================================= */

  function openEdit(conge: Conge) {
    refreshOptions()

    setSelectedConge(conge)

    setFormMode('edit')

    setForm({
      personnelId: conge.personnelId,
      type: conge.type,
      dateDebut: conge.dateDebut,
      dateFin: conge.dateFin,
      motif: conge.motif,
      lieu: conge.lieu,
      statut: conge.statut,
      observation: conge.observation,
    })

    setShowForm(true)
  }

  /* =======================================================
     FERMER FORMULAIRE
     ======================================================= */

  function closeForm() {
    setShowForm(false)
    setSelectedConge(null)
  }

  /* =======================================================
     MODIFICATION FORMULAIRE
     ======================================================= */

  function updateForm(
    field: keyof CongeFormData,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  /* =======================================================
     SAUVEGARDE FORMULAIRE
     ======================================================= */

  function saveConge() {
    if (
      !form.personnelId ||
      !form.dateDebut ||
      !form.dateFin
    ) {
      return
    }

    const personnel = personnelOptions.find(
      (person) => person.id === form.personnelId,
    )

    if (!personnel) return

    const nombreJours = calculateDays(
      form.dateDebut,
      form.dateFin,
    )

    if (nombreJours <= 0) return

    const personnelNom =
      `${personnel.nom} ${personnel.prenom}`.trim()

    if (formMode === 'edit') {
      if (!selectedConge) return

      persist(
        conges.map((conge) =>
          conge.id === selectedConge.id
            ? {
                ...conge,
                ...form,
                personnelNom,
                matricule: personnel.matricule,
                nombreJours,
              }
            : conge,
        ),
      )
    } else {
      const newConge: Conge = {
        id: generateId('conge'),
        personnelId: form.personnelId,
        personnelNom,
        matricule: personnel.matricule,
        type: form.type,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        nombreJours,
        motif: form.motif,
        lieu: form.lieu,
        statut: form.statut,
        observation: form.observation,
      }

      persist([...conges, newConge])
    }

    closeForm()
  }

  /* =======================================================
     SUPPRESSION
     ======================================================= */

  function openDelete(conge: Conge) {
    setSelectedConge(conge)
    setShowDelete(true)
  }

  function closeDelete() {
    setShowDelete(false)
    setSelectedConge(null)
  }

  function confirmDelete() {
    if (!selectedConge) return

    persist(
      conges.filter(
        (conge) => conge.id !== selectedConge.id,
      ),
    )

    closeDelete()
  }

  /* =======================================================
     RENDU
     ======================================================= */

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">

        {/* EN-TÊTE */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Calendar size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Congés
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Gestion et suivi des congés du personnel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Nouveau congé
          </button>
        </div>

        {/* STATISTIQUES */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total congés"
            value={totalConges}
            description="Demandes enregistrées"
            icon={<Calendar size={21} />}
          />

          <StatCard
            title="En attente"
            value={totalEnAttente}
            description="Demandes à traiter"
            icon={<Clock size={21} />}
          />

          <StatCard
            title="En cours"
            value={totalEnCours}
            description="Personnels actuellement en congé"
            icon={<Users size={21} />}
          />

          <StatCard
            title="Jours de congé"
            value={totalJours}
            description={`${totalApprouves} demande(s) approuvée(s)`}
            icon={<CheckCircle2 size={21} />}
          />
        </div>

        {/* RECHERCHE / FILTRE */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher par personnel, matricule, type, motif..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as 'Tous' | CongeType,
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Tous">
                Tous les types
              </option>

              {congeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={statutFilter}
              onChange={(event) =>
                setStatutFilter(
                  event.target.value as
                    | 'Tous'
                    | CongeStatut,
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Tous">
                Tous les statuts
              </option>

              {congeStatuts.map((statut) => (
                <option key={statut} value={statut}>
                  {statut}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTE DES CONGÉS */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Liste des congés
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredConges.length} congé(s)
                affiché(s)
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {totalConges} enregistré(s)
            </div>
          </div>

          {filteredConges.length === 0 ? (
            <EmptyState
              title="Aucun congé trouvé"
              description="Aucun congé ne correspond aux critères de recherche."
              icon={<Calendar size={30} />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full">

                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Personnel
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Période
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Durée
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Motif
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Statut
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredConges.map((conge) => (
                    <tr
                      key={conge.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* PERSONNEL */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <User size={16} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {conge.personnelNom}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {conge.matricule || 'Sans matricule'}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* TYPE */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${typeStyles[conge.type]}`}
                        >
                          {conge.type}
                        </span>
                      </td>

                      {/* PÉRIODE */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span>
                            {formatDate(conge.dateDebut)}
                          </span>

                          <span className="text-slate-400">
                            →
                          </span>

                          <span>
                            {formatDate(conge.dateFin)}
                          </span>
                        </div>

                        {conge.lieu && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                            <MapPin size={11} />
                            {conge.lieu}
                          </div>
                        )}
                      </td>

                      {/* DURÉE */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {conge.nombreJours}
                        </span>

                        <span className="ml-1 text-xs text-slate-400">
                          jour(s)
                        </span>
                      </td>

                      {/* MOTIF */}

                      <td className="px-5 py-4">
                        <span
                          className="block max-w-[220px] truncate text-sm text-slate-600"
                          title={conge.motif}
                        >
                          {conge.motif || '—'}
                        </span>
                      </td>

                      {/* STATUT */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statutStyles[conge.statut]}`}
                        >
                          {conge.statut}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">

                          <button
                            type="button"
                            onClick={() => openView(conge)}
                            title="Voir les détails"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(conge)}
                            title="Modifier"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(conge)}
                            title="Supprimer"
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODALE FORMULAIRE */}

      <CongeFormModal
        open={showForm}
        mode={formMode}
        form={form}
        personnelOptions={personnelOptions}
        onClose={closeForm}
        onChange={updateForm}
        onSubmit={saveConge}
      />

      {/* MODALE SUPPRESSION */}

      {showDelete && (
        <DeleteCongeModal
          conge={selectedConge}
          onClose={closeDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

/* =========================================================
   CARTE STATISTIQUE
   ========================================================= */

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: number
  description: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

      </div>
    </div>
  )
}

/* =========================================================
   ÉTAT VIDE
   ========================================================= */

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <h3 className="text-base font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {description}
      </p>

    </div>
  )
}

/* =========================================================
   MODALE FORMULAIRE
   ========================================================= */

function CongeFormModal({
  open,
  mode,
  form,
  personnelOptions,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'view' | 'edit'
  form: CongeFormData
  personnelOptions: PersonnelOption[]
  onClose: () => void
  onChange: (
    field: keyof CongeFormData,
    value: string,
  ) => void
  onSubmit: () => void
}) {
  if (!open) return null

  const readOnly = mode === 'view'

  const title =
    mode === 'create'
      ? 'Nouveau congé'
      : mode === 'edit'
        ? 'Modifier le congé'
        : 'Consulter le congé'

  const selectedPersonnel = personnelOptions.find(
    (person) => person.id === form.personnelId,
  )

  const nombreJours = calculateDays(
    form.dateDebut,
    form.dateFin,
  )

  return (
    <ModalOverlay onClose={onClose}>

      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >

        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Informations du congé et du personnel concerné.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

        </div>

        {/* CONTENU */}

        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">

          <div className="grid gap-5 md:grid-cols-2">

            {/* PERSONNEL */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Personnel
              </label>

              <select
                value={form.personnelId}
                disabled={readOnly}
                onChange={(event) =>
                  onChange(
                    'personnelId',
                    event.target.value,
                  )
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                  readOnly
                    ? 'border-slate-200 bg-slate-100 text-slate-600'
                    : 'border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
              >

                <option value="">
                  Sélectionner un personnel
                </option>

                {personnelOptions.map((person) => (
                  <option
                    key={person.id}
                    value={person.id}
                  >
                    {person.nom} {person.prenom} —{' '}
                    {person.matricule}
                  </option>
                ))}

              </select>

              {selectedPersonnel && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Matricule : {selectedPersonnel.matricule}
                </p>
              )}

            </div>

            {/* TYPE */}

            <SelectField
              label="Type de congé"
              value={form.type}
              options={congeTypes}
              readOnly={readOnly}
              onChange={(value) =>
                onChange('type', value)
              }
            />

            {/* STATUT */}

            <SelectField
              label="Statut"
              value={form.statut}
              options={congeStatuts}
              readOnly={readOnly}
              onChange={(value) =>
                onChange('statut', value)
              }
            />

            {/* DATE DÉBUT */}

            <Field
              label="Date de début"
              value={form.dateDebut}
              readOnly={readOnly}
              type="date"
              onChange={(value) =>
                onChange('dateDebut', value)
              }
            />

            {/* DATE FIN */}

            <Field
              label="Date de fin"
              value={form.dateFin}
              readOnly={readOnly}
              type="date"
              onChange={(value) =>
                onChange('dateFin', value)
              }
            />

            {/* DURÉE */}

            <div className="md:col-span-2">

              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Calendar size={17} />
                  Durée du congé
                </div>

                <div className="text-lg font-bold text-blue-700">
                  {nombreJours > 0
                    ? `${nombreJours} jour(s)`
                    : '—'}
                </div>

              </div>

            </div>

            {/* MOTIF */}

            <div className="md:col-span-2">

              <Field
                label="Motif"
                value={form.motif}
                placeholder="Ex. Congé annuel"
                readOnly={readOnly}
                onChange={(value) =>
                  onChange('motif', value)
                }
              />

            </div>

            {/* LIEU */}

            <Field
              label="Lieu pendant le congé"
              value={form.lieu}
              placeholder="Ex. Antananarivo"
              readOnly={readOnly}
              onChange={(value) =>
                onChange('lieu', value)
              }
            />

            {/* OBSERVATION */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Observation
              </label>

              <textarea
                value={form.observation}
                readOnly={readOnly}
                onChange={(event) =>
                  onChange(
                    'observation',
                    event.target.value,
                  )
                }
                rows={3}
                placeholder="Remarques complémentaires..."
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none ${
                  readOnly
                    ? 'border-slate-200 bg-slate-100 text-slate-600'
                    : 'border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
              />

            </div>

          </div>
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Fermer
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={onSubmit}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Enregistrer
            </button>
          )}

        </div>

      </div>

    </ModalOverlay>
  )
}

/* =========================================================
   CHAMP TEXTE
   ========================================================= */

function Field({
  label,
  value,
  placeholder,
  readOnly,
  type = 'text',
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  readOnly: boolean
  type?: 'text' | 'date'
  onChange: (value: string) => void
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
          readOnly
            ? 'border-slate-200 bg-slate-100 text-slate-600'
            : 'border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
        }`}
      />

    </div>
  )
}

/* =========================================================
   SELECT
   ========================================================= */

function SelectField({
  label,
  value,
  options,
  readOnly,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  readOnly: boolean
  onChange: (value: string) => void
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        disabled={readOnly}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
          readOnly
            ? 'border-slate-200 bg-slate-100 text-slate-600'
            : 'border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
        }`}
      >

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  )
}

/* =========================================================
   MODALE SUPPRESSION
   ========================================================= */

function DeleteCongeModal({
  conge,
  onClose,
  onConfirm,
}: {
  conge: Conge | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!conge) return null

  return (
    <ModalOverlay onClose={onClose}>

      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Trash2 size={22} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Supprimer ce congé ?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Vous êtes sur le point de supprimer le congé de{' '}
          <strong className="text-slate-700">
            {conge.personnelNom}
          </strong>.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Type
            </span>

            <span className="font-semibold text-slate-700">
              {conge.type}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Période
            </span>

            <span className="font-semibold text-slate-700">
              {formatDate(conge.dateDebut)} →{' '}
              {formatDate(conge.dateFin)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Durée
            </span>

            <span className="font-semibold text-slate-700">
              {conge.nombreJours} jour(s)
            </span>
          </div>

        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Supprimer
          </button>

        </div>

      </div>

    </ModalOverlay>
  )
}

/* =========================================================
   OVERLAY DES MODALES
   ========================================================= */

function ModalOverlay({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {children}
    </div>
  )
}
