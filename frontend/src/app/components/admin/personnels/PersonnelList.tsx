"use client";

import { useMemo, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    Users,
} from "lucide-react";

type Personnel = {
    id: number;
    matricule: string;
    lastName: string;
    firstNames: string;
    grade: string;
    function: string;
    status: "Actif" | "Inactif";
};

const personnels: Personnel[] = [
    {
        id: 1,
        matricule: "MAT-001",
        lastName: "RAKOTO",
        firstNames: "Jean",
        grade: "Capitaine",
        function: "Administrateur",
        status: "Actif",
    },
    {
        id: 2,
        matricule: "MAT-002",
        lastName: "RABE",
        firstNames: "Paul",
        grade: "Commandant",
        function: "Chef de service",
        status: "Actif",
    },
    {
        id: 3,
        matricule: "MAT-003",
        lastName: "RANDRIA",
        firstNames: "Marie",
        grade: "Lieutenant",
        function: "Secrétaire",
        status: "Actif",
    },
    {
        id: 4,
        matricule: "MAT-004",
        lastName: "RAZAFI",
        firstNames: "Michel",
        grade: "Capitaine",
        function: "Gestionnaire",
        status: "Inactif",
    },
    {
        id: 5,
        matricule: "MAT-005",
        lastName: "ANDRIAN",
        firstNames: "Luc",
        grade: "Lieutenant",
        function: "Technicien",
        status: "Actif",
    },
];

// Couleurs d'avatar générées à partir du nom
const avatarColors = [
    "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    "bg-rose-500/10 text-rose-600 dark:text-rose-400",
];

const getInitials = (lastName: string, firstNames: string) =>
    `${lastName.charAt(0)}${firstNames.charAt(0)}`.toUpperCase();

export default function PersonnelList() {
    const [search, setSearch] = useState("");
    const [grade, setGrade] = useState("Tous les grades");
    const [status, setStatus] = useState("Tous les statuts");

    const filteredPersonnels = useMemo(() => {
        return personnels.filter((personnel) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                personnel.matricule.toLowerCase().includes(searchValue) ||
                personnel.lastName.toLowerCase().includes(searchValue) ||
                personnel.firstNames.toLowerCase().includes(searchValue);

            const matchesGrade =
                grade === "Tous les grades" ||
                personnel.grade === grade;

            const matchesStatus =
                status === "Tous les statuts" ||
                personnel.status === status;

            return matchesSearch && matchesGrade && matchesStatus;
        });
    }, [search, grade, status]);

    const hasActiveFilters =
        search !== "" ||
        grade !== "Tous les grades" ||
        status !== "Tous les statuts";

    const resetFilters = () => {
        setSearch("");
        setGrade("Tous les grades");
        setStatus("Tous les statuts");
    };

    return (
        <div className="space-y-4 m-5">
            {/* Barre de recherche et filtres */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row">
                    {/* Recherche */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            type="text"
                            placeholder="Rechercher par nom, prénom ou matricule..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-lg border bg-background pl-10 pr-10 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                title="Effacer"
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Grade */}
                    <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="h-10 cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    >
                        <option>Tous les grades</option>
                        <option>Capitaine</option>
                        <option>Commandant</option>
                        <option>Lieutenant</option>
                    </select>

                    {/* Statut */}
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-10 cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    >
                        <option>Tous les statuts</option>
                        <option>Actif</option>
                        <option>Inactif</option>
                    </select>

                    <button
                        type="button"
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:border-primary/40 hover:bg-muted"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filtres
                        {hasActiveFilters && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                {[search, grade, status].filter(
                                    (v, i) =>
                                        (i === 0 && v !== "") ||
                                        (i === 1 && v !== "Tous les grades") ||
                                        (i === 2 && v !== "Tous les statuts")
                                ).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Badge de réinitialisation */}
                {hasActiveFilters && (
                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {filteredPersonnels.length}
                            </span>{" "}
                            résultat(s) trouvé(s)
                        </p>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="text-xs font-medium text-primary transition hover:underline"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}
            </div>

            {/* Liste */}
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Matricule
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Nom & Prénoms
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Grade
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Fonction
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Statut
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {filteredPersonnels.length > 0 ? (
                                filteredPersonnels.map((personnel, index) => (
                                    <tr
                                        key={personnel.id}
                                        className="group transition hover:bg-muted/40"
                                    >
                                        <td className="px-4 py-4">
                                            <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-medium">
                                                {personnel.matricule}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                                        avatarColors[
                                                            index % avatarColors.length
                                                        ]
                                                    }`}
                                                >
                                                    {getInitials(
                                                        personnel.lastName,
                                                        personnel.firstNames
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {personnel.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {personnel.firstNames}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="text-sm">
                                                {personnel.grade}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-muted-foreground">
                                            {personnel.function}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    personnel.status === "Actif"
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-muted text-muted-foreground"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        personnel.status === "Actif"
                                                            ? "bg-emerald-500"
                                                            : "bg-muted-foreground/50"
                                                    }`}
                                                />
                                                {personnel.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    title="Voir"
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-600"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                <button
                                                    title="Modifier"
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-amber-500/10 hover:text-amber-600"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>

                                                <button
                                                    title="Supprimer"
                                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16">
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                                <Users className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Aucun personnel trouvé
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Essayez de modifier vos critères de recherche
                                                </p>
                                            </div>
                                            {hasActiveFilters && (
                                                <button
                                                    type="button"
                                                    onClick={resetFilters}
                                                    className="mt-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                                                >
                                                    Réinitialiser les filtres
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                        Affichage de{" "}
                        <span className="font-medium text-foreground">
                            {filteredPersonnels.length}
                        </span>{" "}
                        sur{" "}
                        <span className="font-medium text-foreground">
                            {personnels.length}
                        </span>{" "}
                        personnel(s)
                    </p>

                    <div className="flex items-center gap-1">
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                            disabled
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground">
                            1
                        </span>

                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-muted">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}