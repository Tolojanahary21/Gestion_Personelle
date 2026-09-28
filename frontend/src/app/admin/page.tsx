"use client";

import { useState } from "react";
import Sidebar from "@/app/components/sidebar/Sidebar";
import DashboardPage from "../components/admin/dashboard/page";

export default function AdminPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <main className="flex-1">
        <DashboardPage onMenuClick={() => setIsOpen(true)} />
      </main>
    </div>
  );
}
