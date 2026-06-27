"use server";

import { revalidatePath } from "next/cache";

import type { AdminFormState } from "@/actions/admin-state";
import { requireAdminSession } from "@/lib/admin";
import { cloudinary } from "@/lib/cloudinary";
import { isCloudinaryConfigured, isDatabaseConfigured } from "@/lib/env";
import { logAndMaskError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { sanitizeWhatsappNumber } from "@/lib/utils";
import { categorySchema } from "@/schemas/category";
import { productSchema } from "@/schemas/product";
import { storeSettingsSchema } from "@/schemas/settings";
import { bannerSchema } from "@/schemas/banner";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildErrorState(message: string, fieldErrors?: Record<string, string[] | undefined>): AdminFormState {
  return {
    fieldErrors,
    message,
    submissionKey: Date.now(),
    status: "error",
  };
}

function buildSuccessState(message: string): AdminFormState {
  return {
    message,
    submissionKey: Date.now(),
    status: "success",
  };
}

function ensureDatabaseReady() {
  if (!isDatabaseConfigured()) {
    return buildErrorState("Configura una DATABASE_URL real antes de guardar cambios persistentes.");
  }

  return null;
}

function revalidateAdminRoutes(productSlug?: string) {
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/ajustes");
  revalidatePath("/admin/banners");

  if (productSlug) {
    revalidatePath(`/productos/${productSlug}`);
  }
}

function mapPrismaError(error: unknown, fallbackMessage: string) {
  const masked = logAndMaskError("admin-action", error, fallbackMessage);
  return buildErrorState(`${masked.message} (cod. ${masked.code})`);
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-");
}

export async function createCategoryQuickAction(_: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdminSession();

  const databaseError = ensureDatabaseReady();

  if (databaseError) {
    return databaseError;
  }

  const name = getString(formData, "name").trim();

  if (name.length < 2) {
    return buildErrorState("El nombre debe tener al menos 2 caracteres.", { name: ["Mínimo 2 caracteres."] });
  }

  const slug = toSlug(name);

  try {
    const category = await prisma.category.create({
      data: { name, slug, order: 0 },
    });

    revalidateAdminRoutes();

    return {
      data: {
        description: category.description ?? "Categoria administrable desde el panel.",
        id: category.id,
        name: category.name,
        order: category.order,
        productCount: 0,
        slug: category.slug,
      },
      message: "Categoría creada.",
      status: "success",
    };
  } catch (error) {
    return mapPrismaError(error, "No fue posible crear la categoría.");
  }
}

function getProductPayload(formData: FormData) {
  const price = Number(getString(formData, "price"));
  const name = getString(formData, "name");
  const slugFromForm = getString(formData, "slug");

  // Parse multiple images from JSON hidden field
  const imagesJson = getString(formData, "imagesJson");
  let images: { url: string; publicId: string; alt: string }[] = [];
  if (imagesJson) {
    try {
      const parsed = JSON.parse(imagesJson) as { url: string; publicId?: string; alt?: string }[];
      images = parsed
        .filter((img) => img && typeof img.url === "string" && img.url)
        .map((img) => ({
          url: img.url,
          publicId: img.publicId ?? "",
          alt: img.alt ?? "",
        }));
    } catch {}
  }

  // Backward compat: if no images array but single imageUrl, use that
  const singleImageUrl = getString(formData, "imageUrl");
  if (images.length === 0 && singleImageUrl) {
    images = [{
      url: singleImageUrl,
      publicId: getString(formData, "imagePublicId"),
      alt: getString(formData, "imageAlt"),
    }];
  }

  return {
    categoryId: getString(formData, "categoryId"),
    description: getString(formData, "description"),
    featured: formData.get("featured") === "on",
    imageAlt: images[0]?.alt ?? "",
    imagePublicId: images[0]?.publicId ?? "",
    imageUrl: images[0]?.url ?? "",
    images,
    name,
    priceCents: Number.isFinite(price) ? Math.round(price * 100) : Number.NaN,
    sku: getString(formData, "sku"),
    slug: slugFromForm || toSlug(name),
    status: getString(formData, "status") || "PUBLISHED",
    stock: Number(getString(formData, "stock")),
    gender: getString(formData, "gender") || null,
  };
}

async function syncProductImages(args: {
  images: { url: string; publicId: string; alt: string }[];
  productId: string;
}) {
  const existingImages = await prisma.productImage.findMany({
    where: { productId: args.productId },
    orderBy: { sortOrder: "asc" },
  });

  // Delete images that are no longer in the new list
  const newUrls = new Set(args.images.map((img) => img.url));
  for (const existing of existingImages) {
    if (!newUrls.has(existing.url)) {
      await prisma.productImage.delete({ where: { id: existing.id } });
      if (existing.publicId && isCloudinaryConfigured()) {
        await cloudinary.uploader.destroy(existing.publicId).catch(() => null);
      }
    }
  }

  // Upsert images in order
  for (let i = 0; i < args.images.length; i++) {
    const newImg = args.images[i];
    const existing = existingImages.find((e) => e.url === newImg.url);

    if (existing) {
      // Update existing image (sortOrder + alt)
      await prisma.productImage.update({
        where: { id: existing.id },
        data: {
          alt: newImg.alt || null,
          sortOrder: i + 1,
        },
      });
    } else {
      // Create new image
      await prisma.productImage.create({
        data: {
          alt: newImg.alt || null,
          productId: args.productId,
          publicId: newImg.publicId || null,
          sortOrder: i + 1,
          url: newImg.url,
        },
      });
    }
  }
}

export async function createProductAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();

  const databaseError = ensureDatabaseReady();

  if (databaseError) {
    return databaseError;
  }

  const parsed = productSchema.safeParse(getProductPayload(formData));

  if (!parsed.success) {
    return buildErrorState(
      "Revisa los campos del producto antes de guardarlo.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const product = await prisma.product.create({
      data: {
        categoryId: parsed.data.categoryId,
        description: parsed.data.description,
        featured: parsed.data.featured,
        name: parsed.data.name,
        priceCents: parsed.data.priceCents,
        sku: parsed.data.sku || null,
        slug: parsed.data.slug,
        status: parsed.data.status,
        stock: parsed.data.stock,
        gender: parsed.data.gender || null,
      },
    });

    await syncProductImages({
      images: parsed.data.images?.length
        ? parsed.data.images.map((img) => ({ url: img.url, publicId: img.publicId ?? "", alt: img.alt ?? "" }))
        : (parsed.data.imageUrl
          ? [{ url: parsed.data.imageUrl, publicId: parsed.data.imagePublicId ?? "", alt: parsed.data.imageAlt || parsed.data.name }]
          : []),
      productId: product.id,
    });

    revalidateAdminRoutes(product.slug);
    return buildSuccessState("Producto creado correctamente.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible crear el producto.");
  }
}

