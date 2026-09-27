"use client";

import PersonnelByGrade from "./personnel/PersonnelByGrade";
import PersonnelStatus from "./personnel/PersonnelStatus";
import type { DashboardData } from "../page";

export default function Personnel({ data }: { data: DashboardData }) {
  return <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-2"><PersonnelByGrade personnel={data.personnel} grades={data.grades} /><PersonnelStatus personnel={data.personnel} military={data.military} /></div>;
}
