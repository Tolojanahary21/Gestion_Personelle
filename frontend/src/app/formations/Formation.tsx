'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import AnimatedCounter from '../../components/ui/AnimatedCounter'
import {
  Calendar,
  Eye,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import api from '../../../lib/api'

/* =========================================================
   TYPES
   ========================================================= */

export type FormationType = 'Interne' | 'Externe' | 'Certifiante'
export type FormationStatut = 'Planifiée' | 'En cours' | 'Terminée'

export interface Formation {
  id: string
  nom: string
  organisme: string
  type: FormationType
  lieu: string
  dateDebut: string
  dateFin: string
  participantsIds: string[]
  participantsNoms: string[]
  observation: string
  backendRows?: BackendTraining[]
}

interface BackendTraining {
  id_training: number
  personnel_id: number
  name: string
  training_type: string
  institution: string | null
  start_date: string | null
  end_date: string | null
  certificate: string | null
  certificate_number: string | null
  description: string | null
}

interface BackendPersonnel { id_personnel: number; last_name: string; first_names: string }

function fromBackendTrainings(rows: BackendTraining[], people: BackendPersonnel[]): Formation[] {
  const groups = new Map<string, BackendTraining[]>()
  for (const row of rows) {
    const key = JSON.stringify([row.name, row.training_type, row.institution, row.start_date, row.end_date, row.certificate, row.certificate_number, row.description])
    groups.set(key, [...(groups.get(key) ?? []), row])
  }
  return [...groups.values()].map((backendRows) => {
    const row = backendRows[0]
    let lieu = ''
    let observation = row.description ?? ''
    try {
      const details = JSON.parse(row.description ?? '') as { lieu?: string; observation?: string }
      lieu = details.lieu ?? ''
      observation = details.observation ?? ''
    } catch { /* Existing descriptions remain readable as notes. */ }
    const type: FormationType = row.training_type === 'Military'
      ? 'Interne'
      : row.training_type === 'Technical'
        ? 'Certifiante'
        : 'Externe'
    const participantIds = backendRows.map((item) => String(item.personnel_id))
    return {
      id: String(row.id_training),
      nom: row.name,
      organisme: row.institution ?? '',
      type,
      lieu,
      dateDebut: row.start_date ?? '',
      dateFin: row.end_date ?? '',
      participantsIds: participantIds,
      participantsNoms: participantIds.map((id) => {
        const person = people.find((candidate) => String(candidate.id_personnel) === id)
        return person ? `${person.last_name} ${person.first_names}` : `#${id}`
      }),
      observation,
      backendRows,
    }
  })
}

function apiErrorMessage(error: unknown): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg ?? 'Donnée invalide').join(' ')
  return 'Impossible de communiquer avec le serveur. Vérifiez la connexion puis réessayez.'
}

