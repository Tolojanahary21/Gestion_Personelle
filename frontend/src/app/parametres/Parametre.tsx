"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  Globe,
  KeyRound,
  Monitor,
  Moon,
  Palette,
  Save,
  Settings,
  Shield,
  Sun,
  User,
  Volume2,
} from "lucide-react";

/* =========================================================
   TYPES
   ========================================================= */

type Theme = "light" | "dark" | "system";
type Language = "fr" | "en";
type Density = "comfortable" | "compact";

interface UserSettings {
  language: Language;
  theme: Theme;
  density: Density;

  emailNotifications: boolean;
  browserNotifications: boolean;
  soundNotifications: boolean;

  showWelcomeMessage: boolean;
  showStatistics: boolean;

  twoFactorAuthentication: boolean;
}

/* =========================================================
   STORAGE
   ========================================================= */

const SETTINGS_STORAGE_KEY = "sgpnrh_user_settings";

/* =========================================================
   DEFAULT SETTINGS
   ========================================================= */

const DEFAULT_SETTINGS: UserSettings = {
  language: "fr",
  theme: "light",
  density: "comfortable",

  emailNotifications: true,
  browserNotifications: true,
  soundNotifications: false,

  showWelcomeMessage: true,
  showStatistics: true,

  twoFactorAuthentication: false,
};

/* =========================================================
   HELPERS
   ========================================================= */

