import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/login-form";
import { Badge } from "@/components/ui/badge";
import { getAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="surface-panel w-full max-w-5xl overflow-hidden rounded-[2.5rem] lg:grid lg:grid-cols-[1fr_0.9fr]">
        <div className="grid-pattern relative hidden overflow-hidden bg-[#16120f] p-10 text-[#f8f2eb] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(211,93,71,0.35),_transparent_38%),radial-gradient(circle_at_70%_20%,_rgba(86,168,181,0.22),_transparent_28%)]" />
          <div className="relative z-10 space-y-5">
            <Badge className="border-white/10 bg-white/10 text-white/80">Acceso admin</Badge>
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight">
              Administra productos, categorias, stock e imagenes desde un solo panel.
            </h1>
            <p className="max-w-lg text-sm leading-7 text-[#d8c9bc]">
              El login queda conectado a credenciales con NextAuth y Prisma. Cuando ejecutes el seed, podras entrar con el usuario base del `.env`.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <Badge>Credenciales</Badge>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold">Entrar al panel</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
            Usa el usuario inicial para revisar el admin y luego reemplaza los datos demo por el catalogo del cliente.
          </p>
          <div className="mt-8">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}