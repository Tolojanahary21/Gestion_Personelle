'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Anchor,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Search,
  Ship,
  Trash2,
  Users,
  X,
} from 'lucide-react'

/* =========================================================
   TYPES
   ========================================================= */

export type UniteType =
  | 'Base Navale'
  | 'État-Major'
  | 'Frégate'
  | 'Patrouilleur'
  | 'Vedette'
  | 'Unité Logistique'

export type UniteStatut = 'Opérationnelle' | 'En maintenance' | 'Désarmée'

export interface UniteNavale {
  id: string
  nom: string
  type: UniteType
  localisation: string
  commandant: string
  effectifTheorique: number
  statut: UniteStatut
  description: string
}

export interface UniteFormData {
  nom: string
  type: UniteType
  localisation: string
  commandant: string
  effectifTheorique: number
  statut: UniteStatut
  description: string
}

/* =========================================================
   STORAGE
   ========================================================= */

const UNITES_STORAGE_KEY = 'sgpnrh_unites_navales'

const isBrowser = () => typeof window !== 'undefined'

/* =========================================================
   DONNÉES DE DÉMONSTRATION
   ========================================================= */

const defaultUnites: UniteNavale[] = [
  {
    id: 'unite-001',
    nom: 'Base Navale',
    type: 'Base Navale',
    localisation: 'Toamasina',
    commandant: 'Capitaine RAKOTO',
    effectifTheorique: 220,
    statut: 'Opérationnelle',
    description: 'Base navale principale, port d\'attache de la flotte.',
  },
  {
    id: 'unite-002',
    nom: 'État-Major',
    type: 'État-Major',
    localisation: 'Antananarivo',
    commandant: 'Capitaine de frégate RABE',
    effectifTheorique: 45,
    statut: 'Opérationnelle',
    description: 'Commandement et coordination des opérations.',
  },
  {
    id: 'unite-003',
    nom: 'Unité Logistique',
    type: 'Unité Logistique',
    localisation: 'Toamasina',
    commandant: 'Major RASOANAIVO',
    effectifTheorique: 60,
    statut: 'Opérationnelle',
    description: 'Approvisionnement, maintenance et soutien matériel.',
  },
  {
    id: 'unite-004',
    nom: 'Patrouilleur Zafy',
    type: 'Patrouilleur',
    localisation: 'Mahajanga',
    commandant: 'Lieutenant ANDRIANA',
    effectifTheorique: 25,
    statut: 'En maintenance',
    description: 'Surveillance côtière et lutte contre la pêche illégale.',
  },
]

const uniteTypes: UniteType[] = [
  'Base Navale',
  'État-Major',
  'Frégate',
  'Patrouilleur',
  'Vedette',
  'Unité Logistique',
]

const uniteStatuts: UniteStatut[] = [
  'Opérationnelle',
  'En maintenance',
  'Désarmée',
]

/* =========================================================
   FORMULAIRE VIDE
   ========================================================= */

const emptyForm: UniteFormData = {
  nom: '',
  type: 'Base Navale',
  localisation: '',
  commandant: '',
  effectifTheorique: 0,
  statut: 'Opérationnelle',
  description: '',
}

/* =========================================================
   OUTILS STORAGE
   ========================================================= */

export function getUnitesFromStorage(): UniteNavale[] {
  if (!isBrowser()) return defaultUnites

  try {
    const raw = localStorage.getItem(UNITES_STORAGE_KEY)
    if (!raw) return defaultUnites

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultUnites

    return parsed as UniteNavale[]
  } catch {
    return defaultUnites
  }
}

function saveUnitesToStorage(unites: UniteNavale[]) {
  if (!isBrowser()) return
  localStorage.setItem(UNITES_STORAGE_KEY, JSON.stringify(unites))
}

/* =========================================================
   UTILITAIRES
   ========================================================= */

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

const typeIcons: Record<UniteType, ReactNode> = {
  'Base Navale': <Anchor size={15} />,
  'État-Major': <Ship size={15} />,
  Frégate: <Ship size={15} />,
  Patrouilleur: <Ship size={15} />,
  Vedette: <Ship size={15} />,
  'Unité Logistique': <Anchor size={15} />,
}

const statutStyles: Record<UniteStatut, string> = {
  Opérationnelle: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'En maintenance': 'border-amber-200 bg-amber-50 text-amber-700',
  Désarmée: 'border-red-200 bg-red-50 text-red-700',
}

