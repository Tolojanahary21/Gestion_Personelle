'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import {
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'

/* =========================================================
   TYPES
   ========================================================= */

export interface Personnel {
  id: string
  matricule: string
  nom: string
  prenom: string
  grade: string
  unite: string
  fonction: string
  statut: 'Actif' | 'Congé' | 'Inactif'
}

export interface PersonnelFormData {
  matricule: string
  nom: string
  prenom: string
  grade: string
  unite: string
  fonction: string
  statut: Personnel['statut']
}

/* =========================================================
   TYPES DE LA FICHE CARRIÈRE
   ========================================================= */

export interface CareerAffectation {
  id: string
  unite: string
  fonction: string
  dateDebut: string
  dateFin: string
  motif: string
  observation: string
}

export interface CareerDecoration {
  id: string
  nom: string
  grade: string
  date: string
  observation: string
}

export interface CareerFormation {
  id: string
  nom: string
  organisme: string
  dateDebut: string
  dateFin: string
  observation: string
}

export interface CareerDocument {
  id: string
  nom: string
  type: string
  data: string
}

export interface CareerEnfant {
  id: string
  nom: string
  dateNaissance: string
  sexe: string
  observation: string
}

export interface CareerEtude {
  id: string
  diplome: string
  etablissement: string
  dateDebut: string
  dateFin: string
  observation: string
}

export interface CareerConnaissance {
  id: string
  libelle: string
  niveau: string
  observation: string
}

export interface PersonnelCareer {
  personnelId: string
  partenaire: string
  situationMatrimoniale: string
  enfants: CareerEnfant[]
  renseignementMilitaire: string
  etudes: CareerEtude[]
  connaissances: CareerConnaissance[]
  affectations: CareerAffectation[]
  decorations: CareerDecoration[]
  formations: CareerFormation[]
  documents: CareerDocument[]
}

/* =========================================================
   PROPS
   ========================================================= */

export interface PersonnelProps {
  onOpenCareer?: (
    person: Personnel,
    mode?: 'create' | 'view' | 'edit',
  ) => void
}

/* =========================================================
   STORAGE
   ========================================================= */

const PERSONNEL_STORAGE_KEY = 'sgpnrh_personnel'
const CAREER_STORAGE_KEY = 'sgpnrh_personnel_career'

/* =========================================================
   GARDE SSR
   ========================================================= */

const isBrowser = () => typeof window !== 'undefined'

/* =========================================================
   FORMULAIRE VIDE
   ========================================================= */

const emptyForm: PersonnelFormData = {
  matricule: '',
  nom: '',
  prenom: '',
  grade: '',
  unite: '',
  fonction: '',
  statut: 'Actif',
}

/* =========================================================
   OUTILS STORAGE (protégés SSR)
   ========================================================= */

export function getPersonnelFromStorage(): Personnel[] {
  if (!isBrowser()) return []

  try {
    const raw = localStorage.getItem(PERSONNEL_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return (parsed as Personnel[]).filter((person) => !/^personnel-00[1-5]$/.test(person.id))
  } catch {
    return []
  }
}

function savePersonnelToStorage(personnel: Personnel[]) {
  if (!isBrowser()) return
  localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(personnel))
}

export function getCareerFromStorage(personnelId: string): PersonnelCareer {
  if (!isBrowser()) return createEmptyCareer(personnelId)

  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY)
    if (!raw) return createEmptyCareer(personnelId)

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return createEmptyCareer(personnelId)
    }

    const career = parsed[personnelId]
    if (!career) return createEmptyCareer(personnelId)

    return {
      ...createEmptyCareer(personnelId),
      ...career,
      personnelId,
    }
  } catch {
    return createEmptyCareer(personnelId)
  }
}

export function saveCareerToStorage(career: PersonnelCareer) {
  if (!isBrowser()) return

  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY)
    const careers = raw && raw.trim() ? JSON.parse(raw) : {}

    careers[career.personnelId] = career
    localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(careers))
  } catch {
    const careers = { [career.personnelId]: career }
    localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(careers))
  }
}

/* =========================================================
   CRÉATION D'UNE FICHE CARRIÈRE VIDE
   ========================================================= */

export function createEmptyCareer(personnelId: string): PersonnelCareer {
  return {
    personnelId,
    partenaire: '',
    situationMatrimoniale: '',
    enfants: [],
    renseignementMilitaire: '',
    etudes: [],
    connaissances: [],
    affectations: [],
    decorations: [],
    formations: [],
    documents: [],
  }
}

