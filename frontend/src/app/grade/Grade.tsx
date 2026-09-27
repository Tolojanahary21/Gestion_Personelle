'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Award,
  Eye,
  Pencil,
  Plus,
  Search,
  Shield,
  Star,
  Trash2,
  X,
} from 'lucide-react'

/* =========================================================
   TYPES
   ========================================================= */

export type GradeCategorie =
  | 'Officier supérieur'
  | 'Officier subalterne'
  | 'Officier marinier'
  | 'Quartier-maître'
  | 'Matelot'

export interface Grade {
  id: string
  code: string
  libelle: string
  abreviation: string
  categorie: GradeCategorie
  rang: number
  description: string
}

export interface GradeFormData {
  code: string
  libelle: string
  abreviation: string
  categorie: GradeCategorie
  rang: number
  description: string
}

/* =========================================================
   STORAGE
   ========================================================= */

const GRADES_STORAGE_KEY = 'sgpnrh_grades'

const isBrowser = () => typeof window !== 'undefined'

/* =========================================================
   DONNÉES DE DÉMONSTRATION
   ========================================================= */

const defaultGrades: Grade[] = [
  {
    id: 'grade-001',
    code: 'CV',
    libelle: 'Capitaine de vaisseau',
    abreviation: 'CV',
    categorie: 'Officier supérieur',
    rang: 1,
    description: "Grade d'officier supérieur, commandant de bâtiment ou d'unité majeure.",
  },
  {
    id: 'grade-002',
    code: 'CF',
    libelle: 'Capitaine de frégate',
    abreviation: 'CF',
    categorie: 'Officier supérieur',
    rang: 2,
    description: "Grade d'officier supérieur, second de bâtiment ou chef de service.",
  },
  {
    id: 'grade-003',
    code: 'LTN',
    libelle: 'Lieutenant',
    abreviation: 'Ltn',
    categorie: 'Officier subalterne',
    rang: 5,
    description: 'Officier subalterne, chef de section ou de quart.',
  },
  {
    id: 'grade-004',
    code: 'EV1',
    libelle: 'Enseigne de vaisseau de 1ère classe',
    abreviation: 'EV1',
    categorie: 'Officier subalterne',
    rang: 6,
    description: 'Officier subalterne débutant sa carrière.',
  },
  {
    id: 'grade-005',
    code: 'MAJ',
    libelle: 'Major',
    abreviation: 'Maj',
    categorie: 'Officier marinier',
    rang: 7,
    description: 'Grade sommital des officiers mariniers.',
  },
  {
    id: 'grade-006',
    code: 'MTR',
    libelle: 'Maître',
    abreviation: 'Mtr',
    categorie: 'Officier marinier',
    rang: 9,
    description: 'Officier marinier, encadrement de proximité.',
  },
  {
    id: 'grade-007',
    code: 'QM1',
    libelle: 'Quartier-maître de 1ère classe',
    abreviation: 'QM1',
    categorie: 'Quartier-maître',
    rang: 11,
    description: 'Sous-officier subalterne.',
  },
  {
    id: 'grade-008',
    code: 'MAT',
    libelle: 'Matelot',
    abreviation: 'Mat',
    categorie: 'Matelot',
    rang: 13,
    description: "Grade d'entrée dans la marine.",
  },
]

const categories: GradeCategorie[] = [
  'Officier supérieur',
  'Officier subalterne',
  'Officier marinier',
  'Quartier-maître',
  'Matelot',
]

/* =========================================================
   FORMULAIRE VIDE
   ========================================================= */

const emptyForm: GradeFormData = {
  code: '',
  libelle: '',
  abreviation: '',
  categorie: 'Matelot',
  rang: 0,
  description: '',
}

/* =========================================================
   OUTILS STORAGE
   ========================================================= */

export function getGradesFromStorage(): Grade[] {
  if (!isBrowser()) return defaultGrades

  try {
    const raw = localStorage.getItem(GRADES_STORAGE_KEY)
    if (!raw) return defaultGrades

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultGrades

    return parsed as Grade[]
  } catch {
    return defaultGrades
  }
}

function saveGradesToStorage(grades: Grade[]) {
  if (!isBrowser()) return
  localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(grades))
}

/* =========================================================
   UTILITAIRES
   ========================================================= */

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

const categoryColors: Record<GradeCategorie, string> = {
  'Officier supérieur': 'border-violet-200 bg-violet-50 text-violet-700',
  'Officier subalterne': 'border-blue-200 bg-blue-50 text-blue-700',
  'Officier marinier': 'border-amber-200 bg-amber-50 text-amber-700',
  'Quartier-maître': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Matelot: 'border-slate-200 bg-slate-100 text-slate-700',
}

