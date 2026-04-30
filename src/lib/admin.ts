import "server-only";

import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";

const adminRoles = new Set(["owner", "admin"]);

export function hasAdminAccess(role?: string | null) {
  return typeof role === "string" && adminRoles.has(role);
}

export async function requireAdminSession() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (!hasAdminAccess(session.user.role)) {
    redirect("/");
  }

  return session;
}