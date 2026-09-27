"use client";

import Sidebar from "@/app/components/sidebar/Sidebar";
import Conge from "./Conge";

export default function GradesPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        <Conge />
      </main>
    </div>
  );
}
