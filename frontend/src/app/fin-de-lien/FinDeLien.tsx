 
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import api from '../../../lib/api'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
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

export type FinDeLienType =
  | 'Démission'
  | 'Retraite'
  | 'Licenciement'
  | 'Fin de contrat'
  | 'Décès'
  | 'Mutation'
  | 'Autre'

export type FinDeLienStatut =
  | 'En préparation'
  | 'Validée'
  | 'Terminée'
  | 'Annulée'

export interface FinDeLien {
  id: string
  personnelId: string
  personnelNom: string
  matricule: string
  type: FinDeLienType
  dateFin: string
  dateNotification: string
  motif: string
  lieu: string
  statut: FinDeLienStatut
  observation: string
}

export interface FinDeLienFormData {
  personnelId: string
  type: FinDeLienType
  dateFin: string
  dateNotification: string
  motif: string
  lieu: string
  statut: FinDeLienStatut
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

const FIN_DE_LIEN_STORAGE_KEY = 'sgpnrh_fin_de_lien'

const isBrowser = () => typeof window !== 'undefined'

const finDeLienTypes: FinDeLienType[] = [
  'Démission',
  'Retraite',
  'Licenciement',
  'Fin de contrat',
  'Décès',
  'Mutation',
  'Autre',
]

const finDeLienStatuts: FinDeLienStatut[] = [
  'En préparation',
  'Validée',
  'Terminée',
  'Annulée',
]

/* =========================================================
   FORMULAIRE VIDE
   ========================================================= */

const emptyForm: FinDeLienFormData = {
  personnelId: '',
  type: 'Démission',
  dateFin: '',
  dateNotification: '',
  motif: '',
  lieu: '',
  statut: 'En préparation',
  observation: '',
}

/* =========================================================
   OUTILS STORAGE
   ========================================================= */

export function getFinDeLiensFromStorage(): FinDeLien[] {
  if (!isBrowser()) return []

  try {
    const raw = localStorage.getItem(FIN_DE_LIEN_STORAGE_KEY)

    if (!raw) return []

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) return []

    return parsed as FinDeLien[]
  } catch {
    return []
  }
}

function saveFinDeLiensToStorage(finDeLiens: FinDeLien[]) {
  if (!isBrowser()) return

  localStorage.setItem(
    FIN_DE_LIEN_STORAGE_KEY,
    JSON.stringify(finDeLiens),
  )
}

