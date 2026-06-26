"use client";

import { Upload, X, GripVertical, Plus } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

type ImageEntry = {
  url: string;
  publicId: string;
  alt: string;
};

type MultiImageUploadFieldProps = {
  cloudinaryEnabled: boolean;
  defaultImages?: { url: string; publicId?: string | null; alt?: string | null }[];
  folder?: string;
};

type UploadSignatureResponse = {
  apiKey: string;
  cloudName: string;
  folder: string;
  signature: string;
  timestamp: number;
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

export function MultiImageUploadField({
  cloudinaryEnabled,
  defaultImages = [],
  folder = "catalog/products",
}: MultiImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<ImageEntry[]>(
    defaultImages.map((img) => ({
      url: img.url,
      publicId: img.publicId ?? "",
      alt: img.alt ?? "",
    }))
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Sync hidden input with form state
  useEffect(() => {
    const hidden = document.getElementById("imagesJson") as HTMLInputElement | null;
    if (hidden) {
      hidden.value = JSON.stringify(images.filter((img) => img.url));
    }
  }, [images]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !cloudinaryEnabled) return;

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
        headers: { "Content-Type": "application/json" },
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
        { method: "POST", body: uploadData }
      );

      if (!uploadResponse.ok) {
        throw new Error("Cloudinary rechazó la imagen seleccionada.");
      }

      const payload = (await uploadResponse.json()) as {
        public_id: string;
        secure_url: string;
      };

      setImages((prev) => [
        ...prev,
        { url: payload.secure_url, publicId: payload.public_id, alt: "" },
      ]);
      event.target.value = "";
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No fue posible subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAlt = (index: number, alt: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, alt } : img)));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const addUrlImage = () => {
    setImages((prev) => [...prev, { url: "", publicId: "", alt: "" }]);
  };

  const updateUrl = (index: number, url: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, url, publicId: "" } : img)));
  };

  return (
    <div className="space-y-3">
      <input id="imagesJson" name="imagesJson" type="hidden" value={JSON.stringify(images.filter((img) => img.url))} />

      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />

      {/* Image list */}
      {images.length > 0 ? (
        <div className="space-y-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2"
              draggable={draggedIndex === i}
              onDragStart={() => setDraggedIndex(i)}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedIndex !== null && draggedIndex !== i) {
                  moveImage(draggedIndex, i);
                }
                setDraggedIndex(null);
              }}
            >
              {/* Drag handle + order number */}
              <div className="flex shrink-0 items-center gap-1">
                <GripVertical className="size-4 cursor-grab text-[var(--muted-foreground)]" />
                <span className="flex size-5 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[10px] font-bold text-[var(--accent)]">
                  {i + 1}
                </span>
              </div>

              {/* Preview */}
              {img.url ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-strong)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={img.alt || `Imagen ${i + 1}`} className="h-full w-full object-cover" src={img.url} />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--surface-strong)]">
                  <Upload className="size-4 text-[var(--muted-foreground)]" />
                </div>
              )}

              {/* URL input or alt text */}
              <div className="flex flex-1 flex-col gap-1">
                {img.url ? (
                  <Input
                    className="h-8 text-xs"
                    onChange={(e) => updateAlt(i, e.target.value)}
                    placeholder={`Texto alternativo${i === 0 ? " (imagen principal)" : ""}`}
                    value={img.alt}
                  />
                ) : (
                  <Input
                    className="h-8 text-xs"
                    onChange={(e) => updateUrl(i, e.target.value)}
                    placeholder="https://..."
                    value={img.url}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                {i > 0 && (
                  <button
                    className="rounded-lg p-1 text-[var(--muted-foreground)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
                    onClick={() => moveImage(i, i - 1)}
                    title="Mover izquierda"
                    type="button"
                  >
                    <span className="text-xs">←</span>
                  </button>
                )}
                {i < images.length - 1 && (
                  <button
                    className="rounded-lg p-1 text-[var(--muted-foreground)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
                    onClick={() => moveImage(i, i + 1)}
                    title="Mover derecha"
                    type="button"
                  >
                    <span className="text-xs">→</span>
                  </button>
                )}
                <button
                  className="rounded-lg p-1 text-[var(--muted-foreground)] transition hover:bg-red-50 hover:text-red-500"
                  onClick={() => removeImage(i)}
                  title="Eliminar imagen"
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Add buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!cloudinaryEnabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Upload className="size-4" />
          {isUploading ? "Subiendo..." : "Subir imagen"}
        </button>
        <button
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium transition-colors hover:border-[var(--accent)]/50"
          onClick={addUrlImage}
          type="button"
        >
          <Plus className="size-4" />
          Pegar URL
        </button>
      </div>

      {!cloudinaryEnabled && (
        <p className="text-xs text-[var(--muted-foreground)]">
          Configura Cloudinary para habilitar el upload desde archivo.
        </p>
      )}

      {uploadError ? <p className="text-sm text-[var(--accent-strong)]">{uploadError}</p> : null}
    </div>
  );
}