/* =========================================================
   UTILITAIRES
   ========================================================= */

export function getFullName(person: Personnel): string {
  return `${person.nom} ${person.prenom}`.trim()
}

export function getInitials(person: Personnel): string {
  const first = person.nom?.charAt(0) || ''
  const second = person.prenom?.charAt(0) || ''
  return `${first}${second}`.toUpperCase()
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

/* =========================================================
   UNITÉS
   ========================================================= */

/* =========================================================
   PAGE PERSONNEL
   ========================================================= */

export default function Personnel({ onOpenCareer }: PersonnelProps) {
  // État initial identique côté serveur et client (pas d'accès storage ici)
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [units] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'Tous' | 'Actif' | 'Congé' | 'Inactif'
  >('Tous')

  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'view' | 'edit'>('create')
  const [form, setForm] = useState<PersonnelFormData>(emptyForm)
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  /* =======================================================
     HYDRATATION CÔTÉ CLIENT
     Le storage n'est lu qu'après le montage pour éviter
     tout mismatch d'hydratation entre le rendu serveur
     et le rendu client.
     ======================================================= */

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPersonnel(getPersonnelFromStorage())
      setIsHydrated(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  /* =======================================================
     SAUVEGARDE AUTOMATIQUE (uniquement après hydratation)
     ======================================================= */

  useEffect(() => {
    if (!isHydrated) return
    savePersonnelToStorage(personnel)
  }, [personnel, isHydrated])

  /* =======================================================
     STATISTIQUES
     ======================================================= */

  const totalPersonnel = personnel.length
  const totalActif = personnel.filter((p) => p.statut === 'Actif').length
  const totalConge = personnel.filter((p) => p.statut === 'Congé').length
  const totalInactif = personnel.filter((p) => p.statut === 'Inactif').length

  /* =======================================================
     RECHERCHE
     ======================================================= */

  const filteredPersonnel = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return personnel.filter((person) => {
      const matchesSearch =
        !normalizedSearch ||
        person.matricule.toLowerCase().includes(normalizedSearch) ||
        person.nom.toLowerCase().includes(normalizedSearch) ||
        person.prenom.toLowerCase().includes(normalizedSearch) ||
        person.grade.toLowerCase().includes(normalizedSearch) ||
        person.unite.toLowerCase().includes(normalizedSearch) ||
        person.fonction.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'Tous' || person.statut === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [personnel, search, statusFilter])

  /* =======================================================
     AJOUTER
     ======================================================= */

  function openCreate() {
    const newId = generateId('personnel')
    const newPerson: Personnel = { id: newId, ...emptyForm }

    setFormMode('create')
    setForm({ ...emptyForm })
    setSelectedPerson(newPerson)

    if (onOpenCareer) {
      onOpenCareer(newPerson, 'create')
      return
    }

    setShowForm(true)
  }

  /* =======================================================
     VOIR
     ======================================================= */

  function openView(person: Personnel) {
    if (onOpenCareer) {
      onOpenCareer(person, 'view')
      return
    }

    setSelectedPerson(person)
    setShowDetails(true)
  }

  /* =======================================================
     MODIFIER
     ======================================================= */

  function openEdit(person: Personnel) {
    if (onOpenCareer) {
      onOpenCareer(person, 'edit')
      return
    }

    setSelectedPerson(person)
    setFormMode('edit')
    setForm({
      matricule: person.matricule,
      nom: person.nom,
      prenom: person.prenom,
      grade: person.grade,
      unite: person.unite,
      fonction: person.fonction,
      statut: person.statut,
    })
    setShowForm(true)
  }

  /* =======================================================
     FERMER FORMULAIRE
     ======================================================= */

  function closeForm() {
    setShowForm(false)
    setSelectedPerson(null)
  }

  /* =======================================================
     MODIFICATION FORMULAIRE
     ======================================================= */

  function updateForm(field: keyof PersonnelFormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: field === 'statut' ? (value as Personnel['statut']) : value,
    }))
  }

  /* =======================================================
     SAUVEGARDE FORMULAIRE
     ======================================================= */

  function savePerson() {
    if (!form.nom.trim() || !form.prenom.trim() || !form.matricule.trim()) {
      return
    }

    if (formMode === 'edit') {
      if (!selectedPerson) return

      setPersonnel((previous) =>
        previous.map((person) =>
          person.id === selectedPerson.id ? { ...person, ...form } : person,
        ),
      )
    } else {
      const newPerson: Personnel = {
        id: selectedPerson?.id ?? generateId('personnel'),
        ...form,
      }

      setPersonnel((previous) => [...previous, newPerson])
      saveCareerToStorage(createEmptyCareer(newPerson.id))
    }

    closeForm()
  }

  /* =======================================================
     SUPPRESSION
     ======================================================= */

  function openDelete(person: Personnel) {
    setSelectedPerson(person)
    setShowDelete(true)
  }

  function closeDelete() {
    setShowDelete(false)
    setSelectedPerson(null)
  }

  function confirmDelete() {
    if (!selectedPerson) return

    const personnelId = selectedPerson.id

    setPersonnel((previous) =>
      previous.filter((person) => person.id !== personnelId),
    )

    if (isBrowser()) {
      try {
        const raw = localStorage.getItem(CAREER_STORAGE_KEY)
        if (raw) {
          const careers = JSON.parse(raw)
          delete careers[personnelId]
          localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(careers))
        }
        localStorage.removeItem(`sgpnrh_photo_${personnelId}`)
      } catch {
        // Rien à faire si le nettoyage échoue.
      }
    }

    closeDelete()
  }

  /* =======================================================
     RENDU
     ======================================================= */

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* EN-TÊTE */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Users size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Personnel naval
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Gestion des personnels et accès aux fiches carrière.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Ajouter un personnel
          </button>
        </div>

        {/* STATISTIQUES */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total personnel"
            value={totalPersonnel}
            description="Personnel enregistré"
            icon={<Users size={21} />}
          />
          <StatCard
            title="Personnel actif"
            value={totalActif}
            description="En activité"
            icon={<User size={21} />}
          />
          <StatCard
            title="En congé"
            value={totalConge}
            description="Personnel actuellement en congé"
            icon={<FileText size={21} />}
          />
          <StatCard
            title="Inactif"
            value={totalInactif}
            description="Personnel inactif"
            icon={<Shield size={21} />}
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
                placeholder="Rechercher par matricule, nom, grade, unité..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'Tous' | 'Actif' | 'Congé' | 'Inactif',
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Congé">Congé</option>
              <option value="Inactif">Inactif</option>
            </select>
          </div>
        </div>

        {/* LISTE DES PERSONNELS */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Liste des personnels
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredPersonnel.length} personnel(s) affiché(s)
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {totalPersonnel} enregistré(s)
            </div>
          </div>

          {filteredPersonnel.length === 0 ? (
            <EmptyState
              title="Aucun personnel trouvé"
              description="Aucun personnel ne correspond aux critères de recherche."
              icon={<Users size={30} />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Matricule
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Personnel
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Grade
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Unité
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Fonction
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
                  {filteredPersonnel.map((person) => (
                    <tr
                      key={person.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {person.matricule}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <PersonnelAvatar person={person} />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {getFullName(person)}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Personnel naval
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Shield size={15} className="text-blue-600" />
                          <span className="text-sm font-medium text-slate-700">
                            {person.grade}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {person.unite || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {person.fonction || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={person.statut} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openView(person)}
                            title="Voir les détails"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(person)}
                            title="Modifier la fiche carrière"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(person)}
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

      <PersonnelFormModal
        open={showForm}
        mode={formMode}
        form={form}
        units={units}
        onClose={closeForm}
        onChange={updateForm}
        onSubmit={savePerson}
      />

      {showDetails && selectedPerson && (
        <PersonnelDetailsModal
          person={selectedPerson}
          onClose={() => {
            setShowDetails(false)
            setSelectedPerson(null)
          }}
        />
      )}

      {showDelete && (
        <DeletePersonnelModal
          person={selectedPerson}
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
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
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
   AVATAR
   ========================================================= */

function PersonnelAvatar({ person }: { person: Personnel }) {
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (!isBrowser()) return
    const frame = requestAnimationFrame(() =>
      setPhoto(localStorage.getItem(`sgpnrh_photo_${person.id}`)),
    )
    return () => cancelAnimationFrame(frame)
  }, [person.id])

  if (photo) {
     
    return (
      <Image
        src={photo}
        alt={getFullName(person)}
        width={44}
        height={44}
        unoptimized
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
      />
    )
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
      {getInitials(person)}
    </div>
  )
}

/* =========================================================
   BADGE STATUT
   ========================================================= */

function StatusBadge({ status }: { status: Personnel['statut'] }) {
  const styles: Record<Personnel['statut'], string> = {
    Actif: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Congé: 'border-amber-200 bg-amber-50 text-amber-700',
    Inactif: 'border-red-200 bg-red-50 text-red-700',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
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

function PersonnelFormModal({
  open,
  mode,
  form,
  units,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'view' | 'edit'
  form: PersonnelFormData
  units: string[]
  onClose: () => void
  onChange: (field: keyof PersonnelFormData, value: string) => void
  onSubmit: () => void
}) {
  if (!open) return null

  const readOnly = mode === 'view'
  const title =
    mode === 'create'
      ? 'Ajouter un personnel'
      : mode === 'edit'
        ? 'Modifier le personnel'
        : 'Consulter le personnel'

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Informations administratives du personnel.
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
            <Field
              label="Matricule"
              value={form.matricule}
              placeholder="Saisir le matricule"
              readOnly={readOnly}
              onChange={(value) => onChange('matricule', value)}
            />
            <Field
              label="Nom"
              value={form.nom}
              placeholder="Nom"
              readOnly={readOnly}
              onChange={(value) => onChange('nom', value)}
            />
            <Field
              label="Prénom"
              value={form.prenom}
              placeholder="Prénom"
              readOnly={readOnly}
              onChange={(value) => onChange('prenom', value)}
            />
            <Field
              label="Grade"
              value={form.grade}
              placeholder="Grade"
              readOnly={readOnly}
              onChange={(value) => onChange('grade', value)}
            />
            <SelectField
              label="Unité"
              value={form.unite}
              options={units}
              readOnly={readOnly}
              onChange={(value) => onChange('unite', value)}
            />
            <Field
              label="Fonction"
              value={form.fonction}
              placeholder="Fonction"
              readOnly={readOnly}
              onChange={(value) => onChange('fonction', value)}
            />
            <SelectField
              label="Statut"
              value={form.statut}
              options={['Actif', 'Congé', 'Inactif']}
              readOnly={readOnly}
              onChange={(value) => onChange('statut', value)}
            />
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
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  readOnly: boolean
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type="text"
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
   MODALE DÉTAILS
   ========================================================= */

function PersonnelDetailsModal({
  person,
  onClose,
}: {
  person: Personnel
  onClose: () => void
}) {
  const career = getCareerFromStorage(person.id)

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Détails du personnel
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {getFullName(person)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6">
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
            <PersonnelAvatar person={person} />
            <div>
              <p className="font-bold text-slate-900">
                {getFullName(person)}
              </p>
              <p className="text-sm text-slate-500">{person.matricule}</p>
              <div className="mt-2">
                <StatusBadge status={person.statut} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Matricule" value={person.matricule} />
            <DetailItem label="Nom" value={person.nom} />
            <DetailItem label="Prénom" value={person.prenom} />
            <DetailItem label="Grade" value={person.grade} />
            <DetailItem label="Unité" value={person.unite} />
            <DetailItem label="Fonction" value={person.fonction} />
            <DetailItem
              label="Partenaire"
              value={career.partenaire || 'Non renseigné'}
            />
            <DetailItem
              label="Situation matrimoniale"
              value={career.situationMatrimoniale || 'Non renseignée'}
            />
            <DetailItem
              label="Nombre d'enfants"
              value={String(career.enfants?.length ?? 0)}
            />
            <DetailItem
              label="Affectations"
              value={String(career.affectations?.length ?? 0)}
            />
            <DetailItem
              label="Décorations"
              value={String(career.decorations?.length ?? 0)}
            />
            <DetailItem
              label="Formations"
              value={String(career.formations?.length ?? 0)}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Fermer
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

/* =========================================================
   ITEM DÉTAIL
   ========================================================= */

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value || '—'}
      </p>
    </div>
  )
}

/* =========================================================
   MODALE SUPPRESSION
   ========================================================= */

function DeletePersonnelModal({
  person,
  onClose,
  onConfirm,
}: {
  person: Personnel | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!person) return null

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
          Supprimer ce personnel ?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Vous êtes sur le point de supprimer la fiche de{' '}
          <strong className="text-slate-700">{getFullName(person)}</strong>.
        </p>

        <p className="mt-2 text-sm leading-6 text-red-600">
          Les informations de la fiche carrière et la photo associée seront
          également supprimées.
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
