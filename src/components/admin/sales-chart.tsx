"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SalesChartProps {
  data: Array<{
    name: string;
    sales: number;
  }>;
  currency?: string;
  locale?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ value?: unknown }>;
  currency: string;
  locale: string;
}

function CustomTooltip({ active, payload, label, currency, locale }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const raw = payload[0]?.value;
    const value = typeof raw === "number" ? raw : Number(typeof raw === "string" ? raw : 0);
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <p className="mb-1 text-sm text-slate-500">{label}</p>
        <p className="font-[family-name:var(--font-display)] font-bold text-blue-600">
          {new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
          }).format(value)}
        </p>
      </div>
    );
  }

  return null;
}

export default function SalesChart({
  data,
  currency = "COP",
  locale = "es-CO",
}: SalesChartProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="mt-4 h-[300px] w-full rounded-2xl bg-slate-50" />;
  }

  const formatTick = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
    return String(value);
  };

  return (
    <div className="mt-4 h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />

          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatTick}
            dx={-10}
          />

          <Tooltip
            content={(props) => (
              <CustomTooltip {...props} currency={currency} locale={locale} />
            )}
            cursor={{ stroke: "#e2e8f0" }}
          />

          <Area
            type="monotone"
            dataKey="sales"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSales)"
            activeDot={{ r: 6, strokeWidth: 0, fill: "#0ea5e9" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
