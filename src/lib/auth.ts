import { compare } from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/schemas/auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours — sessions expire faster
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();

        // Brute-force throttle: 3 attempts per minute per email.
        const emailLimit = rateLimit({
          key: `login:email:${email}`,
          limit: 3,
          windowMs: 60_000,
        });
        if (!emailLimit.success) {
          return null;
        }

        // IP-based throttle: 10 attempts per minute per IP.
        // Prevents trying many different emails from the same source.
        const ip = req?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim()
          ?? req?.headers?.get?.("x-real-ip")?.trim()
          ?? "unknown";
        const ipLimit = rateLimit({
          key: `login:ip:${ip}`,
          limit: 10,
          windowMs: 60_000,
        });
        if (!ipLimit.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Always run compare to avoid timing attacks that reveal whether email exists
        const dummyHash = "$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqJ3YqD0KZ4F7gqXkDcKmJQ8DqDqDq";
        const isValid = user
          ? await compare(parsed.data.password, user.passwordHash)
          : await compare(parsed.data.password, dummyHash);

        if (!user || !isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "Administrador",
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = typeof token.role === "string" ? token.role : "owner";
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}