export interface FormationFormData {
  nom: string
  organisme: string
  type: FormationType
  lieu: string
  dateDebut: string
  dateFin: string
  participantsIds: string[]
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

const FORMATIONS_STORAGE_KEY = 'sgpnrh_formations'
const PERSONNEL_STORAGE_KEY = 'sgpnrh_personnel'

const isBrowser = () => typeof window !== 'undefined'

/* =========================================================
   DONNÉES DE DÉMONSTRATION
   ========================================================= */

const defaultFormations: Formation[] = [
  {
    id: 'formation-001',
    nom: 'Formation sécurité maritime',
    organisme: 'École Navale',
    type: 'Interne',
    lieu: 'Base Navale',
    dateDebut: '2024-02-01',
    dateFin: '2024-02-15',
    participantsIds: ['personnel-001', 'personnel-005'],
    participantsNoms: ['RAKOTO Jean', 'RAKOTOMALALA Andry'],
    observation: '',
  },
  {
    id: 'formation-002',
    nom: 'Certification navigation avancée',
    organisme: 'Institut Maritime International',
    type: 'Certifiante',
    lieu: 'Toamasina',
    dateDebut: '2024-05-10',
    dateFin: '2024-06-20',
    participantsIds: ['personnel-002'],
    participantsNoms: ['RABE Michel'],
    observation: 'Formation menant à une qualification officielle.',
  },
  {
    id: 'formation-003',
    nom: 'Gestion logistique portuaire',
    organisme: 'SPAT',
    type: 'Externe',
    lieu: 'Port de Toamasina',
    dateDebut: '2023-11-05',
    dateFin: '2023-11-09',
    participantsIds: ['personnel-004'],
    participantsNoms: ['RASOANAIVO Louis'],
    observation: '',
  },
]

const fallbackPersonnelOptions: PersonnelOption[] = [
  { id: 'personnel-001', nom: 'RAKOTO', prenom: 'Jean', matricule: 'PN-2026-001' },
  { id: 'personnel-002', nom: 'RABE', prenom: 'Michel', matricule: 'PN-2026-002' },
]

const formationTypes: FormationType[] = ['Interne', 'Externe', 'Certifiante']

/* =========================================================
   FORMULAIRE VIDE
   ========================================================= */

const emptyForm: FormationFormData = {
  nom: '',
  organisme: '',
  type: 'Interne',
  lieu: '',
  dateDebut: '',
  dateFin: '',
  participantsIds: [],
  observation: '',
}

/* =========================================================
   OUTILS STORAGE
   ========================================================= */

export function getFormationsFromStorage(): Formation[] {
  if (!isBrowser()) return defaultFormations

  try {
    const raw = localStorage.getItem(FORMATIONS_STORAGE_KEY)
    if (!raw) return defaultFormations

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultFormations

    return parsed as Formation[]
  } catch {
    return defaultFormations
  }
}

function saveFormationsToStorage(formations: Formation[]) {
  if (!isBrowser()) return
  localStorage.setItem(FORMATIONS_STORAGE_KEY, JSON.stringify(formations))
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
        id: p.id ?? '',
        nom: p.nom ?? '',
        prenom: p.prenom ?? '',
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
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

function getFormationStatut(formation: Formation): FormationStatut {
  const today = new Date().toISOString().slice(0, 10)

  if (formation.dateDebut && formation.dateDebut > today) return 'Planifiée'
  if (formation.dateFin && formation.dateFin < today) return 'Terminée'
  return 'En cours'
}

function formatDate(value: string): string {
  if (!value) return '—'

  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

const statutStyles: Record<FormationStatut, string> = {
  Planifiée: 'border-blue-200 bg-blue-50 text-blue-700',
  'En cours': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Terminée: 'border-slate-200 bg-slate-100 text-slate-600',
}

const typeStyles: Record<FormationType, string> = {
  Interne: 'border-violet-200 bg-violet-50 text-violet-700',
  Externe: 'border-amber-200 bg-amber-50 text-amber-700',
  Certifiante: 'border-blue-200 bg-blue-50 text-blue-700',
}

/* =========================================================
   PAGE FORMATIONS
   ========================================================= */

export default function Formation() {
  const [formations, setFormations] = useState<Formation[]>([])
  const [personnelOptions, setPersonnelOptions] = useState<PersonnelOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  async function loadFormations() {
    setIsLoading(true)
    try {
      const [trainingResponse, peopleResponse] = await Promise.all([
        api.get<BackendTraining[]>('/trainings/'),
        api.get<BackendPersonnel[]>('/personnel/'),
      ])
      const people = peopleResponse.data
      setPersonnelOptions(people.map((person) => ({
        id: String(person.id_personnel), nom: person.last_name, prenom: person.first_names, matricule: '',
      })))
      setFormations(fromBackendTrainings(trainingResponse.data, people))
      setApiError('')
    } catch (error) {
      setApiError(apiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => { void loadFormations() })
    return () => cancelAnimationFrame(frame)
  }, [])

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'Tous' | FormationType>('Tous')
  const [statutFilter, setStatutFilter] = useState<'Tous' | FormationStatut>(
    'Tous',
  )

  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'view' | 'edit'>('create')
  const [form, setForm] = useState<FormationFormData>(emptyForm)
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null,
  )
  const [showDelete, setShowDelete] = useState(false)

  /* =======================================================
     SAUVEGARDE
     ======================================================= */

  /* =======================================================
     STATISTIQUES
     ======================================================= */

  const withStatut = useMemo(
    () =>
      formations.map((formation) => ({
        ...formation,
        statutCalcule: getFormationStatut(formation),
      })),
    [formations],
  )

  const totalFormations = formations.length
  const totalEnCours = withStatut.filter(
    (f) => f.statutCalcule === 'En cours',
  ).length
  const totalPlanifiees = withStatut.filter(
    (f) => f.statutCalcule === 'Planifiée',
  ).length
  const totalParticipants = useMemo(() => {
    const uniqueIds = new Set<string>()
    formations.forEach((formation) =>
      formation.participantsIds.forEach((id) => uniqueIds.add(id)),
    )
    return uniqueIds.size
  }, [formations])

  /* =======================================================
     RECHERCHE / FILTRE
     ======================================================= */

  const filteredFormations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return withStatut
      .filter((formation) => {
        const matchesSearch =
          !normalizedSearch ||
          formation.nom.toLowerCase().includes(normalizedSearch) ||
          formation.organisme.toLowerCase().includes(normalizedSearch) ||
          formation.lieu.toLowerCase().includes(normalizedSearch) ||
          formation.participantsNoms.some((nom) =>
            nom.toLowerCase().includes(normalizedSearch),
          )

        const matchesType = typeFilter === 'Tous' || formation.type === typeFilter

        const matchesStatut =
          statutFilter === 'Tous' || formation.statutCalcule === statutFilter

        return matchesSearch && matchesType && matchesStatut
      })
      .sort((a, b) => (b.dateDebut || '').localeCompare(a.dateDebut || ''))
  }, [withStatut, search, typeFilter, statutFilter])