function getSettings(): UserSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const data = localStorage.getItem(
      SETTINGS_STORAGE_KEY
    );

    if (!data) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(data),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: UserSettings) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settings)
  );
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Parametre() {
  const [settings, setSettings] =
    useState<UserSettings>(getSettings);

  const [saved, setSaved] = useState(false);

  /* =======================================================
     UPDATE SETTING
     ======================================================= */

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  /* =======================================================
     SAVE
     ======================================================= */

  const handleSave = () => {
    saveSettings(settings);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* =======================================================
     RESET
     ======================================================= */

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-5xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <Settings className="h-5 w-5 text-slate-600" />

              <span className="text-sm font-medium text-slate-500">
                Configuration
              </span>

            </div>

            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Paramètres
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gérez vos préférences et les paramètres de votre
              espace de travail.
            </p>

          </div>

          <div className="flex items-center gap-2">

            {saved && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" />
                Paramètres enregistrés
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Enregistrer
            </button>

          </div>

        </div>

        {/* =================================================
            PROFIL
        ================================================= */}

        <SettingsSection
          icon={<User className="h-5 w-5" />}
          title="Préférences du compte"
          description="Configurez les préférences associées à votre compte."
        >

          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
              <User className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                Utilisateur connecté
              </p>

              <p className="text-sm text-slate-500">
                Gestionnaire du personnel
              </p>
            </div>

          </div>

        </SettingsSection>

        {/* =================================================
            APPARENCE
        ================================================= */}

        <SettingsSection
          icon={<Palette className="h-5 w-5" />}
          title="Apparence"
          description="Personnalisez l'affichage de votre application."
        >

          <div className="space-y-5">

            {/* Theme */}

            <div>

              <label className="mb-3 block text-sm font-medium text-slate-700">
                Thème
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <ThemeOption
                  icon={<Sun className="h-5 w-5" />}
                  title="Clair"
                  description="Interface claire"
                  active={settings.theme === "light"}
                  onClick={() =>
                    updateSetting("theme", "light")
                  }
                />

                <ThemeOption
                  icon={<Moon className="h-5 w-5" />}
                  title="Sombre"
                  description="Interface sombre"
                  active={settings.theme === "dark"}
                  onClick={() =>
                    updateSetting("theme", "dark")
                  }
                />

                <ThemeOption
                  icon={<Monitor className="h-5 w-5" />}
                  title="Système"
                  description="Selon votre système"
                  active={settings.theme === "system"}
                  onClick={() =>
                    updateSetting("theme", "system")
                  }
                />

              </div>

            </div>

            {/* Density */}

            <div>

              <label className="mb-3 block text-sm font-medium text-slate-700">
                Densité d'affichage
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <ThemeOption
                  icon={<Settings className="h-5 w-5" />}
                  title="Confortable"
                  description="Espacement normal"
                  active={
                    settings.density === "comfortable"
                  }
                  onClick={() =>
                    updateSetting(
                      "density",
                      "comfortable"
                    )
                  }
                />

                <ThemeOption
                  icon={<Monitor className="h-5 w-5" />}
                  title="Compact"
                  description="Plus d'informations à l'écran"
                  active={
                    settings.density === "compact"
                  }
                  onClick={() =>
                    updateSetting(
                      "density",
                      "compact"
                    )
                  }
                />

              </div>

            </div>

          </div>

        </SettingsSection>

        {/* =================================================
            LANGUE
        ================================================= */}

        <SettingsSection
          icon={<Globe className="h-5 w-5" />}
          title="Langue et région"
          description="Choisissez la langue utilisée dans l'interface."
        >

          <div className="max-w-md">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Langue de l'interface
            </label>

            <select
              value={settings.language}
              onChange={(event) =>
                updateSetting(
                  "language",
                  event.target.value as Language
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >

              <option value="fr">
                Français
              </option>

              <option value="en">
                English
              </option>

            </select>

          </div>

        </SettingsSection>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <SettingsSection
          icon={<Bell className="h-5 w-5" />}
          title="Notifications"
          description="Contrôlez les notifications que vous souhaitez recevoir."
        >

          <div className="space-y-3">

            <Toggle
              icon={<Bell className="h-4 w-4" />}
              title="Notifications par e-mail"
              description="Recevoir les notifications importantes par e-mail."
              checked={settings.emailNotifications}
              onChange={(value) =>
                updateSetting(
                  "emailNotifications",
                  value
                )
              }
            />

            <Toggle
              icon={<Monitor className="h-4 w-4" />}
              title="Notifications navigateur"
              description="Afficher les notifications directement dans le navigateur."
              checked={settings.browserNotifications}
              onChange={(value) =>
                updateSetting(
                  "browserNotifications",
                  value
                )
              }
            />

            <Toggle
              icon={<Volume2 className="h-4 w-4" />}
              title="Notifications sonores"
              description="Activer les sons lors de nouvelles notifications."
              checked={settings.soundNotifications}
              onChange={(value) =>
                updateSetting(
                  "soundNotifications",
                  value
                )
              }
            />

          </div>

        </SettingsSection>

        {/* =================================================
            TABLEAU DE BORD
        ================================================= */}

        <SettingsSection
          icon={<Monitor className="h-5 w-5" />}
          title="Tableau de bord"
          description="Configurez les éléments affichés sur votre tableau de bord."
        >

          <div className="space-y-3">

            <Toggle
              icon={<User className="h-4 w-4" />}
              title="Message de bienvenue"
              description="Afficher le message de bienvenue lors de l'accès au tableau de bord."
              checked={settings.showWelcomeMessage}
              onChange={(value) =>
                updateSetting(
                  "showWelcomeMessage",
                  value
                )
              }
            />

            <Toggle
              icon={<Settings className="h-4 w-4" />}
              title="Afficher les statistiques"
              description="Afficher les cartes statistiques sur le tableau de bord."
              checked={settings.showStatistics}
              onChange={(value) =>
                updateSetting(
                  "showStatistics",
                  value
                )
              }
            />

          </div>

        </SettingsSection>

        {/* =================================================
            SECURITE
        ================================================= */}

        <SettingsSection
          icon={<Shield className="h-5 w-5" />}
          title="Sécurité du compte"
          description="Gérez les options de sécurité de votre compte."
        >

          <div className="space-y-4">

            <Toggle
              icon={<Shield className="h-4 w-4" />}
              title="Authentification à deux facteurs"
              description="Ajouter une couche de sécurité supplémentaire lors de la connexion."
              checked={
                settings.twoFactorAuthentication
              }
              onChange={(value) =>
                updateSetting(
                  "twoFactorAuthentication",
                  value
                )
              }
            />

            <button
              type="button"
              onClick={() => {
                alert(
                  "La modification du mot de passe sera connectée à l'API FastAPI."
                );
              }}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <KeyRound className="h-4 w-4" />
                </div>

                <div>

                  <p className="text-sm font-medium text-slate-800">
                    Modifier le mot de passe
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Modifier le mot de passe de votre compte.
                  </p>

                </div>

              </div>

              <span className="text-xs font-medium text-slate-500">
                Modifier
              </span>

            </button>

          </div>

        </SettingsSection>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-medium text-slate-800">
              Restaurer les paramètres
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Restaurer toutes vos préférences aux valeurs par défaut.
            </p>

          </div>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Restaurer les valeurs par défaut
          </button>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="pb-4 text-center text-xs text-slate-400">
          Les paramètres sont enregistrés localement sur cet appareil.
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   SETTINGS SECTION
   ========================================================= */

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

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

      <div className="p-6">
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   THEME OPTION
   ========================================================= */

function ThemeOption({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${
        active
          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >

      <div
        className={`rounded-lg p-2 ${
          active
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {icon}
      </div>

      <div>

        <p className="text-sm font-medium text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

      {active && (
        <div className="absolute right-3 top-3">
          <Check className="h-4 w-4 text-slate-900" />
        </div>
      )}

    </button>
  );
}

/* =========================================================
   TOGGLE
   ========================================================= */

function Toggle({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          {icon}
        </div>

        <div>

          <p className="text-sm font-medium text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>

        </div>

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