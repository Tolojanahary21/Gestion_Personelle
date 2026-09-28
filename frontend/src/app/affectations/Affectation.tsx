'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import AnimatedCounter from '../../components/ui/AnimatedCounter'
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react'
import api from '../../../lib/api'

/* =========================================================
   TYPES
   ========================================================= */

export type AffectationStatut = 'En cours' | 'Terminée' | 'Planifiée'

export interface Affectation {
  id: string
  personnelId: string
  personnelNom: string
  unite: string
  fonction: string
  dateDebut: string
  dateFin: string
  motif: string
  observation: string
}

export interface AffectationFormData {
  personnelId: string
  unite: string
  fonction: string
  dateDebut: string
  dateFin: string
  motif: string
  observation: string
}

interface PersonnelOption {
  id: string
  nom: string
  prenom: string
  matricule: string
}

interface BackendPersonnel { id_personnel: number; last_name: string; first_names: string }
interface BackendUnit { id_unit: number; name: string }
interface BackendAssignment {
  id_assignment: number
  personnel_id: number
  assignment_type: string
  position: string
  location: string | null
  start_date: string
  end_date: string | null
  status: string
  description: string | null
}

function fromBackendAssignment(item: BackendAssignment, people: BackendPersonnel[]): Affectation {
  const person = people.find((candidate) => candidate.id_personnel === item.personnel_id)
  let motif = ''
  let observation = ''
  try {
    const details = JSON.parse(item.description ?? '') as { motif?: string; observation?: string }
    motif = details.motif ?? ''
    observation = details.observation ?? ''
  } catch {
    const [legacyMotif = '', ...legacyNotes] = (item.description ?? '').split('\n')
    motif = legacyMotif
    observation = legacyNotes.join('\n')
  }
  return {
    id: String(item.id_assignment),
    personnelId: String(item.personnel_id),
    personnelNom: person ? `${person.last_name} ${person.first_names}` : `#${item.personnel_id}`,
    unite: item.location ?? '',
    fonction: item.position,
    dateDebut: item.start_date,
    dateFin: item.end_date ?? '',
    motif,
    observation,
  }
}

function apiErrorMessage(error: unknown): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg ?? 'Donnée invalide').join(' ')
  return 'Impossible de communiquer avec le serveur. Vérifiez la connexion puis réessayez.'
}

/* =========================================================
   STORAGE
   ========================================================= */

/* =========================================================
   FORMULAIRE VIDE
   ========================================================= */

const emptyForm: AffectationFormData = {
  personnelId: '',
  unite: '',
  fonction: '',
  dateDebut: '',
  dateFin: '',
  motif: '',
  observation: '',
}

/* =========================================================
   UTILITAIRES
   ========================================================= */

