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
    Dossiers: "Personnel records", "Dossiers du personnel": "Personnel records", "Informations complémentaires": "Additional information",
    Enfants: "Children", Langues: "Languages", "Compétences informatiques": "Computer skills", Décorations: "Decorations", "Pièces jointes": "Attachments",
    "Personnel parent": "Parent personnel", "Lieu de naissance": "Place of birth", Sexe: "Gender", École: "School", Occupation: "Occupation",
    Langue: "Language", Maîtrise: "Proficiency", "Niveau CECR": "CEFR level", Certification: "Certification", "Date de certification": "Certification date", Notes: "Notes",
    Compétence: "Skill", Catégorie: "Category", Niveau: "Level", "Années d’expérience": "Years of experience", "Nom de la décoration": "Decoration name", "Date d’attribution": "Award date", "Autorité attributaire": "Awarding authority", Référence: "Reference", Description: "Description",
    "Nom du fichier": "File name", "Chemin ou URL du fichier": "File path or URL", "Type MIME": "MIME type", "Taille en octets": "Size in bytes", "Type de document": "Document type", "Tous les personnels": "All personnel", "Aucun enregistrement dans cette liste.": "No records in this list.", "Choisir un personnel": "Choose personnel", "Sélectionner…": "Select…", "Données synchronisées avec les tables du backend.": "Data synced with backend tables.", "Aucune activité remontée par le backend · 0": "No activity returned by the backend · 0",
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
    Dossiers: "Rakitra", "Dossiers du personnel": "Rakitra momba ny mpiasa", "Informations complémentaires": "Antsipiriany fanampiny",
    Enfants: "Anaka", Langues: "Fiteny", "Compétences informatiques": "Fahaiza-manao informatika", Décorations: "Mari-pankasitrahana", "Pièces jointes": "Tovana",
    "Personnel parent": "Ray aman-dreny mpiasa", "Lieu de naissance": "Toerana nahaterahana", Sexe: "Lahy sa vavy", École: "Sekoly", Occupation: "Asa",
    Langue: "Fiteny", Maîtrise: "Fahaizana", "Niveau CECR": "Ambaratonga CEFR", Certification: "Fanamarinana", "Date de certification": "Daty fanamarinana", Notes: "Fanamarihana",
    Compétence: "Fahaiza-manao", Catégorie: "Sokajy", Niveau: "Ambaratonga", "Années d’expérience": "Taona niasana", "Nom de la décoration": "Anaran'ny mari-pankasitrahana", "Date d’attribution": "Daty nanomezana", "Autorité attributaire": "Manampahefana nanome", Référence: "Laharana", Description: "Famaritana",
    "Nom du fichier": "Anaran'ny rakitra", "Chemin ou URL du fichier": "Lalana na URL an'ny rakitra", "Type MIME": "Karazana MIME", "Taille en octets": "Habe amin'ny octet", "Type de document": "Karazana antontan-taratasy", "Tous les personnels": "Mpiasa rehetra", "Aucun enregistrement dans cette liste.": "Tsy misy firaketana ato.", "Choisir un personnel": "Misafidiana mpiasa", "Sélectionner…": "Misafidiana…", "Données synchronisées avec les tables du backend.": "Angona mifanaraka amin'ny backend.", "Aucune activité remontée par le backend · 0": "Tsy misy hetsika avy amin'ny backend · 0",
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

