"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface EffectifPoint {
  mois: string;
  effectif: number;
}

const data: EffectifPoint[] = [
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
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-white">
        {payload[0].value} <span className="font-normal text-slate-400">personnels</span>
      </p>
    </div>
  );
}

export default function Effectifs() {
  const first = data[0].effectif;
  const last = data[data.length - 1].effectif;
  const growth = (((last - first) / first) * 100).toFixed(1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">Évolution des effectifs</h2>
          <p className="mt-1 text-xs text-slate-500">
            Évolution du nombre de personnels au cours des derniers mois
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
            <TrendingUp size={12} />+{growth}%
          </span>
          <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="effectifGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

            <XAxis
              dataKey="mois"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={35}
              domain={["dataMin - 10", "dataMax + 10"]}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }} />

            <Area
              type="monotone"
              dataKey="effectif"
              name="Personnel"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#effectifGradient)"
              dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}