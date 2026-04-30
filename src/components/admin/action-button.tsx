"use client";

import { useActionState } from "react";

import type { AdminFormState } from "@/actions/admin-state";
import { initialAdminFormState } from "@/actions/admin-state";
import { Button } from "@/components/ui/button";

type ActionButtonProps = {
  action: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
  confirmMessage?: string;
  fields: Array<{ name: string; value: string }>;
  idleLabel: string;
  pendingLabel: string;
};

export function ActionButton({ action, confirmMessage, fields, idleLabel, pendingLabel }: ActionButtonProps) {
  const [state, formAction, pending] = useActionState(action, initialAdminFormState);

  return (
    <form
      action={formAction}
      className="space-y-2"
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {fields.map((field) => (
        <input key={field.name} name={field.name} type="hidden" value={field.value} />
      ))}

      <Button disabled={pending} size="sm" type="submit" variant="outline">
        {pending ? pendingLabel : idleLabel}
      </Button>

      {state.status === "error" ? (
        <p className="text-sm text-[var(--accent-strong)]">{state.message}</p>
      ) : null}
    </form>
  );
}