"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "fr" | "en" | "mg";
export type AppTheme = "light" | "dark" | "system";

const STORAGE_KEY = "sgpnrh_user_settings";
const translationOriginals = new WeakMap<Text, string>();
const translationValues = new WeakMap<Text, string>();
const translatedNodes = new Set<Text>();
const attributeOriginals = new WeakMap<Element, Map<string, string>>();
const attributeValues = new WeakMap<Element, Map<string, string>>();
const translatedElements = new Set<Element>();
const messages: Record<AppLanguage, Record<string, string>> = {
  fr: {},
  en: {
    "Tableau de bord": "Dashboard", Personnel: "Personnel", Grades: "Ranks",
    "Unités navales": "Naval units", Affectations: "Assignments", Formations: "Training",
    Congés: "Leave", "Fin de lien": "End of service", Statistiques: "Statistics",
    Administration: "Administration", Paramètres: "Settings", Déconnexion: "Sign out",
    PRINCIPAL: "MAIN", GESTION: "MANAGEMENT", ANALYSE: "ANALYTICS", SYSTÈME: "SYSTEM",
    "Bienvenue": "Welcome", "Connectez-vous à votre espace personnel": "Sign in to your account",
    "Nom d'utilisateur / Email": "Username or email", "Nom d'utilisateur ou email": "Username or email",
    "Mot de passe": "Password", "Se connecter": "Sign in", "Afficher": "Show", "Masquer": "Hide",
    "Mot de passe oublié ?": "Forgot password?", "Paramètres enregistrés": "Settings saved",
    "Langue de l'interface": "Interface language", "Langue et région": "Language and region",
    Apparence: "Appearance", "Thème": "Theme", Clair: "Light", Sombre: "Dark", Système: "System",
    Configuration: "Configuration", "Gérez vos préférences et les paramètres de votre espace de travail.": "Manage your preferences and workspace settings.",
    "Préférences du compte": "Account preferences", "Configurez les préférences associées à votre compte.": "Configure preferences for your account.",
    "Utilisateur connecté": "Signed in user", "Gestionnaire du personnel": "Personnel manager",
    "Personnalisez l'affichage de votre application.": "Customize how the application looks.",
    "Densité d'affichage": "Display density", Confortable: "Comfortable", Compact: "Compact",
    "Espacement normal": "Standard spacing", "Plus d'informations à l'écran": "More information on screen",
    "Choisissez la langue utilisée dans l'interface.": "Choose the language used in the interface.",
    Notifications: "Notifications", "Contrôlez les notifications que vous souhaitez recevoir.": "Choose which notifications you receive.",
    "Notifications par e-mail": "Email notifications", "Notifications navigateur": "Browser notifications",
    "Notifications sonores": "Sound notifications", "Sécurité du compte": "Account security",
    "Gérez les options de sécurité de votre compte.": "Manage your account security options.",
    "Ajouter un personnel": "Add personnel", "Ajouter un grade": "Add rank", "Ajouter une unité": "Add unit",
    "Ajouter une unité navale": "Add naval unit", Ajouter: "Add", Enregistrer: "Save", Annuler: "Cancel",
    Supprimer: "Delete", Modifier: "Edit", Rechercher: "Search", "Aucun résultat": "No results",
    "Confirmer la suppression": "Confirm deletion", "Voulez-vous vraiment supprimer cet élément ?": "Are you sure you want to delete this item?",
    "Personnel supprimé": "Personnel deleted", "Modifier le personnel": "Edit personnel",
    "Ajouter un congé": "Add leave", "Modifier le congé": "Edit leave", "Ajouter une formation": "Add training",
    "Modifier la formation": "Edit training", "Ajouter une affectation": "Add assignment", "Modifier l'affectation": "Edit assignment",
    "Ajouter une fin de lien": "Add end of service", "Modifier la fin de lien": "Edit end of service",
    "Nom": "Last name", "Prénom": "First name", Matricule: "Service number", Grade: "Rank", Unité: "Unit",
    "Date de naissance": "Date of birth", "Date de recrutement": "Recruitment date", Téléphone: "Phone", Email: "Email",
    "Adresse": "Address", "Date de début": "Start date", "Date de fin": "End date", Motif: "Reason",
    Statut: "Status", Actions: "Actions", "Tous les statuts": "All statuses", Tous: "All", Actif: "Active",
    Inactif: "Inactive", "En congé": "On leave", "Aucun personnel trouvé": "No personnel found",
    "Aucune donnée disponible": "No data available", "Confirmer la déconnexion": "Confirm sign out",
    "Voulez-vous vraiment vous déconnecter ?": "Are you sure you want to sign out?",
    "Erreur lors du chargement des données.": "Error loading data.", "Veuillez remplir tous les champs obligatoires.": "Please complete all required fields.",
    "Rechercher...": "Search...", "Sélectionner": "Select", "Voir": "View", Fermer: "Close",
    "Accès refusé": "Access denied", "Vous devez vous connecter pour accéder à cette page.": "You must sign in to access this page.",
    "Aller à la page de connexion": "Go to sign in",
    "Gestion du personnel": "Personnel management", "Gestion des effectifs": "Workforce management",
    "Gestion des grades": "Rank management", "Gestion des unités navales": "Naval unit management",
    "Gestion des affectations": "Assignment management", "Gestion des formations": "Training management",
    "Gestion des congés": "Leave management", "Fin de lien de service": "End of service",
    "Liste du personnel": "Personnel list", "Nouvelle affectation": "New assignment",
    "Consulter l'affectation": "View assignment", "Nouvelle formation": "New training",
    "Nouvelle unité navale": "New naval unit", "Nouveau grade": "New rank", "Nouvel enregistrement": "New record",
    "Détails de l'affectation du personnel.": "Assignment details for this employee.",
    "Informations relatives à l'unité navale.": "Information about this naval unit.",
    "Évolution des effectifs": "Workforce trends", "Évolution mensuelle de l'effectif": "Monthly workforce trends",
    "Personnel actif": "Active personnel", "Total du personnel": "Total personnel", "Total des unités": "Total units",
    "Organisation": "Organization", "Informations générales": "General information", "Enregistrer les modifications": "Save changes",
    "Restaurer les valeurs par défaut": "Restore defaults", "Restaurer les paramètres": "Restore settings",
  },
  mg: {
    "Tableau de bord": "Tabilao ankapobeny", Personnel: "Mpiasa", Grades: "Ambaratonga",
    "Unités navales": "Sampana an-dranomasina", Affectations: "Fanendrena", Formations: "Fiofanana",
    Congés: "Fialan-tsasatra", "Fin de lien": "Faran'ny fifandraisana", Statistiques: "Antontan'isa",
    Administration: "Fitantanana", Paramètres: "Fikirana", Déconnexion: "Hivoaka",
    PRINCIPAL: "FOTOTRA", GESTION: "FITANTANANA", ANALYSE: "FANDINIHANA", SYSTÈME: "RAFITRA",
    "Bienvenue": "Tongasoa", "Connectez-vous à votre espace personnel": "Midira ao amin'ny kaontinao",
    "Nom d'utilisateur / Email": "Anaran'ny mpampiasa na mailaka", "Nom d'utilisateur ou email": "Anaran'ny mpampiasa na mailaka",
    "Mot de passe": "Tenimiafina", "Se connecter": "Hiditra", "Afficher": "Asehoy", "Masquer": "Afeno",
    "Mot de passe oublié ?": "Adino ny tenimiafina?", "Paramètres enregistrés": "Voatahiry ny fikirana",
    "Langue de l'interface": "Fitenin'ny rindranasa", "Langue et région": "Fiteny sy faritra",
    Apparence: "Endrika", "Thème": "Lohahevitra", Clair: "Mazava", Sombre: "Maizina", Système: "Rafitra",
    Configuration: "Fikirana", "Gérez vos préférences et les paramètres de votre espace de travail.": "Tantano ny safidy sy ny fikirana ao amin'ny toeram-piasanao.",
    "Préférences du compte": "Safidin'ny kaonty", "Configurez les préférences associées à votre compte.": "Fidio ny safidy mifandray amin'ny kaontinao.",
    "Utilisateur connecté": "Mpampiasa tafiditra", "Gestionnaire du personnel": "Mpitantana mpiasa",
    "Personnalisez l'affichage de votre application.": "Amboary ny endriky ny rindranasa.",
    "Densité d'affichage": "Hakitroky ny fampisehoana", Confortable: "Mahazo aina", Compact: "Fintina",
    "Espacement normal": "Elanelana mahazatra", "Plus d'informations à l'écran": "Fampahalalana betsaka kokoa",
    "Choisissez la langue utilisée dans l'interface.": "Safidio ny fiteny ampiasaina amin'ny rindranasa.",
    Notifications: "Fampandrenesana", "Contrôlez les notifications que vous souhaitez recevoir.": "Safidio ny fampandrenesana horaisinao.",
    "Notifications par e-mail": "Fampandrenesana amin'ny mailaka", "Notifications navigateur": "Fampandrenesana amin'ny navigateur",
    "Notifications sonores": "Fampandrenesana misy feo", "Sécurité du compte": "Fiarovana ny kaonty",
    "Gérez les options de sécurité de votre compte.": "Tantano ny fiarovana ny kaontinao.",
    "Ajouter un personnel": "Hanampy mpiasa", "Ajouter un grade": "Hanampy ambaratonga", "Ajouter une unité": "Hanampy sampana",
    "Ajouter une unité navale": "Hanampy sampana an-dranomasina", Ajouter: "Hanampy", Enregistrer: "Tehirizo", Annuler: "Aoka ihany",
    Supprimer: "Fafao", Modifier: "Ovay", Rechercher: "Hikaroka", "Aucun résultat": "Tsy misy valiny",
    "Confirmer la suppression": "Hamafiso ny famafana", "Voulez-vous vraiment supprimer cet élément ?": "Tena hofafana ve ity?",
    "Personnel supprimé": "Voafafa ny mpiasa", "Modifier le personnel": "Hanova mpiasa",
    "Ajouter un congé": "Hanampy fialan-tsasatra", "Modifier le congé": "Hanova fialan-tsasatra",
    "Ajouter une formation": "Hanampy fiofanana", "Modifier la formation": "Hanova fiofanana",
    "Ajouter une affectation": "Hanampy fanendrena", "Modifier l'affectation": "Hanova fanendrena",
    "Ajouter une fin de lien": "Hanampy fiafaran'ny fifandraisana", "Modifier la fin de lien": "Hanova ny fiafaran'ny fifandraisana",
    "Nom": "Anarana", "Prénom": "Fanampin'anarana", Matricule: "Laharan'ny mpiasa", Grade: "Ambaratonga", Unité: "Sampana",
    "Date de naissance": "Daty nahaterahana", "Date de recrutement": "Daty nandraisana", Téléphone: "Finday", Email: "Mailaka",
    "Adresse": "Adiresy", "Date de début": "Daty fanombohana", "Date de fin": "Daty fiafarana", Motif: "Antony",
    Statut: "Sata", Actions: "Asa", "Tous les statuts": "Ny sata rehetra", Tous: "Rehetra", Actif: "Miasa",
    Inactif: "Tsy miasa", "En congé": "Miala sasatra", "Aucun personnel trouvé": "Tsy nahitana mpiasa",
    "Aucune donnée disponible": "Tsy misy angona", "Confirmer la déconnexion": "Hamafiso ny fivoahana",
    "Voulez-vous vraiment vous déconnecter ?": "Tena te hivoaka ve ianao?",
    "Erreur lors du chargement des données.": "Nisy olana tamin'ny famenoana ny angona.", "Veuillez remplir tous les champs obligatoires.": "Fenoy ny saha rehetra tsy maintsy fenoina.",
    "Rechercher...": "Hikaroka...", "Sélectionner": "Hifidy", "Voir": "Hijery", Fermer: "Hidio",
    "Accès refusé": "Voarara ny fidirana", "Vous devez vous connecter pour accéder à cette page.": "Mila miditra ianao raha te hijery ity pejy ity.",
    "Aller à la page de connexion": "Mankanesa amin'ny fidirana",
    "Gestion du personnel": "Fitantanana ny mpiasa", "Gestion des effectifs": "Fitantanana ny isan'ny mpiasa",
    "Gestion des grades": "Fitantanana ny ambaratonga", "Gestion des unités navales": "Fitantanana ny sampana an-dranomasina",
    "Gestion des affectations": "Fitantanana ny fanendrena", "Gestion des formations": "Fitantanana ny fiofanana",
    "Gestion des congés": "Fitantanana ny fialan-tsasatra", "Fin de lien de service": "Faran'ny asa",
    "Liste du personnel": "Lisitry ny mpiasa", "Nouvelle affectation": "Fanendrena vaovao",
    "Consulter l'affectation": "Hijery fanendrena", "Nouvelle formation": "Fiofanana vaovao",
    "Nouvelle unité navale": "Sampana an-dranomasina vaovao", "Nouveau grade": "Ambaratonga vaovao", "Nouvel enregistrement": "Firaketana vaovao",
    "Détails de l'affectation du personnel.": "Antsipirian'ny fanendrena ity mpiasa ity.",
    "Informations relatives à l'unité navale.": "Mombamomba ity sampana an-dranomasina ity.",
    "Évolution des effectifs": "Fiovan'ny isan'ny mpiasa", "Évolution mensuelle de l'effectif": "Fiovan'ny isan'ny mpiasa isam-bolana",
    "Personnel actif": "Mpiasa miasa", "Total du personnel": "Isan'ny mpiasa", "Total des unités": "Isan'ny sampana",
    "Organisation": "Fikambanana", "Informations générales": "Fampahalalana ankapobeny", "Enregistrer les modifications": "Tehirizo ny fanovana",
    "Restaurer les valeurs par défaut": "Avereno ny sanda fototra", "Restaurer les paramètres": "Avereno ny fikirana",
  },
};

