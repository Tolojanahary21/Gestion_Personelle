"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface StatusEntry {
  name: string;
  value: number;
  color: string;
}

const data: StatusEntry[] = [
  { name: "Actif", value: 350, color: "#2563eb" },
  { name: "Congé", value: 18, color: "#22c55e" },
  { name: "Disponibilité", value: 7, color: "#f59e0b" },
  { name: "Retraité", value: 5, color: "#64748b" },
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs shadow-lg">
      <span className="font-medium text-white">{entry.name}</span>
      <span className="ml-1.5 text-slate-400">{entry.value}</span>
    </div>
  );
}

export default function PersonnelStatus() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <PieChartIcon size={14} className="text-slate-400" />
            Statut du personnel
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Répartition des personnels par statut
          </p>
        </div>
      </div>

      <div className="relative h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{total}</span>
          <span className="text-[10px] text-slate-500">Personnel</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {data.map((item) => {
          const percent = ((item.value / total) * 100).toFixed(0);

          return (
            <div
              key={item.name}
              className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition hover:bg-white/5"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-xs text-slate-400">{item.name}</span>
              <span className="ml-auto shrink-0 text-xs font-medium text-white">
                {item.value}
              </span>
              <span className="shrink-0 text-[10px] text-slate-600">
                ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}