/* =========================================================
   PAGE UNITÉS NAVALES
   ========================================================= */

export default function UnitesNavales() {
  const [unites, setUnites] = useState<UniteNavale[]>(() =>
    getUnitesFromStorage(),
  )

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'Tous' | UniteType>('Tous')
  const [statutFilter, setStatutFilter] = useState<'Tous' | UniteStatut>(
    'Tous',
  )

  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'view' | 'edit'>('create')
  const [form, setForm] = useState<UniteFormData>(emptyForm)
  const [selectedUnite, setSelectedUnite] = useState<UniteNavale | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  /* =======================================================
     SAUVEGARDE
     ======================================================= */

  function persist(next: UniteNavale[]) {
    setUnites(next)
    saveUnitesToStorage(next)
  }

  /* =======================================================
     STATISTIQUES
     ======================================================= */

  const totalUnites = unites.length

  const totalOperationnelles = unites.filter(
    (u) => u.statut === 'Opérationnelle',
  ).length

  const totalMaintenance = unites.filter(
    (u) => u.statut === 'En maintenance',
  ).length

  const effectifTotal = unites.reduce(
    (sum, u) => sum + (u.effectifTheorique || 0),
    0,
  )

  /* =======================================================
     RECHERCHE / FILTRE
     ======================================================= */

  const filteredUnites = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return unites.filter((unite) => {
      const matchesSearch =
        !normalizedSearch ||
        unite.nom.toLowerCase().includes(normalizedSearch) ||
        unite.localisation.toLowerCase().includes(normalizedSearch) ||
        unite.commandant.toLowerCase().includes(normalizedSearch)

      const matchesType = typeFilter === 'Tous' || unite.type === typeFilter

      const matchesStatut =
        statutFilter === 'Tous' || unite.statut === statutFilter

      return matchesSearch && matchesType && matchesStatut
    })
  }, [unites, search, typeFilter, statutFilter])

  /* =======================================================
     AJOUTER
     ======================================================= */

  function openCreate() {
    setFormMode('create')
    setForm({ ...emptyForm })
    setSelectedUnite(null)
    setShowForm(true)
  }

  /* =======================================================
     VOIR
     ======================================================= */

  function openView(unite: UniteNavale) {
    setSelectedUnite(unite)
    setFormMode('view')
    setForm({
      nom: unite.nom,
      type: unite.type,
      localisation: unite.localisation,
      commandant: unite.commandant,
      effectifTheorique: unite.effectifTheorique,
      statut: unite.statut,
      description: unite.description,
    })
    setShowForm(true)
  }

  /* =======================================================
     MODIFIER
     ======================================================= */

  function openEdit(unite: UniteNavale) {
    setSelectedUnite(unite)
    setFormMode('edit')
    setForm({
      nom: unite.nom,
      type: unite.type,
      localisation: unite.localisation,
      commandant: unite.commandant,
      effectifTheorique: unite.effectifTheorique,
      statut: unite.statut,
      description: unite.description,
    })
    setShowForm(true)
  }

  /* =======================================================
     FERMER FORMULAIRE
     ======================================================= */

  function closeForm() {
    setShowForm(false)
    setSelectedUnite(null)
  }

  /* =======================================================
     MODIFICATION FORMULAIRE
     ======================================================= */

  function updateForm(field: keyof UniteFormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]:
        field === 'effectifTheorique' ? Number(value) || 0 : value,
    }))
  }

  /* =======================================================
     SAUVEGARDE FORMULAIRE
     ======================================================= */

  function saveUnite() {
    if (!form.nom.trim()) return

    if (formMode === 'edit') {
      if (!selectedUnite) return

      persist(
        unites.map((unite) =>
          unite.id === selectedUnite.id ? { ...unite, ...form } : unite,
        ),
      )
    } else {
      const newUnite: UniteNavale = {
        id: generateId('unite'),
        ...form,
      }

      persist([...unites, newUnite])
    }

    closeForm()
  }

  /* =======================================================
     SUPPRESSION
     ======================================================= */

  function openDelete(unite: UniteNavale) {
    setSelectedUnite(unite)
    setShowDelete(true)
  }

  function closeDelete() {
    setShowDelete(false)
    setSelectedUnite(null)
  }

  function confirmDelete() {
    if (!selectedUnite) return

    persist(unites.filter((unite) => unite.id !== selectedUnite.id))
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
              <Ship size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Unités navales
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Gestion des bases, bâtiments et unités de la marine.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Ajouter une unité
          </button>
        </div>

        {/* STATISTIQUES */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total unités"
            value={totalUnites}
            description="Unités enregistrées"
            icon={<Ship size={21} />}
          />
          <StatCard
            title="Opérationnelles"
            value={totalOperationnelles}
            description="Unités actives"
            icon={<Anchor size={21} />}
          />
          <StatCard
            title="En maintenance"
            value={totalMaintenance}
            description="Unités indisponibles"
            icon={<Ship size={21} />}
          />
          <StatCard
            title="Effectif théorique"
            value={effectifTotal}
            description="Personnel prévu, toutes unités"
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
                placeholder="Rechercher par nom, localisation, commandant..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as 'Tous' | UniteType)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Tous">Tous les types</option>
              {uniteTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={statutFilter}
              onChange={(event) =>
                setStatutFilter(event.target.value as 'Tous' | UniteStatut)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Tous">Tous les statuts</option>
              {uniteStatuts.map((statut) => (
                <option key={statut} value={statut}>
                  {statut}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTE DES UNITÉS */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Liste des unités navales
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredUnites.length} unité(s) affichée(s)
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {totalUnites} enregistrée(s)
            </div>
          </div>

          {filteredUnites.length === 0 ? (
            <EmptyState
              title="Aucune unité trouvée"
              description="Aucune unité ne correspond aux critères de recherche."
              icon={<Ship size={30} />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Unité
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Localisation
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Commandant
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Effectif
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
                  {filteredUnites.map((unite) => (
                    <tr key={unite.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                            {typeIcons[unite.type]}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {unite.nom}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {unite.type}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {unite.localisation || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {unite.commandant || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {unite.effectifTheorique}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statutStyles[unite.statut]}`}
                        >
                          {unite.statut}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openView(unite)}
                            title="Voir les détails"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(unite)}
                            title="Modifier"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(unite)}
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

      <UniteFormModal
        open={showForm}
        mode={formMode}
        form={form}
        onClose={closeForm}
        onChange={updateForm}
        onSubmit={saveUnite}
      />

      {showDelete && (
        <DeleteUniteModal
          unite={selectedUnite}
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

function UniteFormModal({
  open,
  mode,
  form,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'view' | 'edit'
  form: UniteFormData
  onClose: () => void
  onChange: (field: keyof UniteFormData, value: string) => void
  onSubmit: () => void
}) {
  if (!open) return null

  const readOnly = mode === 'view'
  const title =
    mode === 'create'
      ? 'Ajouter une unité navale'
      : mode === 'edit'
        ? "Modifier l'unité navale"
        : "Consulter l'unité navale"

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
              Informations relatives à l&apos;unité navale.
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
                label="Nom de l'unité"
                value={form.nom}
                placeholder="Ex. Base Navale de Toamasina"
                readOnly={readOnly}
                onChange={(value) => onChange('nom', value)}
              />
            </div>

            <SelectField
              label="Type"
              value={form.type}
              options={uniteTypes}
              readOnly={readOnly}
              onChange={(value) => onChange('type', value)}
            />

            <SelectField
              label="Statut"
              value={form.statut}
              options={uniteStatuts}
              readOnly={readOnly}
              onChange={(value) => onChange('statut', value)}
            />

            <Field
              label="Localisation"
              value={form.localisation}
              placeholder="Ex. Toamasina"
              readOnly={readOnly}
              onChange={(value) => onChange('localisation', value)}
            />

            <Field
              label="Commandant"
              value={form.commandant}
              placeholder="Ex. Capitaine RAKOTO"
              readOnly={readOnly}
              onChange={(value) => onChange('commandant', value)}
            />

            <Field
              label="Effectif théorique"
              value={String(form.effectifTheorique)}
              placeholder="Ex. 120"
              readOnly={readOnly}
              type="number"
              onChange={(value) => onChange('effectifTheorique', value)}
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
                placeholder="Mission, spécificités, contexte de l'unité..."
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

function DeleteUniteModal({
  unite,
  onClose,
  onConfirm,
}: {
  unite: UniteNavale | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!unite) return null

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
          Supprimer cette unité ?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Vous êtes sur le point de supprimer l&apos;unité{' '}
          <strong className="text-slate-700">{unite.nom}</strong>.
        </p>

        <p className="mt-2 text-sm leading-6 text-red-600">
          Le personnel déjà affecté à cette unité conservera la mention
          existante, mais elle ne correspondra plus à une unité enregistrée.
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
