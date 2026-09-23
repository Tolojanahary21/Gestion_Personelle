"use client";

export default function TextPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className=" bg-blue-500 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Gestion du personnel
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Consultez, créez et gérez les fiches du personnel.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted">
                        Importer
                    </button>

                    <button className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted">
                        Exporter
                    </button>

                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                        + Nouveau personnel
                    </button>
                </div>
            </div>
        </div>
    );
}