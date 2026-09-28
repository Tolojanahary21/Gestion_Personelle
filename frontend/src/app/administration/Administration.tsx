"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";
import {
  Bell,
  Building2,
  Check,
  Database,
  Download,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
   ========================================================= */

interface OrganizationSettings {
  organizationName: string;
  acronym: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

interface SecuritySettings {
  sessionDuration: string;
  passwordMinLength: number;
  requireStrongPassword: boolean;
  enableLoginNotification: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  leaveNotifications: boolean;
  formationNotifications: boolean;
  endOfLinkNotifications: boolean;
}

type ActiveSection =
  | "organization"
  | "security"
  | "notifications"
  | "system"
  | "users";

/* =========================================================
   STORAGE
   ========================================================= */

const ORGANIZATION_STORAGE_KEY = "sgpnrh_organization_settings";
const SECURITY_STORAGE_KEY = "sgpnrh_security_settings";
const NOTIFICATION_STORAGE_KEY = "sgpnrh_notification_settings";

/* =========================================================
   DEFAULT DATA
   ========================================================= */

const DEFAULT_ORGANIZATION: OrganizationSettings = {
  organizationName: "Gestion du Personnel",
  acronym: "SGPNRH",
  address: "",
  phone: "",
  email: "",
  website: "",
};

const DEFAULT_SECURITY: SecuritySettings = {
  sessionDuration: "8",
  passwordMinLength: 8,
  requireStrongPassword: true,
  enableLoginNotification: true,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailNotifications: true,
  leaveNotifications: true,
  formationNotifications: true,
  endOfLinkNotifications: true,
};

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

function saveStorageData<T>(key: string, data: T) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(data));
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Administration() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("organization");

  const [organization, setOrganization] =
    useState<OrganizationSettings>(() =>
      getStorageData(
        ORGANIZATION_STORAGE_KEY,
        DEFAULT_ORGANIZATION
      )
    );

  const [security, setSecurity] =
    useState<SecuritySettings>(() =>
      getStorageData(
        SECURITY_STORAGE_KEY,
        DEFAULT_SECURITY
      )
    );

  const [notifications, setNotifications] =
    useState<NotificationSettings>(() =>
      getStorageData(
        NOTIFICATION_STORAGE_KEY,
        DEFAULT_NOTIFICATIONS
      )
    );

  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* =======================================================
     SAVE
     ======================================================= */

  const saveSettings = () => {
    saveStorageData(
      ORGANIZATION_STORAGE_KEY,
      organization
    );

    saveStorageData(
      SECURITY_STORAGE_KEY,
      security
    );

    saveStorageData(
      NOTIFICATION_STORAGE_KEY,
      notifications
    );

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  };

  /* =======================================================
     RESET
     ======================================================= */

  const resetSettings = () => {
    setOrganization(DEFAULT_ORGANIZATION);
    setSecurity(DEFAULT_SECURITY);
    setNotifications(DEFAULT_NOTIFICATIONS);

    localStorage.removeItem(ORGANIZATION_STORAGE_KEY);
    localStorage.removeItem(SECURITY_STORAGE_KEY);
    localStorage.removeItem(NOTIFICATION_STORAGE_KEY);

    setShowResetModal(false);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600" />

              <span className="text-sm font-medium text-slate-500">
                Administration
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Administration
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Configurez les paramètres généraux du système de
              gestion du personnel.
            </p>

          </div>

          <div className="flex items-center gap-2">

            {showSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" />
                Modifications enregistrées
              </div>
            )}

            <button
              type="button"
              onClick={saveSettings}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Enregistrer
            </button>

          </div>

        </div>

        {/* =================================================
            LAYOUT
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">

          {/* =================================================
              SIDEBAR SETTINGS
          ================================================= */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

            <div className="mb-3 px-3 py-2">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Paramètres
              </p>

            </div>

            <AdministrationMenuItem
              icon={<Building2 className="h-4 w-4" />}
              label="Organisation"
              active={activeSection === "organization"}
              onClick={() =>
                setActiveSection("organization")
              }
            />

            <AdministrationMenuItem
              icon={<Shield className="h-4 w-4" />}
              label="Sécurité"
              active={activeSection === "security"}
              onClick={() =>
                setActiveSection("security")
              }
            />

            <AdministrationMenuItem
              icon={<Bell className="h-4 w-4" />}
              label="Notifications"
              active={activeSection === "notifications"}
              onClick={() =>
                setActiveSection("notifications")
              }
            />

            <AdministrationMenuItem
              icon={<Database className="h-4 w-4" />}
              label="Système"
              active={activeSection === "system"}
              onClick={() =>
                setActiveSection("system")
              }
            />

            <AdministrationMenuItem
              icon={<Users className="h-4 w-4" />}
              label="Utilisateurs"
              active={activeSection === "users"}
              onClick={() => setActiveSection("users")}
            />

          </aside>

          {/* =================================================
              CONTENT
          ================================================= */}

          <main className="space-y-6">

            {/* =================================================
                ORGANIZATION
            ================================================= */}

            {activeSection === "organization" && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <SectionHeader
                  icon={<Building2 className="h-5 w-5" />}
                  title="Informations de l'organisation"
                  description="Informations générales utilisées par l'application."
                />

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                  <Field
                    label="Nom de l'organisation"
                    value={organization.organizationName}
                    onChange={(value) =>
                      setOrganization((prev) => ({
                        ...prev,
                        organizationName: value,
                      }))
                    }
                  />

                  <Field
                    label="Sigle"
                    value={organization.acronym}
                    onChange={(value) =>
                      setOrganization((prev) => ({
                        ...prev,
                        acronym: value,
                      }))
                    }
                  />

                  <Field
                    label="Adresse"
                    value={organization.address}
                    onChange={(value) =>
                      setOrganization((prev) => ({
                        ...prev,
                        address: value,
                      }))
                    }
                  />

                  <Field
                    label="Téléphone"
                    value={organization.phone}
                    onChange={(value) =>
                      setOrganization((prev) => ({
                        ...prev,
                        phone: value,
                      }))
                    }
                  />

                  <Field
                    label="Adresse e-mail"
                    type="email"
                    value={organization.email}
                    onChange={(value) =>
                      setOrganization((prev) => ({
                        ...prev,
                        email: value,
                      }))
                    }
                  />

                  <Field
                    label="Site web"
                    value={organization.website}
                    onChange={(value) =>
                      setOrganization((prev) => ({
                        ...prev,
                        website: value,
                      }))
                    }
                  />

                </div>

              </section>
            )}

            {/* =================================================
                SECURITY
            ================================================= */}

            {activeSection === "security" && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <SectionHeader
                  icon={<Shield className="h-5 w-5" />}
                  title="Sécurité"
                  description="Configurez les règles de sécurité du système."
                />

                <div className="space-y-6 p-6">

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <SelectField
                      label="Durée de session"
                      value={security.sessionDuration}
                      options={[
                        {
                          value: "1",
                          label: "1 heure",
                        },
                        {
                          value: "4",
                          label: "4 heures",
                        },
                        {
                          value: "8",
                          label: "8 heures",
                        },
                        {
                          value: "24",
                          label: "24 heures",
                        },
                      ]}
                      onChange={(value) =>
                        setSecurity((prev) => ({
                          ...prev,
                          sessionDuration: value,
                        }))
                      }
                    />

                    <NumberField
                      label="Longueur minimale du mot de passe"
                      value={security.passwordMinLength}
                      min={6}
                      max={32}
                      onChange={(value) =>
                        setSecurity((prev) => ({
                          ...prev,
                          passwordMinLength: value,
                        }))
                      }
                    />

                  </div>

                  <div className="space-y-3">

                    <Toggle
                      label="Mot de passe renforcé"
                      description="Exiger des règles supplémentaires pour les mots de passe."
                      checked={security.requireStrongPassword}
                      onChange={(value) =>
                        setSecurity((prev) => ({
                          ...prev,
                          requireStrongPassword: value,
                        }))
                      }
                    />

                    <Toggle
                      label="Notification de connexion"
                      description="Notifier lorsqu'une nouvelle connexion est détectée."
                      checked={security.enableLoginNotification}
                      onChange={(value) =>
                        setSecurity((prev) => ({
                          ...prev,
                          enableLoginNotification: value,
                        }))
                      }
                    />

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            {activeSection === "notifications" && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <SectionHeader
                  icon={<Bell className="h-5 w-5" />}
                  title="Notifications"
                  description="Gérez les notifications automatiques de l'application."
                />

                <div className="space-y-3 p-6">

                  <Toggle
                    label="Notifications par e-mail"
                    description="Activer l'envoi des notifications par e-mail."
                    checked={notifications.emailNotifications}
                    onChange={(value) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailNotifications: value,
                      }))
                    }
                  />

                  <Toggle
                    label="Notifications des congés"
                    description="Recevoir les notifications relatives aux demandes de congé."
                    checked={notifications.leaveNotifications}
                    onChange={(value) =>
                      setNotifications((prev) => ({
                        ...prev,
                        leaveNotifications: value,
                      }))
                    }
                  />

                  <Toggle
                    label="Notifications des formations"
                    description="Recevoir les notifications relatives aux formations."
                    checked={notifications.formationNotifications}
                    onChange={(value) =>
                      setNotifications((prev) => ({
                        ...prev,
                        formationNotifications: value,
                      }))
                    }
                  />

                  <Toggle
                    label="Notifications des fins de lien"
                    description="Recevoir les notifications concernant les fins de lien."
                    checked={
                      notifications.endOfLinkNotifications
                    }
                    onChange={(value) =>
                      setNotifications((prev) => ({
                        ...prev,
                        endOfLinkNotifications: value,
                      }))
                    }
                  />

                </div>

              </section>
            )}

            {/* =================================================
                SYSTEM
            ================================================= */}

            {activeSection === "system" && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                  <SectionHeader
                    icon={<Database className="h-5 w-5" />}
                    title="Système"
                    description="Outils de maintenance et informations système."
                  />

                  <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

                    <SystemCard
                      icon={<Database className="h-5 w-5" />}
                      title="Base de données"
                      description="Gestion et maintenance des données."
                      action="Vérifier"
                      onClick={() => {
                        alert(
                          "La connexion à la base de données sera vérifiée avec l'API."
                        );
                      }}
                    />

                    <SystemCard
                      icon={<Download className="h-5 w-5" />}
                      title="Export des données"
                      description="Exporter les données du système."
                      action="Exporter"
                      onClick={() => {
                        alert(
                          "L'export sera connecté à l'API FastAPI."
                        );
                      }}
                    />

                    <SystemCard
                      icon={<RefreshCw className="h-5 w-5" />}
                      title="Synchronisation"
                      description="Synchroniser les données avec le serveur."
                      action="Synchroniser"
                      onClick={() => {
                        alert(
                          "La synchronisation sera connectée à l'API."
                        );
                      }}
                    />

                    <SystemCard
                      icon={<FileText className="h-5 w-5" />}
                      title="Journal système"
                      description="Consulter les activités du système."
                      action="Consulter"
                      onClick={() => {
                        alert(
                          "Le journal système sera disponible avec l'API."
                        );
                      }}
                    />

                  </div>

                </section>

                {/* Danger Zone */}

                <section className="rounded-2xl border border-red-200 bg-white shadow-sm">

                  <div className="border-b border-red-100 px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="rounded-lg bg-red-50 p-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="font-semibold text-red-700">
                          Zone sensible
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          Actions pouvant modifier les paramètres du système.
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">

                    <div>

                      <p className="font-medium text-slate-800">
                        Réinitialiser les paramètres
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Restaurer les paramètres par défaut de l&apos;application.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowResetModal(true)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Réinitialiser
                    </button>

                  </div>

                </section>
              </>
            )}

            {activeSection === "users" && <UserManagement />}

          </main>

        </div>

      </div>

      {/* =====================================================
          RESET MODAL
      ===================================================== */}

      {showResetModal && (
        <ModalOverlay
          onClose={() => setShowResetModal(false)}
        >

          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>
                <h2 className="font-semibold text-slate-900">
                  Réinitialiser les paramètres
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Cette action restaurera les valeurs par défaut.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowResetModal(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="p-5">

              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                Les paramètres actuels seront remplacés par les
                paramètres par défaut.
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">

              <button
                type="button"
                onClick={() =>
                  setShowResetModal(false)
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={resetSettings}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Réinitialiser
              </button>

            </div>

          </div>

        </ModalOverlay>
      )}

    </div>
  );
}

