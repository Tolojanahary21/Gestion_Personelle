"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { mois: "Jan", effectif: 320 },
  { mois: "Fév", effectif: 328 },
  { mois: "Mar", effectif: 335 },
  { mois: "Avr", effectif: 342 },
  { mois: "Mai", effectif: 350 },
  { mois: "Juin", effectif: 356 },
  { mois: "Juil", effectif: 362 },
  { mois: "Août", effectif: 370 },
  { mois: "Sept", effectif: 380 },
];

export default function Effectifs() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-white">
          📈 Évolution des effectifs
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          Évolution du nombre de personnels au cours des derniers mois
        </p>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              dataKey="mois"
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

            <Line
              type="monotone"
              dataKey="effectif"
              name="Personnel"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#2563eb",
              }}
              activeDot={{
                r: 5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}