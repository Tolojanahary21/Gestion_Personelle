"use client";

import Sidebar from "@/app/components/sidebar/Sidebar";
import Dossiers from "./Dossiers";

export default function DossiersPage() {
  return <div className="flex min-h-screen bg-slate-50"><Sidebar /><main className="min-w-0 flex-1 overflow-x-hidden"><Dossiers /></main></div>;
}
