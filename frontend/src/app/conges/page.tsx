"use client";

import Sidebar from "@/app/components/sidebar/Sidebar";
import Conge from "./Conge";

export default function GradesPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={false} setIsOpen={function (value: boolean): void {
              throw new Error("Function not implemented.");
          } } />

      <main className="flex-1 overflow-x-hidden">
        <Conge />
      </main>
    </div>
  );
}