"use client";

import { useActionState, useEffect, useRef } from "react";

import type { AdminFormState } from "@/actions/admin-state";
import { initialAdminFormState } from "@/actions/admin-state";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCategory } from "@/lib/admin-catalog";

type CategoryFormProps = {
  action: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
  category?: AdminCategory;
  disabled?: boolean;
  disabledReason?: string;
  pendingLabel: string;
  submitLabel: string;
};

function getFieldError(state: AdminFormState, fieldName: string) {
  return state.fieldErrors?.[fieldName]?.[0];
}

export function CategoryForm({
  action,
  category,
  disabled = false,
  disabledReason,
  pendingLabel,
  submitLabel,
}: CategoryFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction] = useActionState(action, initialAdminFormState);

  useEffect(() => {
    if (!category && state.status === "success") {
      formRef.current?.reset();
    }
  }, [category, state.status]);

  return (
    <form action={formAction} className="space-y-5" ref={formRef}>
      {category ? <input name="categoryId" type="hidden" value={category.id} /> : null}

      <fieldset className="space-y-5 disabled:opacity-60" disabled={disabled}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={category ? `${category.id}-category-name` : "create-category-name"}>
              Nombre
            </label>
            <Input
              defaultValue={category?.name}
              id={category ? `${category.id}-category-name` : "create-category-name"}
              name="name"
              placeholder="Edicion limitada"
            />
            {getFieldError(state, "name") ? (
              <p className="text-sm text-[var(--accent-strong)]">{getFieldError(state, "name")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={category ? `${category.id}-category-slug` : "create-category-slug"}>
              Slug
            </label>
            <Input
              defaultValue={category?.slug}
              id={category ? `${category.id}-category-slug` : "create-category-slug"}
              name="slug"
              placeholder="edicion-limitada"
            />
            {getFieldError(state, "slug") ? (
              <p className="text-sm text-[var(--accent-strong)]">{getFieldError(state, "slug")}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_140px]">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={category ? `${category.id}-category-description` : "create-category-description"}>
              Descripcion
            </label>
            <Textarea
              defaultValue={category?.description}
              id={category ? `${category.id}-category-description` : "create-category-description"}
              name="description"
              placeholder="Contexto comercial o visual de la categoria."
            />
            {getFieldError(state, "description") ? (
              <p className="text-sm text-[var(--accent-strong)]">{getFieldError(state, "description")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={category ? `${category.id}-category-order` : "create-category-order"}>
              Orden
            </label>
            <Input
              defaultValue={category?.order ?? 0}
              id={category ? `${category.id}-category-order` : "create-category-order"}
              min="0"
              name="order"
              step="1"
              type="number"
            />
            {getFieldError(state, "order") ? (
              <p className="text-sm text-[var(--accent-strong)]">{getFieldError(state, "order")}</p>
            ) : null}
          </div>
        </div>

        {disabledReason ? (
          <p className="text-sm text-[var(--muted-foreground)]">{disabledReason}</p>
        ) : null}

        {state.status !== "idle" && state.message ? (
          <p className={state.status === "error" ? "text-sm text-[var(--accent-strong)]" : "text-sm text-[var(--foreground)]"}>
            {state.message}
          </p>
        ) : null}

        <FormSubmitButton pendingLabel={pendingLabel} type="submit" variant="accent">
          {submitLabel}
        </FormSubmitButton>
      </fieldset>
    </form>
  );
}