  /* =======================================================
     AJOUTER
     ======================================================= */

  function openCreate() {
    setFormMode('create')
    setForm({ ...emptyForm })
    setSelectedFormation(null)
    setShowForm(true)
  }

  /* =======================================================
     VOIR
     ======================================================= */

  function openView(formation: Formation) {
    setSelectedFormation(formation)
    setFormMode('view')
    setForm({
      nom: formation.nom,
      organisme: formation.organisme,
      type: formation.type,
      lieu: formation.lieu,
      dateDebut: formation.dateDebut,
      dateFin: formation.dateFin,
      participantsIds: formation.participantsIds,
      observation: formation.observation,
    })
    setShowForm(true)
  }

  /* =======================================================
     MODIFIER
     ======================================================= */

  function openEdit(formation: Formation) {
    setSelectedFormation(formation)
    setFormMode('edit')
    setForm({
      nom: formation.nom,
      organisme: formation.organisme,
      type: formation.type,
      lieu: formation.lieu,
      dateDebut: formation.dateDebut,
      dateFin: formation.dateFin,
      participantsIds: formation.participantsIds,
      observation: formation.observation,
    })
    setShowForm(true)
  }

  /* =======================================================
     FERMER FORMULAIRE
     ======================================================= */

  function closeForm() {
    setShowForm(false)
    setSelectedFormation(null)
  }

  /* =======================================================
     MODIFICATION FORMULAIRE
     ======================================================= */

  function updateForm(
    field: keyof Omit<FormationFormData, 'participantsIds'>,
    value: string,
  ) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function toggleParticipant(personnelId: string) {
    setForm((previous) => {
      const alreadySelected = previous.participantsIds.includes(personnelId)

      return {
        ...previous,
        participantsIds: alreadySelected
          ? previous.participantsIds.filter((id) => id !== personnelId)
          : [...previous.participantsIds, personnelId],
      }
    })
  }

  /* =======================================================
     SAUVEGARDE FORMULAIRE
     ======================================================= */