/* =========================================================
   MENU ITEM
   ========================================================= */

function AdministrationMenuItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   SECTION HEADER
   ========================================================= */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">

      <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}

/* =========================================================
   FIELD
   ========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />

    </div>
  );
}

/* =========================================================
   SELECT FIELD
   ========================================================= */

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

    </div>
  );
}

/* =========================================================
   NUMBER FIELD
   ========================================================= */

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />

    </div>
  );
}

/* =========================================================
   TOGGLE
   ========================================================= */

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">

      <div>

        <p className="text-sm font-medium text-slate-800">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-slate-900"
            : "bg-slate-300"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}

/* =========================================================
   SYSTEM CARD
   ========================================================= */

function SystemCard({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">

      <div className="mb-4 flex items-center gap-3">

        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

      </div>

      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {action}
      </button>

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
  children: React.ReactNode;
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

interface ManagedUser {
  id_user: number
  username: string
  role: string
  personnel_id: number | null
  last_login: string | null
}

interface UserPersonnel { id_personnel: number; last_name: string; first_names: string }
type ManagedUserForm = { username: string; password: string; confirmation: string; role: string; personnel_id: string }
const EMPTY_USER_FORM: ManagedUserForm = { username: '', password: '', confirmation: '', role: 'Staff', personnel_id: '' }
const USER_ROLES = ['Admin', 'RH', 'Manager', 'Staff']

function errorText(error: unknown) {
  const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg ?? 'Donnée invalide').join(' ')
  return 'Le serveur est indisponible. Réessayez dans quelques instants.'
}

function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [personnel, setPersonnel] = useState<UserPersonnel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [form, setForm] = useState<ManagedUserForm>(EMPTY_USER_FORM)
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null)

  async function loadUsers() {
    setLoading(true)
    try {
      const [userResponse, personnelResponse] = await Promise.all([
        api.get<ManagedUser[]>('/users/'),
        api.get<UserPersonnel[]>('/personnel/'),
      ])
      setUsers(userResponse.data)
      setPersonnel(personnelResponse.data)
      setError('')
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => { void loadUsers() })
    return () => cancelAnimationFrame(frame)
  }, [])

  function openCreate() {
    setCreatingAdmin(false)
    setEditingUser(null)
    setForm(EMPTY_USER_FORM)
    setFormOpen(true)
  }

  function openCreateAdmin() {
    setEditingUser(null)
    setForm({ ...EMPTY_USER_FORM, role: 'Admin' })
    setCreatingAdmin(true)
    setFormOpen(true)
  }

  function openEdit(user: ManagedUser) {
    setEditingUser(user)
    setForm({ username: user.username, password: '', confirmation: '', role: user.role, personnel_id: user.personnel_id ? String(user.personnel_id) : '' })
    setFormOpen(true)
  }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (form.username.trim().length < 3 || (!editingUser && form.password.length < 8) || (creatingAdmin && form.password !== form.confirmation)) {
      setError(creatingAdmin && form.password !== form.confirmation ? 'Les deux mots de passe ne correspondent pas.' : 'Le nom doit comporter au moins 3 caractères et le mot de passe 8 caractères.')
      return
    }
    setSaving(true)
    setError('')
    const payload: Record<string, string | number | null> = {
      username: form.username.trim(),
      role: creatingAdmin ? 'Admin' : form.role,
      personnel_id: creatingAdmin ? null : form.personnel_id ? Number(form.personnel_id) : null,
    }
    if (form.password) payload.password = form.password
    try {
      if (editingUser) await api.put(`/users/${editingUser.id_user}`, payload)
      else await api.post('/users/', payload)
      setFormOpen(false)
      await loadUsers()
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser() {
    if (!deletingUser) return
    setSaving(true)
    try {
      await api.delete(`/users/${deletingUser.id_user}`)
      setDeletingUser(null)
      await loadUsers()
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Comptes utilisateurs</h2>
          <p className="mt-1 text-sm text-slate-500">Créer et gérer les comptes d’accès du personnel.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Plus className="h-4 w-4" /> Ajouter un compte
          </button>
          <button type="button" onClick={openCreateAdmin} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            <Shield className="h-4 w-4" /> Ajouter un administrateur
          </button>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? <p className="text-sm text-slate-500">Chargement des comptes…</p> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Utilisateur</th><th className="px-5 py-4">Rôle</th><th className="px-5 py-4">Personnel lié</th><th className="px-5 py-4">Dernière connexion</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const person = personnel.find((item) => item.id_personnel === user.personnel_id)
                return <tr key={user.id_user}>
                  <td className="px-5 py-4 font-medium text-slate-900">{user.username}</td>
                  <td className="px-5 py-4">{user.role}</td>
                  <td className="px-5 py-4">{person ? `${person.last_name} ${person.first_names}` : '—'}</td>
                  <td className="px-5 py-4">{user.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : 'Jamais'}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2">
                    <button type="button" aria-label={`Modifier ${user.username}`} onClick={() => openEdit(user)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                    <button type="button" aria-label={`Supprimer ${user.username}`} onClick={() => setDeletingUser(user)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              })}
              {users.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Aucun compte utilisateur.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false) }}>
        <form onSubmit={saveUser} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold text-slate-900">{editingUser ? 'Modifier le compte' : creatingAdmin ? 'Créer un compte administrateur' : 'Créer un compte'}</h3>{creatingAdmin && <p className="mt-1 text-sm text-slate-500">Ce nouveau compte aura les droits administrateur.</p>}</div><button type="button" aria-label="Fermer" onClick={() => setFormOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
          <label className="block text-sm font-medium text-slate-700">Nom d’utilisateur<input required minLength={3} maxLength={100} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
          <label className="block text-sm font-medium text-slate-700">{editingUser ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe'}<input type="password" required={!editingUser} minLength={8} maxLength={255} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
          {creatingAdmin && <label className="block text-sm font-medium text-slate-700">Confirmer le mot de passe<input type="password" required minLength={8} maxLength={255} autoComplete="new-password" value={form.confirmation} onChange={(event) => setForm({ ...form, confirmation: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>}
          {!creatingAdmin && <><label className="block text-sm font-medium text-slate-700">Rôle<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">{USER_ROLES.map((role) => <option key={role}>{role}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-700">Personnel associé<select value={form.personnel_id} onChange={(event) => setForm({ ...form, personnel_id: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"><option value="">Aucun</option>{personnel.map((item) => <option key={item.id_personnel} value={item.id_personnel}>{item.last_name} {item.first_names}</option>)}</select></label></>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Annuler</button><button disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
        </form>
      </div>}

      {deletingUser && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h3 className="text-lg font-semibold text-slate-900">Supprimer le compte ?</h3><p className="mt-2 text-sm text-slate-600">Le compte « {deletingUser.username} » ne pourra plus se connecter.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeletingUser(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Annuler</button><button type="button" disabled={saving} onClick={() => void deleteUser()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">Supprimer</button></div></section></div>}
    </section>
  )
}

