import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">{label}</p>
          <CardTitle className="mt-3 text-4xl">{value}</CardTitle>
        </div>
        <div className="rounded-full border border-[var(--border)] p-2 text-[var(--muted-foreground)]">
          <ArrowUpRight className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{detail}</p>
      </CardContent>
    </Card>
  );
}