export async function updateProductAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();

  const databaseError = ensureDatabaseReady();

  if (databaseError) {
    return databaseError;
  }

  const productId = getString(formData, "productId");

  if (!productId) {
    return buildErrorState("No se encontro el producto a actualizar.");
  }

  const parsed = productSchema.safeParse(getProductPayload(formData));

  if (!parsed.success) {
    return buildErrorState(
      "Revisa los campos del producto antes de actualizarlo.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        categoryId: parsed.data.categoryId,
        description: parsed.data.description,
        featured: parsed.data.featured,
        name: parsed.data.name,
        priceCents: parsed.data.priceCents,
        sku: parsed.data.sku || null,
        slug: parsed.data.slug,
        status: parsed.data.status,
        stock: parsed.data.stock,
        gender: parsed.data.gender || null,
      },
    });

    await syncProductImages({
      images: parsed.data.images?.length
        ? parsed.data.images.map((img) => ({ url: img.url, publicId: img.publicId ?? "", alt: img.alt ?? "" }))
        : (parsed.data.imageUrl
          ? [{ url: parsed.data.imageUrl, publicId: parsed.data.imagePublicId ?? "", alt: parsed.data.imageAlt || parsed.data.name }]
          : []),
      productId,
    });

    revalidateAdminRoutes(product.slug);
    return buildSuccessState("Producto actualizado.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible actualizar el producto.");
  }
}

export async function updateProductStockAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();

  const databaseError = ensureDatabaseReady();

  if (databaseError) {
    return databaseError;
  }

  const productId = getString(formData, "productId");
  const delta = Number(getString(formData, "delta"));

  if (!productId) {
    return buildErrorState("No se encontro el producto para ajustar stock.");
  }

  if (!Number.isInteger(delta) || delta === 0) {
    return buildErrorState("No se recibio un ajuste de stock valido.");
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
      },
    });

    if (!product) {
      return buildErrorState("El producto ya no existe o fue eliminado.");
    }

    const nextStock = Math.max(0, product.stock + delta);

    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: nextStock,
      },
    });

    revalidateAdminRoutes(product.slug);

    if (nextStock === product.stock) {
      return buildSuccessState(`${product.name} ya estaba sin stock.`);
    }

    return buildSuccessState(`Stock de ${product.name} actualizado a ${nextStock} unidades.`);
  } catch (error) {
    return mapPrismaError(error, "No fue posible ajustar el stock.");
  }
}