  async function saveFormation() {
    if (!form.nom.trim() || !form.participantsIds.length) {
      setApiError('Le nom et au moins un participant sont obligatoires.')
      return
    }
    setApiError('')
    const payloadBase = {
      name: form.nom.trim(),
      training_type: form.type === 'Interne' ? 'Military' : form.type === 'Certifiante' ? 'Technical' : 'Other',
      institution: form.organisme.trim() || null,
      start_date: form.dateDebut || null,
      end_date: form.dateFin || null,
      certificate: null,
      certificate_number: null,
      description: JSON.stringify({ lieu: form.lieu.trim(), observation: form.observation.trim() }),
    }
    try {
      const existingRows = selectedFormation?.backendRows ?? []
      const existingByPerson = new Map(existingRows.map((row) => [String(row.personnel_id), row]))
      for (const personnelId of form.participantsIds) {
        const existing = existingByPerson.get(personnelId)
        const payload = { ...payloadBase, personnel_id: Number(personnelId) }
        if (formMode === 'edit' && existing) {
          await api.put(`/trainings/${existing.id_training}`, payload)
          existingByPerson.delete(personnelId)
        } else {
          await api.post('/trainings/', payload)
        }
      }
      for (const removed of existingByPerson.values()) {
        await api.delete(`/trainings/${removed.id_training}`)
      }
      await loadFormations()
      closeForm()
    } catch (error) {
      setApiError(apiErrorMessage(error))
    }
  }

  /* =======================================================
     SUPPRESSION
     ======================================================= */

  function openDelete(formation: Formation) {
    setSelectedFormation(formation)
    setShowDelete(true)
  }

  function closeDelete() {
    setShowDelete(false)
    setSelectedFormation(null)
  }

