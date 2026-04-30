"use client";

import { useActionState } from "react";

import type { AdminFormState } from "@/actions/admin-state";
import { initialAdminFormState } from "@/actions/admin-state";
import { Button } from "@/components/ui/button";

type StockAdjusterProps = {
  action: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
  currentStock: number;
  disabled?: boolean;
  productId: string;
};

const stockDeltas = [
  { label: "-1", value: -1 },
  { label: "+1", value: 1 },
  { label: "+5", value: 5 },
];

export function StockAdjuster({ action, currentStock, disabled = false, productId }: StockAdjusterProps) {
  const [state, formAction, pending] = useActionState(action, initialAdminFormState);

  return (
    <form action={formAction} className="space-y-2">
      <input name="productId" type="hidden" value={productId} />

      <div className="flex flex-wrap gap-2">
        {stockDeltas.map((item) => (
          <Button
            disabled={disabled || pending || (item.value < 0 && currentStock === 0)}
            key={item.value}
            name="delta"
            size="sm"
            type="submit"
            value={String(item.value)}
            variant="outline"
          >
            {pending ? "..." : item.label}
          </Button>
        ))}
      </div>

      {state.status !== "idle" && state.message ? (
        <p className={state.status === "error" ? "text-sm text-[var(--accent-strong)]" : "text-sm text-[var(--muted-foreground)]"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}