function getAffectationStatut(affectation: Affectation): AffectationStatut {
  const today = new Date().toISOString().slice(0, 10)

  if (affectation.dateFin && affectation.dateFin < today) return 'Terminée'
  if (affectation.dateDebut && affectation.dateDebut > today) return 'Planifiée'
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

const statutStyles: Record<AffectationStatut, string> = {
  'En cours': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Terminée: 'border-slate-200 bg-slate-100 text-slate-600',
  Planifiée: 'border-blue-200 bg-blue-50 text-blue-700',
}

/* =========================================================
   PAGE AFFECTATIONS
   ========================================================= */

export default function Affectation() {
  const [affectations, setAffectations] = useState<Affectation[]>([])
  const [personnelOptions, setPersonnelOptions] = useState<PersonnelOption[]>([])
  const [unitOptions, setUnitOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  async function loadAffectations() {
    setIsLoading(true)
    try {
      const [assignmentResponse, peopleResponse, unitResponse] = await Promise.all([
        api.get<BackendAssignment[]>('/assignments/'),
        api.get<BackendPersonnel[]>('/personnel/'),
        api.get<BackendUnit[]>('/units'),
      ])
      setPersonnelOptions(peopleResponse.data.map((person) => ({
        id: String(person.id_personnel), nom: person.last_name, prenom: person.first_names, matricule: '',
      })))
      setUnitOptions(unitResponse.data.map((unit) => unit.name))
      setAffectations(assignmentResponse.data.map((item) => fromBackendAssignment(item, peopleResponse.data)))
      setApiError('')
    } catch (error) {
      setApiError(apiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => { void loadAffectations() })
    return () => cancelAnimationFrame(frame)
  }, [])

  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState<'Tous' | AffectationStatut>(
    'Tous',
  )

  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'view' | 'edit'>('create')
  const [form, setForm] = useState<AffectationFormData>(emptyForm)
  const [selectedAffectation, setSelectedAffectation] =
    useState<Affectation | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  /* =======================================================
     STATISTIQUES
     ======================================================= */

  const withStatut = useMemo(
    () =>
      affectations.map((affectation) => ({
        ...affectation,
        statutCalcule: getAffectationStatut(affectation),
      })),
    [affectations],
  )

  const totalAffectations = affectations.length
  const totalEnCours = withStatut.filter(
    (a) => a.statutCalcule === 'En cours',
  ).length
  const totalPlanifiees = withStatut.filter(
    (a) => a.statutCalcule === 'Planifiée',
  ).length
  const totalTerminees = withStatut.filter(
    (a) => a.statutCalcule === 'Terminée',
  ).length

  /* =======================================================
     RECHERCHE / FILTRE
     ======================================================= */

  const filteredAffectations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return withStatut
      .filter((affectation) => {
        const matchesSearch =
          !normalizedSearch ||
          affectation.personnelNom.toLowerCase().includes(normalizedSearch) ||
          affectation.unite.toLowerCase().includes(normalizedSearch) ||
          affectation.fonction.toLowerCase().includes(normalizedSearch) ||
          affectation.motif.toLowerCase().includes(normalizedSearch)

        const matchesStatut =
          statutFilter === 'Tous' || affectation.statutCalcule === statutFilter

        return matchesSearch && matchesStatut
      })
      .sort((a, b) => (b.dateDebut || '').localeCompare(a.dateDebut || ''))
  }, [withStatut, search, statutFilter])

  /* =======================================================
     AJOUTER
     ======================================================= */

  function openCreate() {
    setFormMode('create')
    setForm({ ...emptyForm })
    setSelectedAffectation(null)
    setShowForm(true)
  }

  /* =======================================================
     VOIR
     ======================================================= */

  function openView(affectation: Affectation) {
    setSelectedAffectation(affectation)
    setFormMode('view')
    setForm({
      personnelId: affectation.personnelId,
      unite: affectation.unite,
      fonction: affectation.fonction,
      dateDebut: affectation.dateDebut,
      dateFin: affectation.dateFin,
      motif: affectation.motif,
      observation: affectation.observation,
    })
    setShowForm(true)
  }

  /* =======================================================
     MODIFIER
     ======================================================= */

  function openEdit(affectation: Affectation) {
    setSelectedAffectation(affectation)
    setFormMode('edit')
    setForm({
      personnelId: affectation.personnelId,
      unite: affectation.unite,
      fonction: affectation.fonction,
      dateDebut: affectation.dateDebut,
      dateFin: affectation.dateFin,
      motif: affectation.motif,
      observation: affectation.observation,
    })
    setShowForm(true)
  }

  /* =======================================================
     FERMER FORMULAIRE
     ======================================================= */

  function closeForm() {
    setShowForm(false)
    setSelectedAffectation(null)
  }

  /* =======================================================
     MODIFICATION FORMULAIRE
     ======================================================= */

  function updateForm(field: keyof AffectationFormData, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  /* =======================================================
     SAUVEGARDE FORMULAIRE
     ======================================================= */

  async function saveAffectation() {
    if (!form.personnelId || !form.unite.trim() || !form.dateDebut || !form.fonction.trim()) {
      setApiError('Personnel, unité, fonction et date de début sont obligatoires.')
      return
    }
    setApiError('')
    const today = new Date().toISOString().slice(0, 10)
    const assignmentType = /mission/i.test(form.motif) ? 'Mission' : /formation/i.test(form.motif) ? 'Training' : 'Permanent'
    const payload = {
      personnel_id: Number(form.personnelId),
      assignment_type: assignmentType,
      position: form.fonction.trim(),
      location: form.unite.trim(),
      start_date: form.dateDebut,
      end_date: form.dateFin || null,
      status: form.dateFin && form.dateFin < today ? 'Completed' : form.dateDebut > today ? 'Planned' : 'Active',
      description: JSON.stringify({ motif: form.motif.trim(), observation: form.observation.trim() }),
    }
    try {
      if (formMode === 'edit' && selectedAffectation) await api.put(`/assignments/${selectedAffectation.id}`, payload)
      else await api.post('/assignments/', payload)
      await loadAffectations()
      closeForm()
    } catch (error) {
      setApiError(apiErrorMessage(error))
    }
  }

  /* =======================================================
     SUPPRESSION
     ======================================================= */

  function openDelete(affectation: Affectation) {
    setSelectedAffectation(affectation)
    setShowDelete(true)
  }

  function closeDelete() {
    setShowDelete(false)
    setSelectedAffectation(null)
  }

  async function confirmDelete() {
    if (!selectedAffectation) return
    setApiError('')
    try {
      await api.delete(`/assignments/${selectedAffectation.id}`)
      await loadAffectations()
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
              <ClipboardList size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Affectations
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Suivi des affectations du personnel aux unités navales.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Nouvelle affectation
          </button>
        </div>

        {apiError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div>}
        {isLoading && <p className="mb-4 text-sm text-slate-500">Chargement des affectations…</p>}

        {/* STATISTIQUES */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total affectations"
            value={totalAffectations}
            description="Enregistrées au total"
            icon={<ClipboardList size={21} />}
          />
          <StatCard
            title="En cours"
            value={totalEnCours}
            description="Affectations actives"
            icon={<User size={21} />}
          />
          <StatCard
            title="Planifiées"
            value={totalPlanifiees}
            description="À venir"
            icon={<Calendar size={21} />}
          />
          <StatCard
            title="Terminées"
            value={totalTerminees}
            description="Affectations closes"
            icon={<ClipboardList size={21} />}
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
                placeholder="Rechercher par personnel, unité, fonction, motif..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={statutFilter}
              onChange={(event) =>
                setStatutFilter(
                  event.target.value as 'Tous' | AffectationStatut,
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="En cours">En cours</option>
              <option value="Planifiée">Planifiée</option>
              <option value="Terminée">Terminée</option>
            </select>
          </div>
        </div>

        {/* LISTE DES AFFECTATIONS */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Liste des affectations
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredAffectations.length} affectation(s) affichée(s)
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {totalAffectations} enregistrée(s)
            </div>
          </div>

          {filteredAffectations.length === 0 ? (
            <EmptyState
              title="Aucune affectation trouvée"
              description="Aucune affectation ne correspond aux critères de recherche."
              icon={<ClipboardList size={30} />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Personnel
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Unité
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Fonction
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Période
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
                  {filteredAffectations.map((affectation) => (
                    <tr
                      key={affectation.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <User size={16} />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {affectation.personnelNom || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-700">
                          {affectation.unite}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {affectation.fonction || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span>{formatDate(affectation.dateDebut)}</span>
                          <ArrowRight size={12} className="text-slate-400" />
                          <span>
                            {affectation.dateFin
                              ? formatDate(affectation.dateFin)
                              : 'en cours'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="block max-w-[180px] truncate text-sm text-slate-600"
                          title={affectation.motif}
                        >
                          {affectation.motif || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statutStyles[affectation.statutCalcule]}`}
                        >
                          {affectation.statutCalcule}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openView(affectation)}
                            title="Voir les détails"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(affectation)}
                            title="Modifier"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(affectation)}
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

      <AffectationFormModal
        open={showForm}
        mode={formMode}
        form={form}
        personnelOptions={personnelOptions}
        unitOptions={unitOptions}
        onClose={closeForm}
        onChange={updateForm}
        onSubmit={saveAffectation}
      />

      {showDelete && (
        <DeleteAffectationModal
          affectation={selectedAffectation}
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

function AffectationFormModal({
  open,
  mode,
  form,
  personnelOptions,
  unitOptions,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'view' | 'edit'
  form: AffectationFormData
  personnelOptions: PersonnelOption[]
  unitOptions: string[]
  onClose: () => void
  onChange: (field: keyof AffectationFormData, value: string) => void
  onSubmit: () => void
}) {
  if (!open) return null

  const readOnly = mode === 'view'
  const title =
    mode === 'create'
      ? 'Nouvelle affectation'
      : mode === 'edit'
        ? "Modifier l'affectation"
        : "Consulter l'affectation"

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
              Détails de l&apos;affectation du personnel.
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Personnel
              </label>
              <select
                value={form.personnelId}
                disabled={readOnly}
                onChange={(event) => onChange('personnelId', event.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                  readOnly
                    ? 'border-slate-200 bg-slate-100 text-slate-600'
                    : 'border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
              >
                <option value="">Sélectionner un personnel...</option>
                {personnelOptions.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.nom} {person.prenom} — {person.matricule}
                  </option>
                ))}
              </select>
            </div>

            <SelectField
              label="Unité"
              value={form.unite}
              options={unitOptions}
              readOnly={readOnly}
              onChange={(value) => onChange('unite', value)}
            />

            <Field
              label="Fonction"
              value={form.fonction}
              placeholder="Ex. Chef de section"
              readOnly={readOnly}
              onChange={(value) => onChange('fonction', value)}
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
              <Field
                label="Motif"
                value={form.motif}
                placeholder="Ex. Mutation, affectation initiale, fin de mission..."
                readOnly={readOnly}
                onChange={(value) => onChange('motif', value)}
              />
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
        {!value && <option value="">Sélectionner...</option>}
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

function DeleteAffectationModal({
  affectation,
  onClose,
  onConfirm,
}: {
  affectation: Affectation | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!affectation) return null

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
          Supprimer cette affectation ?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Vous êtes sur le point de supprimer l&apos;affectation de{' '}
          <strong className="text-slate-700">
            {affectation.personnelNom}
          </strong>{' '}
          à <strong className="text-slate-700">{affectation.unite}</strong>.
        </p>

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

