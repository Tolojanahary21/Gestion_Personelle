"use client";

import Sidebar from "@/app/components/sidebar/Sidebar";
import Statistique from "./Statistique";

export default function PersonnelsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        <Statistique />
      </main>
    </div>
  );
}