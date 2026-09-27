"use client";

import Sidebar from "@/app/components/sidebar/Sidebar";
import Personnel from "./Personnel";

export default function PersonnelsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        <Personnel />
      </main>
    </div>
  );
}