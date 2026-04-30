import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { storeSettingsSchema, type StoreSettings } from "@/schemas/settings";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: {
    name: string;
    slug: string;
  };
  priceCents: number;
  stock: number;
  featured: boolean;
  image: string;
  images?: { url: string; alt: string }[];
  accent: string;
  isNew?: boolean;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  order: number;
};

const demoProducts: CatalogProduct[] = [
  {
    id: "camisa-atelier",
    slug: "camisa-atelier",
    name: "Camisa Atelier",
    description: "Silueta limpia, textura premium y narrativa visual lista para vender por WhatsApp.",
    category: { name: "Nuevos ingresos", slug: "nuevos-ingresos" },
    priceCents: 129900,
    stock: 8,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    accent: "from-[#f6d0c7] via-[#fff8f5] to-[#d9ece8]",
  },
  {
    id: "chaqueta-prisma",
    slug: "chaqueta-prisma",
    name: "Chaqueta Prisma",
    description: "Una pieza editorial para tiendas que quieren verse modernas sin caer en lo generico.",
    category: { name: "Edicion limitada", slug: "edicion-limitada" },
    priceCents: 249900,
    stock: 4,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    accent: "from-[#d7dfc8] via-[#f8f6ef] to-[#f4c6bb]",
  },
  {
    id: "bolso-elemental",
    slug: "bolso-elemental",
    name: "Bolso Elemental",
    description: "Accesorio pensado para mostrar stock, precio y accion directa sin friccion.",
    category: { name: "Accesorios", slug: "accesorios" },
    priceCents: 189900,
    stock: 12,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
    accent: "from-[#f3dfc3] via-[#faf7f1] to-[#d5e2f4]",
  },
  {
    id: "tenis-solar",
    slug: "tenis-solar",
    name: "Tenis Solar",
    description: "Base ideal para marcas urbanas, deportivas o concept stores con enfoque visual.",
    category: { name: "Nuevos ingresos", slug: "nuevos-ingresos" },
    priceCents: 219900,
    stock: 6,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    accent: "from-[#ffd0bf] via-[#fff5ee] to-[#d7e4de]",
  },
];

const demoCategories: CatalogCategory[] = [
  {
    id: "nuevos-ingresos",
    name: "Nuevos ingresos",
    slug: "nuevos-ingresos",
    description: "Productos que abren la conversacion con una propuesta actual y visualmente fuerte.",
    productCount: 2,
    order: 1,
  },
  {
    id: "edicion-limitada",
    name: "Edicion limitada",
    slug: "edicion-limitada",
    description: "Capsulas y colecciones pequeñas para reforzar exclusividad.",
    productCount: 1,
    order: 2,
  },
  {
    id: "accesorios",
    name: "Accesorios",
    slug: "accesorios",
    description: "Complementos faciles de vender y simples de gestionar desde el admin.",
    productCount: 1,
    order: 3,
  },
];

function mapProduct(product: {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  featured: boolean;
  category: { name: string; slug: string };
  images: { url: string }[];
  createdAt?: Date;
}): CatalogProduct {
  const NEW_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;
  const isNew = product.createdAt
    ? Date.now() - product.createdAt.getTime() < NEW_THRESHOLD_MS
    : false;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: product.category,
    priceCents: product.priceCents,
    stock: product.stock,
    featured: product.featured,
    image: product.images[0]?.url ?? demoProducts[0].image,
    accent: demoProducts.find((item) => item.slug === product.slug)?.accent ?? demoProducts[0].accent,
    isNew,
  };
}

export async function getCatalogProducts() {
  if (!isDatabaseConfigured()) {
    return demoProducts;
  }

  try {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            url: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });

    return products.map(mapProduct);
  } catch {
    return [];
  }
}

export async function getFeaturedProducts() {
  const products = await getCatalogProducts();
  return products.filter((product) => product.featured).slice(0, 4);
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  if (!isDatabaseConfigured()) {
    return demoProducts.find((product) => product.slug === slug) ?? null;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        images: {
          select: { url: true, alt: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product || product.status !== "PUBLISHED") {
      return null;
    }

    const accent =
      demoProducts.find((item) => item.slug === product.slug)?.accent ?? demoProducts[0].accent;

    const NEW_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;
    const isNew = product.createdAt
      ? Date.now() - product.createdAt.getTime() < NEW_THRESHOLD_MS
      : false;

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      priceCents: product.priceCents,
      stock: product.stock,
      featured: product.featured,
      image: product.images[0]?.url ?? demoProducts[0].image,
      images: product.images.map((img) => ({
        url: img.url,
        alt: img.alt ?? product.name,
      })),
      accent,
      isNew,
    };
  } catch {
    const products = await getCatalogProducts();
    return products.find((product) => product.slug === slug) ?? null;
  }
}

export async function getCategories() {
  if (!isDatabaseConfigured()) {
    return demoCategories;
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    return categories.length > 0
      ? categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description:
            category.description ??
            demoCategories.find((item) => item.slug === category.slug)?.description ??
            "Categoria administrable desde el panel.",
          productCount: category._count.products,
          order: category.order,
        }))
      : demoCategories;
  } catch {
    return demoCategories;
  }
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const fallback = {
    name: siteConfig.name,
    description: siteConfig.description,
    whatsappNumber: siteConfig.whatsappNumber,
    currency: siteConfig.currency,
  };

  if (!isDatabaseConfigured()) {
    return fallback;
  }

  try {
    const record = await prisma.setting.findUnique({
      where: { key: "store" },
    });

    const parsed = storeSettingsSchema.safeParse(record?.value);
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export type CatalogBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string;
};

const demoBanners: CatalogBanner[] = [
  {
    id: 'demo-1',
    title: 'Nueva coleccion',
    subtitle: 'Descubre las piezas mas buscadas de la temporada',
    ctaLabel: 'Ver catalogo',
    ctaHref: '/productos',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'demo-2',
    title: 'Envio gratis',
    subtitle: 'En compras superiores a $150.000',
    ctaLabel: 'Comprar ahora',
    ctaHref: '/productos',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
  },
];

export async function getActiveBanners(): Promise<CatalogBanner[]> {
  if (!isDatabaseConfigured()) return demoBanners;
  try {
    const banners = await prisma.heroBanner.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    if (banners.length === 0) return demoBanners;
    return banners.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      ctaLabel: b.ctaLabel,
      ctaHref: b.ctaHref,
      imageUrl: b.imageUrl,
    }));
  } catch {
    return demoBanners;
  }
}

export async function getRecentProducts(limit = 12) {
  const products = await getCatalogProducts();
  return products.slice(0, limit);
}