const supplementalTranslations: Record<string, [string, string]> = {
  "Configurez les paramètres généraux du système de gestion du personnel.": ["Configure the general personnel management system settings.", "Amboary ny fikirana ankapoben'ny rafitra fitantanana mpiasa."],
  "Modifications enregistrées": ["Changes saved", "Voatahiry ny fanovana"],
  "Informations de l'organisation": ["Organization information", "Mombamomba ny fikambanana"],
  "Sécurité": ["Security", "Fiarovana"],
  "Base de données": ["Database", "Tahiry angona"],
  "Export des données": ["Data export", "Famoahana angona"],
  "Synchronisation": ["Synchronization", "Fandrindrana"],
  "Journal système": ["System log", "Tatitra momba ny rafitra"],
  "Zone sensible": ["Sensitive area", "Faritra saro-pady"],
  "Actions pouvant modifier les paramètres du système.": ["Actions that can change system settings.", "Asa afaka manova ny fikirana rafitra."],
  "Réinitialiser les paramètres": ["Reset settings", "Avereno amin'ny voalohany ny fikirana"],
  "Restaurer les paramètres par défaut de l'application.": ["Restore the application's default settings.", "Avereno ny fikirana fototra an'ny rindranasa."],
  "Réinitialiser": ["Reset", "Avereno"],
  "Cette action restaurera les valeurs par défaut.": ["This action will restore the default values.", "Hamerina ny sanda fototra ity hetsika ity."],
  "Les paramètres actuels seront remplacés par les paramètres par défaut.": ["Current settings will be replaced with the defaults.", "Hosoloina amin'ny fikirana fototra ny fikirana ankehitriny."],
  "Comptes utilisateurs": ["User accounts", "Kaontin'ny mpampiasa"],
  "Créer et gérer les comptes d’accès du personnel.": ["Create and manage personnel access accounts.", "Mamoròna sy tantano ny kaonty fidiran'ny mpiasa."],
  "Ajouter un compte": ["Add an account", "Hanampy kaonty"],
  "Ajouter un administrateur": ["Add an administrator", "Hanampy mpitantana"],
  "Chargement des comptes…": ["Loading accounts…", "Mameno ny kaonty…"],
  "Utilisateur": ["User", "Mpampiasa"],
  "Rôle": ["Role", "Andraikitra"],
  "Personnel lié": ["Linked personnel", "Mpiasa mifandray"],
  "Dernière connexion": ["Last sign-in", "Fidirana farany"],
  "Aucun compte utilisateur.": ["No user accounts.", "Tsy misy kaontin'ny mpampiasa."],
  "Ce nouveau compte aura les droits administrateur.": ["This new account will have administrator rights.", "Hanana zo ho mpitantana ity kaonty vaovao ity."],
  "Nom d’utilisateur": ["Username", "Anaran'ny mpampiasa"],
  "Confirmer le mot de passe": ["Confirm password", "Hamarino ny tenimiafina"],
  "Personnel associé": ["Associated personnel", "Mpiasa mifandray"],
  "Aucun": ["None", "Tsy misy"],
  "Supprimer le compte ?": ["Delete this account?", "Hofafana ve ity kaonty ity?"],
  "Le compte «": ["Account “", "Kaonty “"],
  "» ne pourra plus se connecter.": ["” will no longer be able to sign in.", "” dia tsy afaka miditra intsony."],
  "Suivi des affectations du personnel aux unités navales.": ["Track personnel assignments to naval units.", "Araho ny fanendrena mpiasa amin'ny sampana an-dranomasina."],
  "Chargement des affectations…": ["Loading assignments…", "Mameno ny fanendrena…"],
  "Total affectations": ["Total assignments", "Fitambaran'ny fanendrena"],
  "En cours": ["In progress", "Mitohy"],
  "Planifiées": ["Scheduled", "Voalahatra"],
  "Terminées": ["Completed", "Vita"],
  "Rechercher par personnel, unité, fonction, motif...": ["Search by personnel, unit, position, or reason…", "Karohy araka ny mpiasa, sampana, andraikitra na antony…"],
  "Planifiée": ["Scheduled", "Voalahatra"],
  "Terminée": ["Completed", "Vita"],
  "Liste des affectations": ["Assignment list", "Lisitry ny fanendrena"],
  "affectation(s) affichée(s)": ["assignment(s) shown", "fanendrena aseho"],
  "enregistrée(s)": ["recorded", "voatahiry"],
  "Aucune affectation trouvée": ["No assignments found", "Tsy nahitana fanendrena"],
  "Fonction": ["Position", "Asa"],
  "Période": ["Period", "Fe-potoana"],
  "Voir les détails": ["View details", "Hijery antsipiriany"],
  "Sélectionner un personnel...": ["Select personnel…", "Misafidiana mpiasa…"],
  "Ex. Chef de section": ["e.g. Section chief", "oh: Lehiben'ny fizarana"],
  "Ex. Mutation, affectation initiale, fin de mission...": ["e.g. Transfer, initial assignment, end of mission…", "oh: Famindrana, fanendrena voalohany, fiafaran'ny iraka…"],
  "Observation": ["Notes", "Fanamarihana"],
  "Remarques complémentaires...": ["Additional notes…", "Fanamarihana fanampiny…"],
  "Sélectionner...": ["Select…", "Misafidiana…"],
  "Supprimer cette affectation ?": ["Delete this assignment?", "Hofafana ve ity fanendrena ity?"],
  "Vous êtes sur le point de supprimer l'affectation de": ["You are about to delete the assignment for", "Hamafa ny fanendrena an'i"],
  "Recrutements sur 12 mois": ["Recruitments over 12 months", "Fandraisana mpiasa tao anatin'ny 12 volana"],
  "Calculé à partir des dates de recrutement présentes dans le backend": ["Calculated from recruitment dates available in the backend", "Kajiana amin'ny daty fandraisana hita ao amin'ny backend"],
  "Aucune date de recrutement disponible": ["No recruitment dates available", "Tsy misy daty fandraisana azo ampiasaina"],
  "Recrutements par mois :": ["Recruitments per month:", "Fandraisana mpiasa isam-bolana:"],
  "sur la période affichée.": ["during the period shown.", "mandritra ny fe-potoana aseho."],
  "Ouvrir le menu": ["Open menu", "Sokafy ny sakafo"],
  "Administration navale": ["Naval administration", "Fitantanana an-dranomasina"],
  "Système de Gestion du Personnel Naval": ["Naval Personnel Management System", "Rafitra fitantanana ny mpiasa an-dranomasina"],
  "Fermer la recherche": ["Close search", "Akatona ny fikarohana"],
  "Activité récente": ["Recent activity", "Hetsika vao haingana"],
  "Journal d’audit renvoyé par le backend": ["Audit log returned by the backend", "Tatitra fanaraha-maso avy amin'ny backend"],
  "activité(s)": ["activity item(s)", "hetsika"],
  "Actualiser": ["Refresh", "Havaozy"],
  "Personnel par grade": ["Personnel by rank", "Mpiasa araka ny laharana"],
  "Effectifs issus des fiches du personnel": ["Counts from personnel records", "Isany nalaina avy amin'ny rakitry ny mpiasa"],
  "total": ["total", "fitambarany"],
  "Aucun grade · 0": ["No ranks · 0", "Tsy misy laharana · 0"],
  "Statut du personnel": ["Personnel status", "Satan'ny mpiasa"],
  "Répartition calculée depuis les fiches et statuts de service": ["Breakdown calculated from personnel and service status records", "Fizarana kajiana avy amin'ny rakitry ny mpiasa sy ny satan'ny asa"],
  "Aucune donnée · 0": ["No data · 0", "Tsy misy angona · 0"],
  "Personnel naval": ["Naval personnel", "Mpiasa an-dranomasina"],
  "Gestion des personnels et accès aux fiches carrière.": ["Manage personnel and access career records.", "Tantano ny mpiasa sy ny rakitry ny asa."],
  "Total personnel": ["Total personnel", "Fitambaran'ny mpiasa"],
  "Rechercher par matricule, nom, grade, unité...": ["Search by service number, name, rank, or unit…", "Karohy araka ny laharana, anarana, grade na sampana…"],
  "Congé": ["Leave", "Fialan-tsasatra"],
  "Liste des personnels": ["Personnel list", "Lisitry ny mpiasa"],
  "personnel(s) affiché(s)": ["personnel record(s) shown", "mpiasa aseho"],
  "enregistré(s)": ["recorded", "voatahiry"],
  "Modifier la fiche carrière": ["Edit career record", "Hanova ny rakitry ny asa"],
  "Informations administratives du personnel.": ["Personnel administrative information.", "Fampahalalana ara-pitantanana momba ny mpiasa."],
  "Saisir le matricule": ["Enter service number", "Ampidiro ny laharan'ny mpiasa"],
  "Détails du personnel": ["Personnel details", "Antsipirian'ny mpiasa"],
  "Supprimer ce personnel ?": ["Delete this personnel record?", "Hofafana ve ity rakitry ny mpiasa ity?"],
  "Vous êtes sur le point de supprimer la fiche de": ["You are about to delete the record for", "Hamafa ny rakitr'i"],
  "Les informations de la fiche carrière et la photo associée seront également supprimées.": ["Career details and the associated photo will also be deleted.", "Ho voafafa koa ny antsipirian'ny asa sy ny sary mifandray aminy."],
  "Fermer le menu": ["Close menu", "Akatona ny sakafo"],
  "SGPNRH": ["Navy Personnel System", "Rafitra mpiasan-dranomasina"],
  "Personnel Naval": ["Naval Personnel", "Mpiasa an-dranomasina"],
  "Gestion et suivi des congés du personnel.": ["Manage and track personnel leave.", "Tantano sy araho ny fialan-tsasatry ny mpiasa."],
  "Nouveau congé": ["New leave", "Fialan-tsasatra vaovao"],
  "Total congés": ["Total leave records", "Fitambaran'ny fialan-tsasatra"],
  "En attente": ["Pending", "Miandry"],
  "Jours de congé": ["Leave days", "Andro fialan-tsasatra"],
  "Rechercher par personnel, matricule, type, motif...": ["Search by personnel, service number, type, or reason…", "Karohy araka ny mpiasa, laharana, karazana na antony…"],
  "Tous les types": ["All types", "Karazana rehetra"],
  "Liste des congés": ["Leave list", "Lisitry ny fialan-tsasatra"],
  "congé(s) affiché(s)": ["leave record(s) shown", "fialan-tsasatra aseho"],
  "Congés stockés sur cet appareil · aucune synchronisation serveur disponible.": ["Leave records are stored on this device · server synchronization is unavailable.", "Voatahiry amin'ity fitaovana ity ny fialan-tsasatra · tsy misy fandrindrana amin'ny server."],
  "Type": ["Type", "Karazana"],
  "Durée": ["Duration", "Faharetana"],
  "jour(s)": ["day(s)", "andro"],
  "Informations du congé et du personnel concerné.": ["Leave and associated personnel details.", "Antsipirian'ny fialan-tsasatra sy ny mpiasa voakasika."],
  "Sélectionner un personnel": ["Select personnel", "Misafidiana mpiasa"],
  "Matricule :": ["Service number:", "Laharan'ny mpiasa:"],
  "Durée du congé": ["Leave duration", "Faharetan'ny fialan-tsasatra"],
  "Ex. Congé annuel": ["e.g. Annual leave", "oh: Fialan-tsasatra isan-taona"],
  "Ex. Antananarivo": ["e.g. Antananarivo", "oh: Antananarivo"],
  "Supprimer ce congé ?": ["Delete this leave record?", "Hofafana ve ity fialan-tsasatra ity?"],
  "Vous êtes sur le point de supprimer le congé de": ["You are about to delete the leave record for", "Hamafa ny fialan-tsasatr'i"],
  "enregistrement(s)": ["record(s)", "firaketana"],
  "Rechercher…": ["Search…", "Karohy…"],
  "Téléversement sécurisé (10 Mo max). Les fichiers sont stockés dans public/upload et téléchargeables par les administrateurs.": ["Secure upload (10 MB max). Files are stored in public/upload and can be downloaded by administrators.", "Fampidirana azo antoka (10 Mo fara-fahabetsany). Tehirizina ao amin'ny public/upload ny rakitra ary azon'ny mpitantana alaina."],
  "Chargement des données…": ["Loading data…", "Mameno ny angona…"],
  "Les changements sont enregistrés directement dans le backend.": ["Changes are saved directly to the backend.", "Tehirizina mivantana ao amin'ny backend ny fanovana."],
  "Confirmer la suppression de cet enregistrement ? Cette action est définitive.": ["Delete this record? This action cannot be undone.", "Hofafana ve ity firaketana ity? Tsy azo averina ity hetsika ity."],
  "Rechercher un parent par nom ou matricule…": ["Search for a parent by name or service number…", "Karohy araka ny anarana na laharan'ny ray aman-dreny…"],
  "Gestion des départs et fins de lien du personnel.": ["Manage personnel departures and end-of-service records.", "Tantano ny fiafaran'ny asan'ny mpiasa."],
  "Total": ["Total", "Fitambarany"],
  "En préparation": ["In preparation", "Eo am-panomanana"],
  "Validées": ["Approved", "Nankatoavina"],
  "Liste des fins de lien": ["End-of-service list", "Lisitry ny fiafaran'ny asa"],
  "dossier(s) affiché(s)": ["record(s) shown", "rakitra aseho"],
  "Dossiers stockés sur cet appareil · aucune synchronisation serveur disponible.": ["Records are stored on this device · server synchronization is unavailable.", "Voatahiry amin'ity fitaovana ity ny rakitra · tsy misy fandrindrana amin'ny server."],
  "Lieu": ["Location", "Toerana"],
  "Notification :": ["Notification:", "Fampahafantarana:"],
  "Informations relatives au départ du personnel.": ["Personnel departure details.", "Antsipirian'ny fiafaran'ny asan'ny mpiasa."],
  "Ex. Départ à la retraite": ["e.g. Retirement", "oh: Fisotroan-dronono"],
  "Ex. Toamasina": ["e.g. Toamasina", "oh: Toamasina"],
  "Supprimer cette fin de lien ?": ["Delete this end-of-service record?", "Hofafana ve ity firaketana fiafaran'asa ity?"],
  "Vous êtes sur le point de supprimer le dossier de fin de lien de": ["You are about to delete the end-of-service record for", "Hamafa ny rakitry ny fiafaran'asan'i"],
  "Suivi des formations suivies par le personnel.": ["Track training completed by personnel.", "Araho ny fiofanana vitan'ny mpiasa."],
  "Chargement des formations…": ["Loading training…", "Mameno ny fiofanana…"],
  "Total formations": ["Total training records", "Fitambaran'ny fiofanana"],
  "Participants formés": ["Trained participants", "Mpandray anjara voaofana"],
  "Rechercher par nom, organisme, lieu, participant...": ["Search by name, organization, location, or participant…", "Karohy araka ny anarana, fikambanana, toerana na mpandray anjara…"],
  "Liste des formations": ["Training list", "Lisitry ny fiofanana"],
  "formation(s) affichée(s)": ["training record(s) shown", "fiofanana aseho"],
  "Aucune formation trouvée": ["No training found", "Tsy nahitana fiofanana"],
  "Formation": ["Training", "Fiofanana"],
  "Organisme": ["Organization", "Fikambanana"],
  "Participants": ["Participants", "Mpandray anjara"],
  "participant(s)": ["participant(s)", "mpandray anjara"],
  "Détails de la formation et de ses participants.": ["Training and participant details.", "Antsipirian'ny fiofanana sy ny mpandray anjara."],
  "Ex. Formation sécurité maritime": ["e.g. Maritime safety training", "oh: Fiofanana momba ny fiarovana an-dranomasina"],
  "Ex. École Navale": ["e.g. Naval Academy", "oh: Akademia an-dranomasina"],
  "Ex. Base Navale": ["e.g. Naval Base", "oh: Tobin-tafika an-dranomasina"],
  "Aucun personnel enregistré.": ["No personnel recorded.", "Tsy misy mpiasa voarakitra."],
  "Supprimer cette formation ?": ["Delete this training?", "Hofafana ve ity fiofanana ity?"],
  "Vous êtes sur le point de supprimer la formation": ["You are about to delete the training", "Hamafa ny fiofanana"],
  "Cette formation compte": ["This training has", "Ity fiofanana ity dia misy"],
  "qui perdront la trace de cette formation.": ["who will lose this training record.", "izay ho very ny rakitr'ity fiofanana ity."],
  "participant(s) qui perdront la trace de cette formation.": ["participant(s) will lose this training record.", "mpandray anjara no ho very ny rakitr'ity fiofanana ity."],
  "Grades militaires": ["Military ranks", "Laharana miaramila"],
  "Gestion de la hiérarchie et des grades navals.": ["Manage naval hierarchy and ranks.", "Tantano ny ambaratongam-pahefana sy laharana an-dranomasina."],
  "Chargement des grades…": ["Loading ranks…", "Mameno ny laharana…"],
  "Total grades": ["Total ranks", "Fitambaran'ny laharana"],
  "Officiers": ["Officers", "Manamboninahitra"],
  "Officiers mariniers": ["Petty officers", "Manamboninahitra an-dranomasina"],
  "Grade le plus élevé": ["Highest rank", "Laharana ambony indrindra"],
  "Rechercher par code, libellé, abréviation...": ["Search by code, name, or abbreviation…", "Karohy araka ny kaody, anarana na fanafohezana…"],
  "Toutes les catégories": ["All categories", "Sokajy rehetra"],
  "Liste des grades": ["Rank list", "Lisitry ny laharana"],
  "grade(s) affiché(s), triés par rang hiérarchique": ["rank(s) shown, sorted by hierarchy", "laharana aseho, nalahatra araka ny ambaratongany"],
  "Aucun grade trouvé": ["No rank found", "Tsy nahitana laharana"],
  "Rang": ["Rank order", "Filaharan'ny laharana"],
  "Code": ["Code", "Kaody"],
  "Libellé": ["Name", "Anarana"],
  "Informations relatives au grade militaire.": ["Military rank details.", "Antsipirian'ny laharana miaramila."],
  "Ex. LTN": ["e.g. LTN", "oh: LTN"],
  "Ex. Ltn": ["e.g. Lt.", "oh: Ltn"],
  "Ex. Lieutenant": ["e.g. Lieutenant", "oh: Lieutenant"],
  "Ex. 5": ["e.g. 5", "oh: 5"],
  "Rôle, responsabilités, contexte du grade...": ["Role, responsibilities, rank context…", "Andraikitra sy adidy mifandraika amin'ny laharana…"],
  "Supprimer ce grade ?": ["Delete this rank?", "Hofafana ve ity laharana ity?"],
  "Vous êtes sur le point de supprimer le grade": ["You are about to delete the rank", "Hamafa ny laharana"],
  "Les personnels associés à ce grade conserveront la mention existante, mais elle ne correspondra plus à un grade enregistré.": ["Personnel assigned to this rank will keep the existing value, but it will no longer match a registered rank.", "Hotazonin'ny mpiasa mifandray amin'ity laharana ity ny sanda misy, saingy tsy hifanaraka amin'ny laharana voasoratra intsony izany."],
  "Espace personnel": ["Personnel space", "Espace-n'ny mpiasa"],
  "Espace du personnel": ["Personnel area", "Toeran'ny mpiasa"],
  "Enfants (": ["Children (", "Zanaka ("],
  "Mon dossier": ["My record", "Ny rakitro"],
  "Chargement de votre dossier…": ["Loading your record…", "Mameno ny rakitrao…"],
  "Photo du personnel": ["Personnel photo", "Sarin'ny mpiasa"],
  "Compte :": ["Account:", "Kaonty:"],
  "Aucun enfant enregistré.": ["No children recorded.", "Tsy misy zanaka voarakitra."],
  "Accès lecture seule à votre propre dossier.": ["Read-only access to your own record.", "Afaka mijery ny rakitrao ihany ianao."],
  "Message de bienvenue": ["Welcome message", "Hafatra fandraisana"],
  "Afficher les statistiques": ["Show statistics", "Asehoy ny antontan'isa"],
  "Authentification à deux facteurs": ["Two-factor authentication", "Fanamarinana dingana roa"],
  "Modifier le mot de passe": ["Change password", "Hanova tenimiafina"],
  "Modifier le mot de passe de votre compte.": ["Change your account password.", "Ovay ny tenimiafin'ny kaontinao."],
  "Restaurer toutes vos préférences aux valeurs par défaut.": ["Restore all preferences to their default values.", "Avereno amin'ny sanda fototra ny safidinao rehetra."],
  "Les paramètres sont enregistrés localement sur cet appareil.": ["Settings are saved locally on this device.", "Voatahiry eto amin'ity fitaovana ity ny fikirana."],
  "Exporter PDF": ["Export PDF", "Hamoaka PDF"],
  "Chargement du personnel…": ["Loading personnel…", "Mameno ny mpiasa…"],
  "Filtrer par grade": ["Filter by rank", "Sivano araka ny laharana"],
  "Tous les grades": ["All ranks", "Laharana rehetra"],
  "Exporter le dossier PDF": ["Export personnel record as PDF", "Hamoaka ny rakitry ny mpiasa ho PDF"],
  "Retour à la connexion": ["Back to sign in", "Hiverina amin'ny fidirana"],
  "Créer un compte": ["Create an account", "Hamorona kaonty"],
  "Le compte sera rattaché à votre dossier personnel existant. Les nom, prénoms et matricule doivent correspondre exactement à votre dossier.": ["The account will be linked to your existing personnel record. Your name and service number must match that record exactly.", "Hifandray amin'ny rakitry ny mpiasa misy anao ny kaonty. Tsy maintsy mitovy tanteraka amin'izany rakitra izany ny anaranao sy ny laharanao."],
  "Le rôle créé est": ["The account role is", "Ny andraikitry ny kaonty dia"],
  "Personnel (Staff)": ["Personnel (Staff)", "Mpiasa (Staff)"],
  ". Il donne accès uniquement à votre espace personnel en lecture seule.": [". It provides read-only access to your personnel space.", ". Afaka mijery ny espace-n'ny mpiasa ihany izy."],
  "Création du compte…": ["Creating account…", "Mamorona kaonty…"],
  "Créer mon compte": ["Create my account", "Hamorona ny kaontiko"],
  "Votre mot de passe est transmis au backend via la connexion sécurisée.": ["Your password is sent to the backend over a secure connection.", "Alefa any amin'ny backend amin'ny fifandraisana azo antoka ny tenimiafinao."],
  "Statistiques RH": ["HR statistics", "Antontan'isa momba ny mpiasa"],
  "Données réelles du personnel": ["Live personnel data", "Angona tena izy momba ny mpiasa"],
  "Calculées depuis l’API et actualisées automatiquement toutes les 30 secondes.": ["Calculated from the API and refreshed every 30 seconds.", "Kajiana avy amin'ny API ary havaozina ho azy isaky ny 30 segondra."],
  "Exporter Excel": ["Export Excel", "Hamoaka Excel"],
  "Personnel par unité": ["Personnel by unit", "Mpiasa araka ny sampana"],
  "Recrutements récents": ["Recent recruitment", "Fandraisana mpiasa vao haingana"],
  "Comptage par mois depuis les dates de recrutement existantes.": ["Monthly counts based on recorded recruitment dates.", "Isam-bolana araka ny daty fandraisana voarakitra."],
  "Gestion PDF des fiches personnel": ["Personnel record PDF management", "Fitantanana ny PDF-n'ny rakitry ny mpiasa"],
  "Les exports PDF et les outils d’import des fiches sont dans la gestion du personnel.": ["PDF exports and record import tools are available in Personnel management.", "Hita ao amin'ny Fitantanana mpiasa ny famoahana PDF sy ny fitaovana fampidirana rakitra."],
  "Ouvrir le personnel": ["Open personnel", "Sokafy ny mpiasa"],
  "Gestion des bases, bâtiments et unités de la marine.": ["Manage naval bases, vessels, and units.", "Tantano ny toby sy sampana an-dranomasina."],
  "Chargement des unités…": ["Loading units…", "Mameno ny sampana…"],
  "Total unités": ["Total units", "Fitambaran'ny sampana"],
  "Opérationnelles": ["Operational", "Miasa"],
  "En maintenance": ["Under maintenance", "Eo am-panamboarana"],
  "Effectif théorique": ["Planned staffing", "Isan'ny mpiasa kasaina"],
  "Rechercher par nom, localisation, commandant...": ["Search by name, location, or commander…", "Karohy araka ny anarana, toerana na komandy…"],
  "Liste des unités navales": ["Naval unit list", "Lisitry ny sampana an-dranomasina"],
  "unité(s) affichée(s)": ["unit(s) shown", "sampana aseho"],
  "Aucune unité trouvée": ["No units found", "Tsy nahitana sampana"],
  "Localisation": ["Location", "Toerana"],
  "Commandant": ["Commander", "Komandy"],
  "Effectif": ["Staffing", "Isan'ny mpiasa"],
  "Ex. Base Navale de Toamasina": ["e.g. Toamasina Naval Base", "oh: Tobin-tafika an-dranomasina Toamasina"],
  "Ex. 120": ["e.g. 120", "oh: 120"],
  "Mission, spécificités, contexte de l'unité...": ["Mission, details, and unit context…", "Iraka sy antsipiriany momba ny sampana…"],
  "Supprimer cette unité ?": ["Delete this unit?", "Hofafana ve ity sampana ity?"],
  "Vous êtes sur le point de supprimer l'unité": ["You are about to delete the unit", "Hamafa ny sampana"],
  "Le personnel déjà affecté à cette unité conservera la mention existante, mais elle ne correspondra plus à une unité enregistrée.": ["Personnel already assigned to this unit will keep the existing value, but it will no longer match a registered unit.", "Hotazonin'ny mpiasa voatendry amin'ity sampana ity ny sanda misy, saingy tsy hifanaraka amin'ny sampana voasoratra intsony izany."],
  "Approuvé": ["Approved", "Nankatoavina"],
  "Refusé": ["Rejected", "Nolavina"],
  "Annulé": ["Cancelled", "Nofoanana"],
  "Annulée": ["Cancelled", "Nofoanana"],
  "Validée": ["Approved", "Nankatoavina"],
  "Démission": ["Resignation", "Fialana an-tsitrapo"],
  "Retraite": ["Retirement", "Fisotroan-dronono"],
  "Licenciement": ["Dismissal", "Fandroahana"],
  "Fin de contrat": ["End of contract", "Faran'ny fifanarahana"],
  "Décès": ["Death", "Fahafatesana"],
  "Mutation": ["Transfer", "Famindrana"],
  "Autre": ["Other", "Hafa"],
  "Annuel": ["Annual", "Isan-taona"],
  "Maladie": ["Sick leave", "Fialan-tsasatra noho ny aretina"],
  "Exceptionnel": ["Special leave", "Fialan-tsasatra manokana"],
  "Maternité": ["Maternity leave", "Fialan-tsasatra amin'ny fiterahana"],
  "Interne": ["Internal", "Anaty"],
  "Externe": ["External", "Ivelany"],
  "Certifiante": ["Certification", "Fanamarinana"],
  "Officier supérieur": ["Senior officer", "Manamboninahitra ambony"],
  "Officier subalterne": ["Junior officer", "Manamboninahitra zandriny"],
  "Officier marinier": ["Petty officer", "Manamboninahitra an-dranomasina"],
  "Quartier-maître": ["Leading seaman", "Mpitarika tantsambo"],
  "Matelot": ["Seaman", "Tantsambo"],
  "Base Navale": ["Naval base", "Tobin-tafika an-dranomasina"],
  "État-Major": ["Headquarters", "Foibe"],
  "Frégate": ["Frigate", "Sambo mpiady frigate"],
  "Patrouilleur": ["Patrol vessel", "Sambo fisafoana"],
  "Vedette": ["Patrol boat", "Sambo kely fisafoana"],
  "Unité Logistique": ["Logistics unit", "Sampana logistika"],
  "Autre unité": ["Other unit", "Sampana hafa"],
  "Opérationnelle": ["Operational", "Miasa"],
  "Désarmée": ["Decommissioned", "Nesorina tamin'ny asa"],
  "En congé": ["On leave", "Miala sasatra"],
  "En activité": ["Active", "Miasa"],
  "Données indisponibles": ["Data unavailable", "Tsy misy angona azo ampiasaina"],
  "Aucune donnée": ["No data", "Tsy misy angona"],
  "Aucun enregistrement": ["No records", "Tsy misy firaketana"],
  "Aucune activité remontée par le backend · 0": ["No activity returned by the backend", "Tsy nisy hetsika naverin'ny backend"],
  "Données indisponibles · aucune API": ["Data unavailable · no API endpoint", "Tsy misy angona · tsy misy API"],
  "Aucune route API": ["No API endpoint", "Tsy misy API"],
  "Données indisponibles pour :": ["Data unavailable for:", "Tsy misy angona ho an'ny:"],
};

for (const [source, [english, malagasy]] of Object.entries(supplementalTranslations)) {
  messages.en[source] = english;
  messages.mg[source] = malagasy;
}

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