export async function deleteProductAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();

  const databaseError = ensureDatabaseReady();

  if (databaseError) {
    return databaseError;
  }

  const productId = getString(formData, "productId");

  if (!productId) {
    return buildErrorState("No se encontro el producto a eliminar.");
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          select: {
            publicId: true,
          },
        },
      },
    });

    if (!product) {
      return buildErrorState("El producto ya no existe o fue eliminado previamente.");
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    if (isCloudinaryConfigured()) {
      await Promise.all(
        product.images
          .map((image) => image.publicId)
          .filter((value): value is string => Boolean(value))
          .map((publicId) => cloudinary.uploader.destroy(publicId).catch(() => null)),
      );
    }

    revalidateAdminRoutes(product.slug);
    return buildSuccessState("Producto eliminado.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible eliminar el producto.");
  }
}

export async function createCategoryAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();

  const databaseError = ensureDatabaseReady();

  if (databaseError) {
    return databaseError;
  }

  const parsed = categorySchema.safeParse({
    description: getString(formData, "description").trim(),
    name: getString(formData, "name").trim(),
    order: Number(getString(formData, "order")),
    slug: getString(formData, "slug").trim(),
  });

  if (!parsed.success) {
    return buildErrorState(
      "Revisa los datos de la categoria antes de guardarla.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    await prisma.category.create({
      data: parsed.data,
    });

    revalidateAdminRoutes();
    return buildSuccessState("Categoria creada.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible crear la categoria.");
  }
}

export async function updateCategoryAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();

  const databaseError = ensureDatabaseReady();

  if (databaseError) {
    return databaseError;
  }

  const categoryId = getString(formData, "categoryId");

  if (!categoryId) {
    return buildErrorState("No se encontro la categoria a actualizar.");
  }

  const parsed = categorySchema.safeParse({
    description: getString(formData, "description").trim(),
    name: getString(formData, "name").trim(),
    order: Number(getString(formData, "order")),
    slug: getString(formData, "slug").trim(),
  });

  if (!parsed.success) {
    return buildErrorState(
      "Revisa los datos de la categoria antes de actualizarla.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: parsed.data,
    });

    revalidateAdminRoutes();
    return buildSuccessState("Categoria actualizada.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible actualizar la categoria.");
  }
}

export async function deleteCategoryAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();

  const databaseError = ensureDatabaseReady();

  if (databaseError) {
    return databaseError;
  }

  const categoryId = getString(formData, "categoryId");

  if (!categoryId) {
    return buildErrorState("No se encontro la categoria a eliminar.");
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { products: true }
    });

    if (!category) {
      return buildErrorState("La categoria no existe.");
    }

    // Reassign products to a default category if they exist
    if (category.products.length > 0) {
      let defaultCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: "sin-categoria" },
            { id: { not: categoryId } }
          ]
        },
        orderBy: { order: "asc" }
      });

      if (!defaultCategory) {
        defaultCategory = await prisma.category.create({
          data: {
            name: "Sin Categoría",
            slug: "sin-categoria",
            description: "Productos sin categoria asignada",
            order: 99
          }
        });
      }

      await prisma.product.updateMany({
        where: { categoryId },
        data: { categoryId: defaultCategory.id }
      });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidateAdminRoutes();
    return buildSuccessState("Categoria eliminada.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible eliminar la categoria.");
  }
}

