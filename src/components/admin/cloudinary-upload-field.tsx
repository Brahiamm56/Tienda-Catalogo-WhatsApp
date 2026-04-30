"use client";

import { Upload, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CloudinaryUploadFieldProps = {
  cloudinaryEnabled: boolean;
  defaultPublicId?: string | null;
  defaultValue?: string;
  onImageChange?: (url: string) => void;
  folder?: string;
  urlFieldName?: string;
  publicIdFieldName?: string;
  previewVariant?: "wide" | "square";
};

type UploadSignatureResponse = {
  apiKey: string;
  cloudName: string;
  folder: string;
  signature: string;
  timestamp: number;
};

export function CloudinaryUploadField({
  cloudinaryEnabled,
  defaultPublicId,
  defaultValue = "",
  onImageChange,
  folder = "catalog/products",
  urlFieldName = "imageUrl",
  publicIdFieldName = "imagePublicId",
  previewVariant = "wide",
}: CloudinaryUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [publicId, setPublicId] = useState(defaultPublicId ?? "");
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    onImageChange?.(imageUrl);
  }, [imageUrl, onImageChange]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !cloudinaryEnabled) {
      return;
    }

    // Defense in depth (server enforces folder allowlist; Cloudinary preset should
    // also enforce these). Browser-side rejection avoids wasted signature requests.
    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const MAX_BYTES = 5 * 1024 * 1024;
    if (!ALLOWED_MIME.includes(file.type)) {
      setUploadError("Formato no permitido. Usa JPG, PNG, WEBP o AVIF.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError("La imagen supera 5 MB.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const signatureResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folder }),
      });

      if (!signatureResponse.ok) {
        const payload = (await signatureResponse.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No fue posible obtener la firma de upload.");
      }

      const signature = (await signatureResponse.json()) as UploadSignatureResponse;
      const uploadData = new FormData();

      uploadData.append("file", file);
      uploadData.append("api_key", signature.apiKey);
      uploadData.append("folder", signature.folder);
      uploadData.append("signature", signature.signature);
      uploadData.append("timestamp", String(signature.timestamp));

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        },
      );

      if (!uploadResponse.ok) {
        throw new Error("Cloudinary rechazo la imagen seleccionada.");
      }

      const payload = (await uploadResponse.json()) as {
        public_id: string;
        secure_url: string;
      };

      setImageUrl(payload.secure_url);
      setPublicId(payload.public_id);
      event.target.value = "";
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No fue posible subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input name={publicIdFieldName} type="hidden" value={publicId} />

      {/* File upload zone (primary) */}
      <input
        ref={fileInputRef}
        accept="image/*"
        capture={undefined}
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />

      {imageUrl ? (
        /* Preview with replace/remove */
        <div className={
          previewVariant === "square"
            ? "relative mx-auto w-full max-w-[260px] overflow-hidden rounded-xl border border-[var(--border)] bg-gray-50"
            : "relative overflow-hidden rounded-xl border border-[var(--border)] bg-gray-50"
        }>
          {/* eslint-disable-next-line @next/next/no-img-element -- Admin preview may point to arbitrary external URLs entered manually. */}
          <img
            alt="Preview"
            className={
              previewVariant === "square"
                ? "aspect-square w-full object-contain p-4"
                : "h-40 w-full object-cover"
            }
            src={imageUrl}
          />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-white"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Upload className="size-3" />
              Cambiar
            </button>
            <button
              className="rounded-lg bg-white/90 p-1.5 shadow-sm hover:bg-white"
              onClick={() => { setImageUrl(""); setPublicId(""); setUploadError(null); }}
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload zone */
        <button
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--border)] bg-gray-50 px-4 py-8 text-center transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!cloudinaryEnabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Upload className="size-5 text-[var(--muted-foreground)]" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isUploading ? "Subiendo imagen..." : "Subir desde archivo"}
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {cloudinaryEnabled
                ? "JPG, PNG, WEBP · desde tu PC o celular"
                : "Configura Cloudinary para habilitar el upload"}
            </p>
          </div>
        </button>
      )}

      {/* URL fallback */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--muted-foreground)]">o pega una URL</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <div className="flex items-center gap-2">
        <Input
          name={urlFieldName}
          onChange={(event) => { setImageUrl(event.target.value); setPublicId(""); }}
          placeholder="https://..."
          value={imageUrl}
        />
        {imageUrl ? (
          <Button
            onClick={() => { setImageUrl(""); setPublicId(""); setUploadError(null); }}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      {uploadError ? <p className="text-sm text-[var(--accent-strong)]">{uploadError}</p> : null}
    </div>
  );
}