/* =========================================================
   UTILITAIRES
   ========================================================= */

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`
}

function formatDate(value: string): string {
  if (!value) return '—'

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
  } catch {
    return value
  }
}

const statutStyles: Record<FinDeLienStatut, string> = {
  'En préparation':
    'border-amber-200 bg-amber-50 text-amber-700',
  Validée:
    'border-blue-200 bg-blue-50 text-blue-700',
  Terminée:
    'border-emerald-200 bg-emerald-50 text-emerald-700',
  Annulée:
    'border-red-200 bg-red-50 text-red-700',
}

const typeStyles: Record<FinDeLienType, string> = {
  Démission:
    'border-orange-200 bg-orange-50 text-orange-700',
  Retraite:
    'border-violet-200 bg-violet-50 text-violet-700',
  Licenciement:
    'border-red-200 bg-red-50 text-red-700',
  'Fin de contrat':
    'border-amber-200 bg-amber-50 text-amber-700',
  Décès:
    'border-slate-300 bg-slate-100 text-slate-700',
  Mutation:
    'border-blue-200 bg-blue-50 text-blue-700',
  Autre:
    'border-slate-200 bg-slate-100 text-slate-600',
}

/* =========================================================
   PAGE FIN DE LIEN
   ========================================================= */

export default function FinDeLien() {
  const [finDeLiens, setFinDeLiens] = useState<FinDeLien[]>([])

  const [personnelOptions, setPersonnelOptions] = useState<PersonnelOption[]>([])
  const [personnelLoadError, setPersonnelLoadError] = useState('')
  const [loadingPersonnel, setLoadingPersonnel] = useState(true)

  const [search, setSearch] = useState('')

  const [typeFilter, setTypeFilter] = useState<
    'Tous' | FinDeLienType
  >('Tous')

  const [statutFilter, setStatutFilter] = useState<
    'Tous' | FinDeLienStatut
  >('Tous')

  const [showForm, setShowForm] = useState(false)

  const [formMode, setFormMode] = useState<
    'create' | 'view' | 'edit'
  >('create')

  const [form, setForm] =
    useState<FinDeLienFormData>(emptyForm)

  const [selectedFinDeLien, setSelectedFinDeLien] =
    useState<FinDeLien | null>(null)

  const [showDelete, setShowDelete] = useState(false)

  /* =======================================================
     SAUVEGARDE
     ======================================================= */

  function persist(next: FinDeLien[]) {
    setFinDeLiens(next)
    saveFinDeLiensToStorage(next)
    window.dispatchEvent(new Event('sgpnrh-fin-de-lien-updated'))
  }

  const refreshOptions = useCallback(() => {
    setLoadingPersonnel(true)
    void Promise.allSettled([
      api.get<Array<{ id_personnel: number; last_name: string; first_names: string }>>('/personnel/'),
      api.get<Array<{ personnel_id: number; matricule: string }>>('/military-info/'),
    ]).then(([peopleResult, militaryResult]) => {
      if (peopleResult.status !== 'fulfilled' || !Array.isArray(peopleResult.value.data)) {
        setPersonnelOptions([])
        setPersonnelLoadError('Impossible de charger les personnels depuis le serveur. Vérifiez la connexion puis réessayez.')
        setLoadingPersonnel(false)
        return
      }
      const matricules = new Map(militaryResult.status === 'fulfilled' ? militaryResult.value.data.map((record) => [record.personnel_id, record.matricule]) : [])
      const actualPeople = peopleResult.value.data.map((person) => ({
        id: String(person.id_personnel),
        nom: person.last_name,
        prenom: person.first_names,
        matricule: matricules.get(person.id_personnel) ?? '',
      }))
      const personById = new Map(actualPeople.map((person) => [person.id, person]))
      setPersonnelOptions(actualPeople)
      const actualEndings = getFinDeLiensFromStorage()
        .filter((ending) => personById.has(ending.personnelId))
        .map((ending) => {
          const person = personById.get(ending.personnelId)!
          return { ...ending, personnelNom: `${person.nom} ${person.prenom}`.trim(), matricule: person.matricule }
        })
      setFinDeLiens(actualEndings)
      saveFinDeLiensToStorage(actualEndings)
      setPersonnelLoadError('')
      setLoadingPersonnel(false)
    })
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => refreshOptions())
    return () => cancelAnimationFrame(frame)
  }, [refreshOptions])

  /* =======================================================
     STATISTIQUES
     ======================================================= */

  const totalFinDeLiens = finDeLiens.length

  const totalEnPreparation = finDeLiens.filter(
    (item) => item.statut === 'En préparation',
  ).length

  const totalValidees = finDeLiens.filter(
    (item) => item.statut === 'Validée',
  ).length

  const totalTerminees = finDeLiens.filter(
    (item) => item.statut === 'Terminée',
  ).length

  /* =======================================================
     RECHERCHE / FILTRE
     ======================================================= */

  const filteredFinDeLiens = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return finDeLiens
      .filter((item) => {
        const matchesSearch =
          !normalizedSearch ||
          item.personnelNom
            .toLowerCase()
            .includes(normalizedSearch) ||
          item.matricule
            .toLowerCase()
            .includes(normalizedSearch) ||
          item.type
            .toLowerCase()
            .includes(normalizedSearch) ||
          item.motif
            .toLowerCase()
            .includes(normalizedSearch) ||
          item.lieu
            .toLowerCase()
            .includes(normalizedSearch)

        const matchesType =
          typeFilter === 'Tous' ||
          item.type === typeFilter

        const matchesStatut =
          statutFilter === 'Tous' ||
          item.statut === statutFilter

        return (
          matchesSearch &&
          matchesType &&
          matchesStatut
        )
      })
      .sort((a, b) =>
        (b.dateFin || '').localeCompare(
          a.dateFin || '',
        ),
      )
  }, [
    finDeLiens,
    search,
    typeFilter,
    statutFilter,
  ])

  /* =======================================================
     AJOUTER
     ======================================================= */

  function openCreate() {
    if (loadingPersonnel || !personnelOptions.length) return
    refreshOptions()

    setFormMode('create')
    setForm({ ...emptyForm })
    setSelectedFinDeLien(null)
    setShowForm(true)
  }

  /* =======================================================
     VOIR
     ======================================================= */

  function openView(item: FinDeLien) {
    refreshOptions()

    setSelectedFinDeLien(item)

    setFormMode('view')

    setForm({
      personnelId: item.personnelId,
      type: item.type,
      dateFin: item.dateFin,
      dateNotification: item.dateNotification,
      motif: item.motif,
      lieu: item.lieu,
      statut: item.statut,
      observation: item.observation,
    })

    setShowForm(true)
  }

  /* =======================================================
     MODIFIER
     ======================================================= */

  function openEdit(item: FinDeLien) {
    refreshOptions()

    setSelectedFinDeLien(item)

    setFormMode('edit')

    setForm({
      personnelId: item.personnelId,
      type: item.type,
      dateFin: item.dateFin,
      dateNotification: item.dateNotification,
      motif: item.motif,
      lieu: item.lieu,
      statut: item.statut,
      observation: item.observation,
    })

    setShowForm(true)
  }

  /* =======================================================
     FERMER FORMULAIRE
     ======================================================= */

  function closeForm() {
    setShowForm(false)
    setSelectedFinDeLien(null)
  }

  /* =======================================================
     MODIFICATION FORMULAIRE
     ======================================================= */

  function updateForm(
    field: keyof FinDeLienFormData,
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

  function saveFinDeLien() {
    if (
      !form.personnelId ||
      !form.dateFin ||
      !form.dateNotification
    ) {
      return
    }

    const personnel = personnelOptions.find(
      (person) =>
        person.id === form.personnelId,
    )

    if (!personnel) return

    const personnelNom =
      `${personnel.nom} ${personnel.prenom}`.trim()

    if (formMode === 'edit') {
      if (!selectedFinDeLien) return

      persist(
        finDeLiens.map((item) =>
          item.id === selectedFinDeLien.id
            ? {
                ...item,
                ...form,
                personnelNom,
                matricule:
                  personnel.matricule,
              }
            : item,
        ),
      )
    } else {
      const newFinDeLien: FinDeLien = {
        id: generateId('fin-lien'),
        personnelId: form.personnelId,
        personnelNom,
        matricule: personnel.matricule,
        type: form.type,
        dateFin: form.dateFin,
        dateNotification:
          form.dateNotification,
        motif: form.motif,
        lieu: form.lieu,
        statut: form.statut,
        observation: form.observation,
      }

      persist([
        ...finDeLiens,
        newFinDeLien,
      ])
    }

    closeForm()
  }

  /* =======================================================
     SUPPRESSION
     ======================================================= */

  function openDelete(item: FinDeLien) {
    setSelectedFinDeLien(item)
    setShowDelete(true)
  }

  function closeDelete() {
    setShowDelete(false)
    setSelectedFinDeLien(null)
  }

  function confirmDelete() {
    if (!selectedFinDeLien) return

    persist(
      finDeLiens.filter(
        (item) =>
          item.id !== selectedFinDeLien.id,
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
              <FileText size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Fin de lien
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Gestion des départs et fins de lien du personnel.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={loadingPersonnel || personnelOptions.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            {loadingPersonnel ? 'Chargement des personnels…' : 'Nouvelle fin de lien'}
          </button>

        </div>

        {personnelLoadError && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle size={18} className="mt-0.5 shrink-0" />{personnelLoadError}</div>}

        {/* STATISTIQUES */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total"
            value={totalFinDeLiens}
            description="Fins de lien enregistrées"
            icon={<FileText size={21} />}
          />

          <StatCard
            title="En préparation"
            value={totalEnPreparation}
            description="Dossiers en préparation"
            icon={<Calendar size={21} />}
          />

          <StatCard
            title="Validées"
            value={totalValidees}
            description="Dossiers validés"
            icon={<CheckCircle2 size={21} />}
          />

          <StatCard
            title="Terminées"
            value={totalTerminees}
            description="Départs effectués"
            icon={<Users size={21} />}
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
                  event.target.value as
                    | 'Tous'
                    | FinDeLienType,
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >

              <option value="Tous">
                Tous les types
              </option>

              {finDeLienTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
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
                    | FinDeLienStatut,
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >

              <option value="Tous">
                Tous les statuts
              </option>

              {finDeLienStatuts.map(
                (statut) => (
                  <option
                    key={statut}
                    value={statut}
                  >
                    {statut}
                  </option>
                ),
              )}

            </select>

          </div>

        </div>

        {/* LISTE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div>
              <h2 className="font-bold text-slate-900">
                Liste des fins de lien
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredFinDeLiens.length}{' '}
                dossier(s) affiché(s)
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Dossiers stockés sur cet appareil · aucune synchronisation serveur disponible.
              </p>
              {personnelLoadError && <p role="alert" className="mt-1 text-xs text-red-600">{personnelLoadError}</p>}
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {totalFinDeLiens} enregistré(s)
            </div>

          </div>

          {filteredFinDeLiens.length === 0 ? (

            <EmptyState
              title={personnelLoadError ? 'Données indisponibles' : finDeLiens.length === 0 ? 'Aucune donnée' : 'Aucune fin de lien trouvée'}
              description={personnelLoadError ? personnelLoadError : finDeLiens.length === 0 ? 'Aucun dossier de fin de lien enregistré.' : 'Aucun dossier ne correspond aux critères de recherche.'}
              icon={<FileText size={30} />}
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
                      Date de fin
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Motif
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Lieu
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

                  {filteredFinDeLiens.map(
                    (item) => (

                      <tr
                        key={item.id}
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
                                {item.personnelNom}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {item.matricule ||
                                  'Sans matricule'}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* TYPE */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${typeStyles[item.type]}`}
                          >
                            {item.type}
                          </span>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-1.5 text-sm text-slate-700">

                            <Calendar size={15} />

                            <span>
                              {formatDate(
                                item.dateFin,
                              )}
                            </span>

                          </div>

                          <p className="mt-1 text-[11px] text-slate-400">
                            Notification :{' '}
                            {formatDate(
                              item.dateNotification,
                            )}
                          </p>

                        </td>

                        {/* MOTIF */}

                        <td className="px-5 py-4">

                          <span
                            className="block max-w-[220px] truncate text-sm text-slate-600"
                            title={item.motif}
                          >
                            {item.motif || '—'}
                          </span>

                        </td>

                        {/* LIEU */}

                        <td className="px-5 py-4">

                          {item.lieu ? (

                            <div className="flex items-center gap-1.5 text-sm text-slate-600">

                              <MapPin size={14} />

                              {item.lieu}

                            </div>

                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}

                        </td>

                        {/* STATUT */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statutStyles[item.statut]}`}
                          >
                            {item.statut}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-1.5">

                            <button
                              type="button"
                              onClick={() =>
                                openView(item)
                              }
                              title="Voir les détails"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(item)
                              }
                              title="Modifier"
                              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDelete(item)
                              }
                              title="Supprimer"
                              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ),
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* FORMULAIRE */}

      <FinDeLienFormModal
        open={showForm}
        mode={formMode}
        form={form}
        personnelOptions={personnelOptions}
        onClose={closeForm}
        onChange={updateForm}
        onSubmit={saveFinDeLien}
      />

      {/* SUPPRESSION */}

      {showDelete && (
        <DeleteFinDeLienModal
          item={selectedFinDeLien}
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

function FinDeLienFormModal({
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
  form: FinDeLienFormData
  personnelOptions: PersonnelOption[]
  onClose: () => void
  onChange: (
    field: keyof FinDeLienFormData,
    value: string,
  ) => void
  onSubmit: () => void
}) {
  if (!open) return null

  const readOnly = mode === 'view'

  const title =
    mode === 'create'
      ? 'Nouvelle fin de lien'
      : mode === 'edit'
        ? 'Modifier la fin de lien'
        : 'Consulter la fin de lien'

  const selectedPersonnel =
    personnelOptions.find(
      (person) =>
        person.id === form.personnelId,
    )

  return (
    <ModalOverlay onClose={onClose}>

      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Informations relatives au départ du personnel.
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

                {personnelOptions.map(
                  (person) => (
                    <option
                      key={person.id}
                      value={person.id}
                    >
                      {person.nom}{' '}
                      {person.prenom} —{' '}
                      {person.matricule}
                    </option>
                  ),
                )}

              </select>

              {selectedPersonnel && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Matricule :{' '}
                  {selectedPersonnel.matricule}
                </p>
              )}

            </div>

            {/* TYPE */}

            <SelectField
              label="Type de fin de lien"
              value={form.type}
              options={finDeLienTypes}
              readOnly={readOnly}
              onChange={(value) =>
                onChange('type', value)
              }
            />

            {/* STATUT */}

            <SelectField
              label="Statut"
              value={form.statut}
              options={finDeLienStatuts}
              readOnly={readOnly}
              onChange={(value) =>
                onChange('statut', value)
              }
            />

            {/* DATE FIN */}

            <Field
              label="Date de fin de lien"
              value={form.dateFin}
              readOnly={readOnly}
              type="date"
              onChange={(value) =>
                onChange('dateFin', value)
              }
            />

            {/* DATE NOTIFICATION */}

            <Field
              label="Date de notification"
              value={form.dateNotification}
              readOnly={readOnly}
              type="date"
              onChange={(value) =>
                onChange(
                  'dateNotification',
                  value,
                )
              }
            />

            {/* MOTIF */}

            <div className="md:col-span-2">

              <Field
                label="Motif"
                value={form.motif}
                placeholder="Ex. Départ à la retraite"
                readOnly={readOnly}
                onChange={(value) =>
                  onChange('motif', value)
                }
              />

            </div>

            {/* LIEU */}

            <Field
              label="Lieu / Destination"
              value={form.lieu}
              placeholder="Ex. Toamasina"
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
                rows={4}
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

function DeleteFinDeLienModal({
  item,
  onClose,
  onConfirm,
}: {
  item: FinDeLien | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!item) return null

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
          Supprimer cette fin de lien ?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Vous êtes sur le point de supprimer le dossier de fin de lien de{' '}
          <strong className="text-slate-700">
            {item.personnelNom}
          </strong>.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

          <div className="flex items-center justify-between text-sm">

            <span className="text-slate-500">
              Type
            </span>

            <span className="font-semibold text-slate-700">
              {item.type}
            </span>

          </div>

          <div className="mt-2 flex items-center justify-between text-sm">

            <span className="text-slate-500">
              Date de fin
            </span>

            <span className="font-semibold text-slate-700">
              {formatDate(item.dateFin)}
            </span>

          </div>

          <div className="mt-2 flex items-center justify-between text-sm">

            <span className="text-slate-500">
              Statut
            </span>

            <span className="font-semibold text-slate-700">
              {item.statut}
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
 