export async function updateStoreSettingsAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();

  const databaseError = ensureDatabaseReady();

  if (databaseError) {
    return databaseError;
  }

  const rawAccent = getString(formData, "themeAccent").trim();
  const rawAccentStrong = getString(formData, "themeAccentStrong").trim();
  const rawLogoUrl = getString(formData, "logoUrl").trim();
  const rawLogoPublicId = getString(formData, "logoPublicId").trim();

  // Parse business hours from form
  const rawBusinessHours = getString(formData, "businessHours").trim();
  let businessHours: { day: string; open: string; close: string; closed?: boolean }[] | undefined;
  if (rawBusinessHours) {
    try {
      businessHours = JSON.parse(rawBusinessHours);
    } catch {
      businessHours = undefined;
    }
  }

  // Parse location
  const rawLocationAddress = getString(formData, "locationAddress").trim();
  const rawLocationLat = getString(formData, "locationLat").trim();
  const rawLocationLng = getString(formData, "locationLng").trim();

  const rawSocialFacebook = getString(formData, "socialFacebook").trim();
  const rawSocialInstagram = getString(formData, "socialInstagram").trim();
  const rawFreeShippingThreshold = getString(formData, "freeShippingThreshold").trim();

  // Parse theme design tokens
  const rawThemeBg = getString(formData, "themeBackground").trim();
  const rawCardBg = getString(formData, "themeCardBg").trim();
  const rawCardBorder = getString(formData, "themeCardBorder").trim();
  const rawCardRadius = getString(formData, "themeCardRadius").trim();
  const rawButtonRadius = getString(formData, "themeButtonRadius").trim();

  const parsed = storeSettingsSchema.safeParse({
    currency: getString(formData, "currency").toUpperCase(),
    description: getString(formData, "description"),
    name: getString(formData, "name"),
    whatsappNumber: sanitizeWhatsappNumber(getString(formData, "whatsappNumber")),
    logoUrl: rawLogoUrl || undefined,
    logoPublicId: rawLogoPublicId || undefined,
    themeAccent: rawAccent || undefined,
    themeAccentStrong: rawAccentStrong || undefined,
    themeBackground: rawThemeBg || undefined,
    themeCardBg: rawCardBg || undefined,
    themeCardBorder: rawCardBorder || undefined,
    themeCardRadius: rawCardRadius || undefined,
    themeButtonRadius: rawButtonRadius || undefined,
    businessHours: businessHours || undefined,
    locationAddress: rawLocationAddress || undefined,
    locationLat: rawLocationLat ? Number(rawLocationLat) : undefined,
    locationLng: rawLocationLng ? Number(rawLocationLng) : undefined,
    socialFacebook: rawSocialFacebook || undefined,
    socialInstagram: rawSocialInstagram || undefined,
    freeShippingThresholdCents: rawFreeShippingThreshold
      ? Math.round(Number(rawFreeShippingThreshold) * 100)
      : undefined,
  });

  if (!parsed.success) {
    return buildErrorState(
      "Revisa los ajustes de la tienda antes de guardarlos.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    await prisma.setting.upsert({
      where: { key: "store" },
      update: { value: parsed.data },
      create: {
        key: "store",
        value: parsed.data,
      },
    });

    revalidateAdminRoutes();
    return buildSuccessState("Ajustes actualizados.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible guardar los ajustes.");
  }
}

function getBannerPayload(formData: FormData) {
  return {
    title: getString(formData, "title"),
    subtitle: getString(formData, "subtitle"),
    ctaLabel: getString(formData, "ctaLabel"),
    ctaHref: getString(formData, "ctaHref"),
    imageUrl: getString(formData, "imageUrl"),
    imagePublicId: getString(formData, "imagePublicId"),
    order: Number(getString(formData, "order")) || 0,
    active: formData.get("active") === "on",
  };
}

export async function createBannerAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();
  const databaseError = ensureDatabaseReady();
  if (databaseError) return databaseError;

  const parsed = bannerSchema.safeParse(getBannerPayload(formData));
  if (!parsed.success) {
    return buildErrorState("Revisa los datos del banner.", parsed.error.flatten().fieldErrors);
  }

  try {
    await prisma.heroBanner.create({
      data: {
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || null,
        ctaLabel: parsed.data.ctaLabel || null,
        ctaHref: parsed.data.ctaHref || null,
        imageUrl: parsed.data.imageUrl,
        imagePublicId: parsed.data.imagePublicId || null,
        order: parsed.data.order,
        active: parsed.data.active,
      },
    });
    revalidateAdminRoutes();
    return buildSuccessState("Banner creado.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible crear el banner.");
  }
}

export async function updateBannerAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();
  const databaseError = ensureDatabaseReady();
  if (databaseError) return databaseError;

  const bannerId = getString(formData, "bannerId");
  if (!bannerId) return buildErrorState("No se encontro el banner a actualizar.");

  const parsed = bannerSchema.safeParse(getBannerPayload(formData));
  if (!parsed.success) {
    return buildErrorState("Revisa los datos del banner.", parsed.error.flatten().fieldErrors);
  }

  try {
    await prisma.heroBanner.update({
      where: { id: bannerId },
      data: {
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || null,
        ctaLabel: parsed.data.ctaLabel || null,
        ctaHref: parsed.data.ctaHref || null,
        imageUrl: parsed.data.imageUrl,
        imagePublicId: parsed.data.imagePublicId || null,
        order: parsed.data.order,
        active: parsed.data.active,
      },
    });
    revalidateAdminRoutes();
    return buildSuccessState("Banner actualizado.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible actualizar el banner.");
  }
}

export async function deleteBannerAction(_: AdminFormState, formData: FormData) {
  await requireAdminSession();
  const databaseError = ensureDatabaseReady();
  if (databaseError) return databaseError;

  const bannerId = getString(formData, "bannerId");
  if (!bannerId) return buildErrorState("No se encontro el banner a eliminar.");

  try {
    await prisma.heroBanner.delete({ where: { id: bannerId } });
    revalidateAdminRoutes();
    return buildSuccessState("Banner eliminado.");
  } catch (error) {
    return mapPrismaError(error, "No fue posible eliminar el banner.");
  }
}
