"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@demo.com",
      password: "Admin123*",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setSubmitError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (!result?.ok) {
        setSubmitError("No fue posible iniciar sesion. Verifica seed, credenciales o conexion de base de datos.");
        return;
      }

      router.push(result.url ?? "/admin");
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input id="email" placeholder="admin@demo.com" type="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-[var(--accent-strong)]">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Contrasena
        </label>
        <Input id="password" placeholder="********" type="password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-[var(--accent-strong)]">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      {submitError ? <p className="text-sm text-[var(--accent-strong)]">{submitError}</p> : null}

      <Button className="w-full" size="lg" type="submit" variant="accent">
        {isPending ? "Ingresando..." : "Entrar al panel"}
        <ArrowRight className="ml-2 size-4" />
      </Button>
    </form>
  );
}