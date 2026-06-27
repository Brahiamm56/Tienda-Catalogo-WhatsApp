import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ROLES = new Set(["owner", "admin"]);

// Next.js 16: this file (proxy.ts) replaces the legacy middleware.ts and runs
// in the Node.js runtime. We protect every /admin* route here as a defense
// layer. The admin layout also re-checks the session via requireAdminSession()
// so authorization is enforced even if a request bypasses the proxy.
export default async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  const role = typeof token?.role === "string" ? token.role : undefined;

  // Not signed in → bounce to /login with a callbackUrl so we return here
  // after a successful sign-in.
  if (!token) {
    // For API routes, return 401 JSON instead of redirect
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?callbackUrl=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  // Signed in but not admin → send back to the public store.
  if (!role || !ADMIN_ROLES.has(role)) {
    // For API routes, return 403 JSON instead of redirect
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/upload",
    "/api/upload/:path*",
    "/api/products",
    "/api/products/:path*",
  ],
};