  async function confirmDelete() {
    if (!selectedFormation) return
    setApiError('')
    try {
      for (const row of selectedFormation.backendRows ?? []) {
        await api.delete(`/trainings/${row.id_training}`)
      }
      await loadFormations()
      closeDelete()
    } catch (error) {
      setApiError(apiErrorMessage(error))
    }
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
              <GraduationCap size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Formations</h1>
              <p className="mt-1 text-sm text-slate-500">
                Suivi des formations suivies par le personnel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Nouvelle formation
          </button>
        </div>

        {apiError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div>}
        {isLoading && <p className="mb-4 text-sm text-slate-500">Chargement des formations…</p>}

        {/* STATISTIQUES */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total formations"
            value={totalFormations}
            description="Enregistrées au total"
            icon={<GraduationCap size={21} />}
          />
          <StatCard
            title="En cours"
            value={totalEnCours}
            description="Formations actives"
            icon={<Calendar size={21} />}
          />
          <StatCard
            title="Planifiées"
            value={totalPlanifiees}
            description="À venir"
            icon={<Calendar size={21} />}
          />
          <StatCard
            title="Participants formés"
            value={totalParticipants}
            description="Personnels distincts"
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par nom, organisme, lieu, participant..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as 'Tous' | FormationType)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Tous">Tous les types</option>
              {formationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={statutFilter}
              onChange={(event) =>
                setStatutFilter(event.target.value as 'Tous' | FormationStatut)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Planifiée">Planifiée</option>
              <option value="En cours">En cours</option>
              <option value="Terminée">Terminée</option>
            </select>
          </div>
        </div>

        {/* LISTE DES FORMATIONS */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Liste des formations
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredFormations.length} formation(s) affichée(s)
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {totalFormations} enregistrée(s)
            </div>
          </div>

          {filteredFormations.length === 0 ? (
            <EmptyState
              title="Aucune formation trouvée"
              description="Aucune formation ne correspond aux critères de recherche."
              icon={<GraduationCap size={30} />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Formation
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Organisme
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Période
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Participants
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
                  {filteredFormations.map((formation) => (
                    <tr
                      key={formation.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <GraduationCap size={16} />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {formation.nom}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {formation.organisme || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${typeStyles[formation.type]}`}
                        >
                          {formation.type}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span>{formatDate(formation.dateDebut)}</span>
                          <span className="text-slate-400">→</span>
                          <span>{formatDate(formation.dateFin)}</span>
                        </div>
                        {formation.lieu && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                            <MapPin size={11} />
                            {formation.lieu}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="block max-w-[200px] truncate text-sm text-slate-600"
                          title={formation.participantsNoms.join(', ')}
                        >
                          {formation.participantsNoms.length > 0
                            ? formation.participantsNoms.join(', ')
                            : '—'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formation.participantsIds.length} participant(s)
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statutStyles[formation.statutCalcule]}`}
                        >
                          {formation.statutCalcule}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openView(formation)}
                            title="Voir les détails"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(formation)}
                            title="Modifier"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(formation)}
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

      <FormationFormModal
        open={showForm}
        mode={formMode}
        form={form}
        personnelOptions={personnelOptions}
        onClose={closeForm}
        onChange={updateForm}
        onToggleParticipant={toggleParticipant}
        onSubmit={saveFormation}
      />

      {showDelete && (
        <DeleteFormationModal
          formation={selectedFormation}
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
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900"><AnimatedCounter value={value} /></p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
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
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  )
}

/* =========================================================
   MODALE FORMULAIRE
   ========================================================= */

function FormationFormModal({
  open,
  mode,
  form,
  personnelOptions,
  onClose,
  onChange,
  onToggleParticipant,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'view' | 'edit'
  form: FormationFormData
  personnelOptions: PersonnelOption[]
  onClose: () => void
  onChange: (
    field: keyof Omit<FormationFormData, 'participantsIds'>,
    value: string,
  ) => void
  onToggleParticipant: (personnelId: string) => void
  onSubmit: () => void
}) {
  if (!open) return null

  const readOnly = mode === 'view'
  const title =
    mode === 'create'
      ? 'Nouvelle formation'
      : mode === 'edit'
        ? 'Modifier la formation'
        : 'Consulter la formation'

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Détails de la formation et de ses participants.
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

        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field
                label="Nom de la formation"
                value={form.nom}
                placeholder="Ex. Formation sécurité maritime"
                readOnly={readOnly}
                onChange={(value) => onChange('nom', value)}
              />
            </div>

            <Field
              label="Organisme"
              value={form.organisme}
              placeholder="Ex. École Navale"
              readOnly={readOnly}
              onChange={(value) => onChange('organisme', value)}
            />

            <SelectField
              label="Type"
              value={form.type}
              options={formationTypes}
              readOnly={readOnly}
              onChange={(value) => onChange('type', value)}
            />

            <Field
              label="Lieu"
              value={form.lieu}
              placeholder="Ex. Base Navale"
              readOnly={readOnly}
              onChange={(value) => onChange('lieu', value)}
            />

            <Field
              label="Date de début"
              value={form.dateDebut}
              readOnly={readOnly}
              type="date"
              onChange={(value) => onChange('dateDebut', value)}
            />

            <Field
              label="Date de fin"
              value={form.dateFin}
              readOnly={readOnly}
              type="date"
              onChange={(value) => onChange('dateFin', value)}
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Participants
              </label>

              {personnelOptions.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Aucun personnel enregistré.
                </p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                  {personnelOptions.map((person) => {
                    const checked = form.participantsIds.includes(person.id)

                    return (
                      <label
                        key={person.id}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                          readOnly
                            ? 'cursor-default'
                            : 'cursor-pointer hover:bg-slate-50'
                        } ${checked ? 'bg-blue-50' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={readOnly}
                          onChange={() => onToggleParticipant(person.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-slate-800">
                          {person.nom} {person.prenom}
                        </span>
                        <span className="ml-auto text-xs text-slate-400">
                          {person.matricule}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Observation
              </label>
              <textarea
                value={form.observation}
                readOnly={readOnly}
                onChange={(event) => onChange('observation', event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
          readOnly
            ? 'border-slate-200 bg-slate-100 text-slate-600'
            : 'border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
        }`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
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

function DeleteFormationModal({
  formation,
  onClose,
  onConfirm,
}: {
  formation: Formation | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!formation) return null

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Trash2 size={22} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Supprimer cette formation ?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Vous êtes sur le point de supprimer la formation{' '}
          <strong className="text-slate-700">{formation.nom}</strong>.
        </p>

        {formation.participantsNoms.length > 0 && (
          <p className="mt-2 text-sm leading-6 text-red-600">
            Cette formation compte {formation.participantsNoms.length}{' '}
            participant(s) qui perdront la trace de cette formation.
          </p>
        )}

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

