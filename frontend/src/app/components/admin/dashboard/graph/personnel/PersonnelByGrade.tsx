"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { grade: "Matelot", effectif: 42 },
  { grade: "Quartier-maître", effectif: 35 },
  { grade: "Second-maître", effectif: 28 },
  { grade: "Maître", effectif: 20 },
  { grade: "Lieutenant", effectif: 15 },
];

export default function PersonnelByGrade() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      {/* En-tête */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-white">
          👥 Personnel par grade
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          Répartition des personnels selon leur grade
        </p>
      </div>

      {/* Graphique */}
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: -25,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />

            <XAxis
              dataKey="grade"
              tick={{
                fill: "#94a3b8",
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill: "#64748b",
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={false}
              width={28}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              labelStyle={{
                color: "#fff",
              }}
            />

            <Bar
              dataKey="effectif"
              name="Personnel"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}