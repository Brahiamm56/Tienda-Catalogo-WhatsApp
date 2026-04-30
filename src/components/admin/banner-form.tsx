"use client";

import { useActionState, useCallback, useState } from "react";

import type { AdminFormState } from "@/actions/admin-state";
import { initialAdminFormState } from "@/actions/admin-state";
import { BannerPreview } from "@/components/admin/banner-preview";
import { CloudinaryUploadField } from "@/components/admin/cloudinary-upload-field";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminBanner } from "@/lib/admin-catalog";

type BannerFormProps = {
  action: (state: AdminFormState, payload: FormData) => Promise<AdminFormState>;
  banner?: AdminBanner;
  cloudinaryEnabled: boolean;
  disabled?: boolean;
  pendingLabel: string;
  submitLabel: string;
  showPreview?: boolean;
};

function getFieldError(state: AdminFormState, fieldName: string) {
  return state.fieldErrors?.[fieldName]?.[0];
}

export function BannerForm({
  action,
  banner,
  cloudinaryEnabled,
  disabled = false,
  pendingLabel,
  submitLabel,
  showPreview = false,
}: BannerFormProps) {
  const [state, formAction] = useActionState(action, initialAdminFormState);
  const formKey = banner ? banner.id : `create-banner-${state.submissionKey ?? 0}`;

  return (
    <BannerFormInner
      key={formKey}
      banner={banner}
      cloudinaryEnabled={cloudinaryEnabled}
      disabled={disabled}
      formAction={formAction}
      pendingLabel={pendingLabel}
      showPreview={showPreview}
      state={state}
      submitLabel={submitLabel}
    />
  );
}

type BannerFormInnerProps = Omit<BannerFormProps, "action"> & {
  formAction: (payload: FormData) => void;
  state: AdminFormState;
};

function BannerFormInner({
  banner,
  cloudinaryEnabled,
  disabled = false,
  formAction,
  pendingLabel,
  showPreview = false,
  state,
  submitLabel,
}: BannerFormInnerProps) {

  const [title, setTitle] = useState(banner?.title ?? "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [ctaLabel, setCtaLabel] = useState(banner?.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(banner?.ctaHref ?? "");
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl ?? "");

  const handleImageChange = useCallback((url: string) => setImageUrl(url), []);

  const idPrefix = banner ? banner.id : "create-banner";

  const formNode = (
    <form action={formAction} className="space-y-5">
      {banner ? <input name="bannerId" type="hidden" value={banner.id} /> : null}

      <fieldset className="space-y-5 disabled:opacity-60" disabled={disabled}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`${idPrefix}-title`}>Título</label>
          <Input
            id={`${idPrefix}-title`}
            name="title"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nueva colección"
            value={title}
          />
          {getFieldError(state, "title") ? (
            <p className="text-sm text-[var(--accent-strong)]">{getFieldError(state, "title")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`${idPrefix}-subtitle`}>Subtítulo</label>
          <Textarea
            id={`${idPrefix}-subtitle`}
            name="subtitle"
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Texto secundario opcional"
            value={subtitle}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`${idPrefix}-ctaLabel`}>Texto del botón</label>
            <Input
              id={`${idPrefix}-ctaLabel`}
              name="ctaLabel"
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Ver catálogo"
              value={ctaLabel}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`${idPrefix}-ctaHref`}>Enlace del botón</label>
            <Input
              id={`${idPrefix}-ctaHref`}
              name="ctaHref"
              onChange={(e) => setCtaHref(e.target.value)}
              placeholder="/productos"
              value={ctaHref}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Imagen del banner</label>
          <CloudinaryUploadField
            cloudinaryEnabled={cloudinaryEnabled}
            defaultPublicId={banner?.imagePublicId}
            defaultValue={banner?.imageUrl}
            onImageChange={handleImageChange}
          />
          {getFieldError(state, "imageUrl") ? (
            <p className="text-sm text-[var(--accent-strong)]">{getFieldError(state, "imageUrl")}</p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-1 md:items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              defaultChecked={banner?.active ?? true}
              name="active"
              type="checkbox"
            />
            Banner activo
          </label>
        </div>

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

  if (!showPreview) {
    return formNode;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
      {formNode}
      <div className="lg:sticky lg:top-4">
        <BannerPreview
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          imageUrl={imageUrl}
          subtitle={subtitle}
          title={title}
        />
      </div>
    </div>
  );
}