/* =========================================================
   PAGE GRADES
   ========================================================= */

export default function Grade() {
  const [grades, setGrades] = useState<Grade[]>(() => getGradesFromStorage())

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'Tous' | GradeCategorie>(
    'Tous',
  )

  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'view' | 'edit'>('create')
  const [form, setForm] = useState<GradeFormData>(emptyForm)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  /* =======================================================
     SAUVEGARDE
     ======================================================= */

  function persist(next: Grade[]) {
    setGrades(next)
    saveGradesToStorage(next)
  }

  /* =======================================================
     STATISTIQUES
     ======================================================= */

  const totalGrades = grades.length

  const totalParCategorie = useMemo(() => {
    const map = new Map<GradeCategorie, number>()
    categories.forEach((cat) => map.set(cat, 0))
    grades.forEach((grade) => {
      map.set(grade.categorie, (map.get(grade.categorie) ?? 0) + 1)
    })
    return map
  }, [grades])

  const rangLePlusHaut = useMemo(() => {
    if (grades.length === 0) return null
    return grades.reduce((min, g) => (g.rang < min.rang ? g : min), grades[0])
  }, [grades])

  /* =======================================================
     RECHERCHE / TRI
     ======================================================= */

  const filteredGrades = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return grades
      .filter((grade) => {
        const matchesSearch =
          !normalizedSearch ||
          grade.code.toLowerCase().includes(normalizedSearch) ||
          grade.libelle.toLowerCase().includes(normalizedSearch) ||
          grade.abreviation.toLowerCase().includes(normalizedSearch)

        const matchesCategory =
          categoryFilter === 'Tous' || grade.categorie === categoryFilter

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => a.rang - b.rang)
  }, [grades, search, categoryFilter])

  /* =======================================================
     AJOUTER
     ======================================================= */

  function openCreate() {
    setFormMode('create')
    setForm({ ...emptyForm })
    setSelectedGrade(null)
    setShowForm(true)
  }

  /* =======================================================
     VOIR
     ======================================================= */

  function openView(grade: Grade) {
    setSelectedGrade(grade)
    setFormMode('view')
    setForm({
      code: grade.code,
      libelle: grade.libelle,
      abreviation: grade.abreviation,
      categorie: grade.categorie,
      rang: grade.rang,
      description: grade.description,
    })
    setShowForm(true)
  }

  /* =======================================================
     MODIFIER
     ======================================================= */

  function openEdit(grade: Grade) {
    setSelectedGrade(grade)
    setFormMode('edit')
    setForm({
      code: grade.code,
      libelle: grade.libelle,
      abreviation: grade.abreviation,
      categorie: grade.categorie,
      rang: grade.rang,
      description: grade.description,
    })
    setShowForm(true)
  }

  /* =======================================================
     FERMER FORMULAIRE
     ======================================================= */

  function closeForm() {
    setShowForm(false)
    setSelectedGrade(null)
  }

  /* =======================================================
     MODIFICATION FORMULAIRE
     ======================================================= */

  function updateForm(field: keyof GradeFormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: field === 'rang' ? Number(value) || 0 : value,
    }))
  }

  /* =======================================================
     SAUVEGARDE FORMULAIRE
     ======================================================= */

  function saveGrade() {
    if (!form.libelle.trim() || !form.code.trim()) return

    if (formMode === 'edit') {
      if (!selectedGrade) return

      persist(
        grades.map((grade) =>
          grade.id === selectedGrade.id ? { ...grade, ...form } : grade,
        ),
      )
    } else {
      const newGrade: Grade = {
        id: generateId('grade'),
        ...form,
      }

      persist([...grades, newGrade])
    }

    closeForm()
  }

  /* =======================================================
     SUPPRESSION
     ======================================================= */

  function openDelete(grade: Grade) {
    setSelectedGrade(grade)
    setShowDelete(true)
  }

  function closeDelete() {
    setShowDelete(false)
    setSelectedGrade(null)
  }

  function confirmDelete() {
    if (!selectedGrade) return

    persist(grades.filter((grade) => grade.id !== selectedGrade.id))
    closeDelete()
  }

  /* =======================================================
     RENDU
     ======================================================= */

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1400px]">
        {/* EN-TÊTE */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Award size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Grades militaires
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Gestion de la hiérarchie et des grades navals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Ajouter un grade
          </button>
        </div>

        {/* STATISTIQUES */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total grades"
            value={totalGrades}
            description="Grades enregistrés"
            icon={<Award size={21} />}
          />
          <StatCard
            title="Officiers"
            value={
              (totalParCategorie.get('Officier supérieur') ?? 0) +
              (totalParCategorie.get('Officier subalterne') ?? 0)
            }
            description="Supérieurs et subalternes"
            icon={<Star size={21} />}
          />
          <StatCard
            title="Officiers mariniers"
            value={totalParCategorie.get('Officier marinier') ?? 0}
            description="Encadrement de proximité"
            icon={<Shield size={21} />}
          />
          <StatCard
            title="Grade le plus élevé"
            value={rangLePlusHaut ? rangLePlusHaut.abreviation : '—'}
            description={rangLePlusHaut ? rangLePlusHaut.libelle : 'Aucun grade'}
            icon={<Award size={21} />}
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
                placeholder="Rechercher par code, libellé, abréviation..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value as 'Tous' | GradeCategorie)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Tous">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTE DES GRADES */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Liste des grades</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredGrades.length} grade(s) affiché(s), triés par rang hiérarchique
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {totalGrades} enregistré(s)
            </div>
          </div>

          {filteredGrades.length === 0 ? (
            <EmptyState
              title="Aucun grade trouvé"
              description="Aucun grade ne correspond aux critères de recherche."
              icon={<Award size={30} />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Rang
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Code
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Libellé
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Catégorie
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredGrades.map((grade) => (
                    <tr key={grade.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                          {grade.rang}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                            {grade.abreviation}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {grade.code}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {grade.libelle}
                        </p>
                        {grade.description && (
                          <p
                            className="mt-0.5 max-w-xs truncate text-xs text-slate-500"
                            title={grade.description}
                          >
                            {grade.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryColors[grade.categorie]}`}
                        >
                          {grade.categorie}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openView(grade)}
                            title="Voir les détails"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(grade)}
                            title="Modifier"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(grade)}
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

      <GradeFormModal
        open={showForm}
        mode={formMode}
        form={form}
        onClose={closeForm}
        onChange={updateForm}
        onSubmit={saveGrade}
      />

      {showDelete && (
        <DeleteGradeModal
          grade={selectedGrade}
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
  value: number | string
  description: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 truncate text-3xl font-bold text-slate-900">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{description}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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

function GradeFormModal({
  open,
  mode,
  form,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'view' | 'edit'
  form: GradeFormData
  onClose: () => void
  onChange: (field: keyof GradeFormData, value: string) => void
  onSubmit: () => void
}) {
  if (!open) return null

  const readOnly = mode === 'view'
  const title =
    mode === 'create'
      ? 'Ajouter un grade'
      : mode === 'edit'
        ? 'Modifier le grade'
        : 'Consulter le grade'

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
              Informations relatives au grade militaire.
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
              label="Code"
              value={form.code}
              placeholder="Ex. LTN"
              readOnly={readOnly}
              onChange={(value) => onChange('code', value)}
            />
            <Field
              label="Abréviation"
              value={form.abreviation}
              placeholder="Ex. Ltn"
              readOnly={readOnly}
              onChange={(value) => onChange('abreviation', value)}
            />

            <div className="md:col-span-2">
              <Field
                label="Libellé complet"
                value={form.libelle}
                placeholder="Ex. Lieutenant"
                readOnly={readOnly}
                onChange={(value) => onChange('libelle', value)}
              />
            </div>

            <SelectField
              label="Catégorie"
              value={form.categorie}
              options={categories}
              readOnly={readOnly}
              onChange={(value) => onChange('categorie', value)}
            />

            <Field
              label="Rang hiérarchique"
              value={String(form.rang)}
              placeholder="Ex. 5"
              readOnly={readOnly}
              type="number"
              onChange={(value) => onChange('rang', value)}
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                value={form.description}
                readOnly={readOnly}
                onChange={(event) => onChange('description', event.target.value)}
                rows={3}
                placeholder="Rôle, responsabilités, contexte du grade..."
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
  type?: 'text' | 'number'
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

function DeleteGradeModal({
  grade,
  onClose,
  onConfirm,
}: {
  grade: Grade | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!grade) return null

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
          Supprimer ce grade ?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Vous êtes sur le point de supprimer le grade{' '}
          <strong className="text-slate-700">{grade.libelle}</strong> (
          {grade.code}).
        </p>

        <p className="mt-2 text-sm leading-6 text-red-600">
          Les personnels associés à ce grade conserveront la mention
          existante, mais elle ne correspondra plus à un grade enregistré.
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