type Preferences = { language: AppLanguage; theme: AppTheme };
type ContextValue = Preferences & {
  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  t: (text: string) => string;
};

const PreferencesContext = createContext<ContextValue | null>(null);

function readPreferences(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      language: value.language === "en" || value.language === "mg" ? value.language : "fr",
      theme: value.theme === "dark" || value.theme === "system" ? value.theme : "light",
    };
  } catch {
    return { language: "fr", theme: "light" };
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>({ language: "fr", theme: "light" });

  useEffect(() => {
    const refresh = () => setPreferences(readPreferences());
    refresh();
    window.addEventListener("sgpnrh-preferences-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sgpnrh-preferences-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const dark = preferences.theme === "dark" ||
      (preferences.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.lang = preferences.language;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [preferences]);

  useEffect(() => {
    if (preferences.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      document.documentElement.classList.toggle("dark", media.matches);
      document.documentElement.dataset.theme = media.matches ? "dark" : "light";
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [preferences.theme]);

  useEffect(() => {
    const dictionary = messages[preferences.language];
    const attributeNames = ["placeholder", "title", "aria-label"];

    const translateNode = (node: Text) => {
      const displayed = node.data;
      let source = translationOriginals.get(node);
      if (source === undefined || displayed !== translationValues.get(node)) {
        source = displayed;
        translationOriginals.set(node, source);
      }
      const key = source.trim();
      const result = dictionary[key];
      translatedNodes.add(node);
      if (!result) {
        translationValues.set(node, source);
        return;
      }
      const leading = source.match(/^\s*/)?.[0] ?? "";
      const trailing = source.match(/\s*$/)?.[0] ?? "";
      const next = `${leading}${result}${trailing}`;
      translationValues.set(node, next);
      if (node.data !== next) node.data = next;
    };
    const scan = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        translateNode(node as Text);
        return;
      }
      if (node instanceof Element) {
        translateElement(node);
      }
      node.childNodes.forEach(scan);
    };
    const translateElement = (element: Element) => {
      const originals = attributeOriginals.get(element) ?? new Map<string, string>();
      const values = attributeValues.get(element) ?? new Map<string, string>();
      for (const name of attributeNames) {
        const displayed = element.getAttribute(name);
        if (displayed === null) continue;
        let source = originals.get(name);
        if (source === undefined || displayed !== values.get(name)) {
          source = displayed;
          originals.set(name, source);
        }
        const result = dictionary[source.trim()];
        const leading = source.match(/^\s*/)?.[0] ?? "";
        const trailing = source.match(/\s*$/)?.[0] ?? "";
        const next = result ? `${leading}${result}${trailing}` : source;
        values.set(name, next);
        if (displayed !== next) element.setAttribute(name, next);
      }
      attributeOriginals.set(element, originals);
      attributeValues.set(element, values);
      translatedElements.add(element);
    };

    for (const element of translatedElements) {
      if (!element.isConnected) {
        translatedElements.delete(element);
        continue;
      }
      const originals = attributeOriginals.get(element);
      const values = attributeValues.get(element);
      for (const name of attributeNames) {
        if (element.getAttribute(name) === values?.get(name)) {
          const original = originals?.get(name);
          if (original !== undefined) element.setAttribute(name, original);
        }
      }
    }
    for (const node of translatedNodes) {
      if (!node.isConnected) {
        translatedNodes.delete(node);
        continue;
      }
      if (node.data === translationValues.get(node)) node.data = translationOriginals.get(node) ?? node.data;
    }
    scan(document.body);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData" && record.target instanceof Text) translateNode(record.target);
        if (record.type === "attributes" && record.target instanceof Element) translateElement(record.target);
        record.addedNodes.forEach(scan);
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributeNames,
    });
    return () => observer.disconnect();
  }, [preferences.language]);

  const value = useMemo<ContextValue>(() => ({
    ...preferences,
    setLanguage: (language) => setPreferences((current) => ({ ...current, language })),
    setTheme: (theme) => setPreferences((current) => ({ ...current, theme })),
    t: (text) => messages[preferences.language][text] ?? text,
  }), [preferences]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences doit être utilisé dans PreferencesProvider.");
  return value;
}

export function notifyPreferencesChanged() {
  window.dispatchEvent(new Event("sgpnrh-preferences-changed"));
}
