import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Accent = "blue" | "violet" | "emerald" | "amber" | "rose" | "teal";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: Accent;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  className?: string;
}

const ACCENT_STYLES: Record<Accent, { bg: string; ring: string }> = {
  blue: { bg: "bg-gradient-to-br from-blue-500 to-blue-600", ring: "shadow-blue-500/30" },
  violet: { bg: "bg-gradient-to-br from-violet-500 to-fuchsia-500", ring: "shadow-violet-500/30" },
  emerald: { bg: "bg-gradient-to-br from-emerald-500 to-teal-500", ring: "shadow-emerald-500/30" },
  amber: { bg: "bg-gradient-to-br from-amber-400 to-orange-500", ring: "shadow-amber-500/30" },
  rose: { bg: "bg-gradient-to-br from-rose-500 to-pink-500", ring: "shadow-rose-500/30" },
  teal: { bg: "bg-gradient-to-br from-teal-500 to-cyan-500", ring: "shadow-teal-500/30" },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  accent = "blue",
  change,
  className,
}: StatsCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900">
            {value}
          </h3>

          {change && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium">
              <span
                className={
                  change.trend === "up"
                    ? "text-emerald-600"
                    : change.trend === "down"
                      ? "text-rose-600"
                      : "text-slate-400"
                }
              >
                {change.trend === "up" ? "+" : ""}
                {change.value}%
              </span>
              <span className="text-slate-400">vs mes anterior</span>
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
            styles.bg,
            styles.ring,
          )}
        >
          <Icon className="size-5" strokeWidth={2.25} />
        </div>
      </div>
    </div>
  );
}
