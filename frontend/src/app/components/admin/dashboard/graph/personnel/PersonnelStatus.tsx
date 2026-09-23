"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Actif", value: 350 },
  { name: "Congé", value: 18 },
  { name: "Disponibilité", value: 7 },
  { name: "Retraité", value: 5 },
];

const COLORS = [
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#64748b",
];

export default function PersonnelStatus() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      {/* En-tête */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-white">
          📊 Statut du personnel
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          Répartition des personnels par statut
        </p>
      </div>

      {/* Graphique */}
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
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Total au centre */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">
            {total}
          </span>

          <span className="text-[10px] text-slate-500">
            Personnel
          </span>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />

            <span className="text-xs text-slate-400">
              {item.name}
            </span>

            <span className="ml-auto text-xs font-medium text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}