"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Users } from "lucide-react";

interface GradeEntry {
  grade: string;
  effectif: number;
}

const data: GradeEntry[] = [
  { grade: "Matelot", effectif: 42 },
  { grade: "Quartier-maître", effectif: 35 },
  { grade: "Second-maître", effectif: 28 },
  { grade: "Maître", effectif: 20 },
  { grade: "Lieutenant", effectif: 15 },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs shadow-lg">
      <p className="font-medium text-white">{label}</p>
      <p className="mt-0.5 text-slate-400">
        <span className="font-semibold text-white">{payload[0].value}</span> personnels
      </p>
    </div>
  );
}

export default function PersonnelByGrade() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.effectif, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <Users size={14} className="text-slate-400" />
            Personnel par grade
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Répartition des personnels selon leur grade
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-400">
          {total} au total
        </span>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive && state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              } else {
                setActiveIndex(null);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="grade"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={40}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />

            <Bar dataKey="effectif" name="Personnel" radius={[4, 4, 0, 0]} barSize={28}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.grade}
                  fill={activeIndex === index ? "#3b82f6" : "#2563eb"}
                  fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}