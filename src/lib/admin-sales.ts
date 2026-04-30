import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export type AdminSaleListItem = {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  deliveryMethod: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  totalCents: number;
  createdAt: Date;
  itemCount: number;
};

export type AdminSaleSummary = {
  totalSalesCents: number;
  salesCount: number;
  completedCount: number;
  pendingCount: number;
  todayCents: number;
  last7DaysCents: number;
};

export async function getSales(limit = 100): Promise<AdminSaleListItem[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        items: { select: { id: true } },
      },
    });

    return sales.map((sale) => ({
      id: sale.id,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      deliveryMethod: sale.deliveryMethod,
      status: sale.status as AdminSaleListItem["status"],
      totalCents: sale.totalCents,
      createdAt: sale.createdAt,
      itemCount: sale.items.length,
    }));
  } catch {
    return [];
  }
}

export async function getSalesSummary(): Promise<AdminSaleSummary> {
  const empty: AdminSaleSummary = {
    totalSalesCents: 0,
    salesCount: 0,
    completedCount: 0,
    pendingCount: 0,
    todayCents: 0,
    last7DaysCents: 0,
  };

  if (!isDatabaseConfigured()) {
    return empty;
  }

  try {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start7Days = new Date(startToday);
    start7Days.setDate(start7Days.getDate() - 6);

    const sales = await prisma.sale.findMany({
      where: { status: { in: ["COMPLETED", "PENDING"] } },
      select: { totalCents: true, status: true, createdAt: true },
    });

    let totalSalesCents = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let todayCents = 0;
    let last7DaysCents = 0;

    for (const sale of sales) {
      totalSalesCents += sale.totalCents;
      if (sale.status === "COMPLETED") completedCount += 1;
      if (sale.status === "PENDING") pendingCount += 1;
      if (sale.createdAt >= startToday) todayCents += sale.totalCents;
      if (sale.createdAt >= start7Days) last7DaysCents += sale.totalCents;
    }

    return {
      totalSalesCents,
      salesCount: sales.length,
      completedCount,
      pendingCount,
      todayCents,
      last7DaysCents,
    };
  } catch {
    return empty;
  }
}

export async function getSalesByDay(days = 7): Promise<Array<{ date: Date; cents: number }>> {
  if (!isDatabaseConfigured()) {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      d.setHours(0, 0, 0, 0);
      return { date: d, cents: 0 };
    });
  }

  const now = new Date();
  const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(startDay);
  start.setDate(start.getDate() - (days - 1));

  try {
    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start }, status: { in: ["COMPLETED", "PENDING"] } },
      select: { totalCents: true, createdAt: true },
    });

    const buckets: Array<{ date: Date; cents: number }> = Array.from({ length: days }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return { date: d, cents: 0 };
    });

    for (const sale of sales) {
      const idx = Math.floor((sale.createdAt.getTime() - start.getTime()) / 86_400_000);
      if (idx >= 0 && idx < days) buckets[idx].cents += sale.totalCents;
    }

    return buckets;
  } catch {
    return [];
  }
}
