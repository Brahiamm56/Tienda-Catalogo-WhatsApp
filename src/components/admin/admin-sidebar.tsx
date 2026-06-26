"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Image as ImageIcon,
  LayoutTemplate,
  LogOut,
  Menu,
  Settings,
  Shapes,
  BadgeDollarSign,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutTemplate },
  { href: "/admin/ventas", label: "Ventas", icon: BadgeDollarSign },
  { href: "/admin/productos", label: "Productos", icon: Boxes },
  { href: "/admin/categorias", label: "Categorias", icon: Shapes },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

type AdminSidebarProps = {
  userLabel: string;
  logoUrl?: string;
  storeName?: string;
};

export function AdminSidebar({ userLabel, logoUrl, storeName }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const logoElement = logoUrl ? (
    <div className="relative size-9 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] shadow-sm">
      <Image
        alt={storeName ?? "Store"}
        className="object-cover"
        fill
        sizes="36px"
        src={logoUrl}
      />
    </div>
  ) : (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-bold uppercase tracking-widest text-white shadow-sm">
      {storeName ? storeName.slice(0, 2) : "SC"}
    </div>
  );

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1 px-2 py-3 mt-4">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-colors duration-150",
              isActive
                ? "bg-[var(--surface-strong)]/80 font-semibold text-[var(--foreground)] border border-[var(--border)]/50 shadow-sm"
                : "font-medium text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
            )}
            href={link.href}
            onClick={() => setIsMobileOpen(false)}
            title={link.label}
          >
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
            </span>
            <span className="whitespace-nowrap overflow-hidden opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 md:group-hover/sidebar:opacity-100">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  const logoutButton = (
    <div className="px-2 pb-4">
      <button
        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm text-[var(--muted-foreground)] transition-colors hover:bg-rose-50 hover:text-rose-600"
        onClick={() => signOut({ callbackUrl: "/" })}
        type="button"
      >
        <span className="flex size-8 shrink-0 items-center justify-center">
          <LogOut className="size-[18px]" />
        </span>
        <span className="whitespace-nowrap overflow-hidden opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 md:group-hover/sidebar:opacity-100">
          Cerrar sesion
        </span>
      </button>
    </div>
  );

  // Mobile version - always show text (no opacity-0)
  const mobileNavLinks = (
    <nav className="flex flex-1 flex-col gap-1 px-2 py-3 mt-4">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-colors duration-150",
              isActive
                ? "bg-[var(--surface-strong)]/80 font-semibold text-[var(--foreground)] border border-[var(--border)]/50 shadow-sm"
                : "font-medium text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
            )}
            href={link.href}
            onClick={() => setIsMobileOpen(false)}
            title={link.label}
          >
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
            </span>
            <span className="whitespace-nowrap">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  const mobileLogoutButton = (
    <div className="px-2 pb-4">
      <button
        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm text-[var(--muted-foreground)] transition-colors hover:bg-rose-50 hover:text-rose-600"
        onClick={() => signOut({ callbackUrl: "/" })}
        type="button"
      >
        <span className="flex size-8 shrink-0 items-center justify-center">
          <LogOut className="size-[18px]" />
        </span>
        <span className="whitespace-nowrap">
          Cerrar sesion
        </span>
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="group/sidebar sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col overflow-visible border-r border-[var(--border)] bg-[var(--surface-strong)] transition-[width] duration-300 ease-in-out hover:w-[240px] md:flex">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5">
          {logoElement}
          <div className="overflow-hidden opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
            <p className="whitespace-nowrap text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
              Admin
            </p>
            <p className="mt-0.5 whitespace-nowrap text-sm font-semibold text-[var(--foreground)]">
              {userLabel}
            </p>
          </div>
        </div>

        {navLinks}
        {logoutButton}
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          {logoElement}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
              Admin
            </p>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {storeName ?? userLabel}
            </p>
          </div>
        </div>
        <button
          aria-label="Abrir menú"
          className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--foreground)] transition hover:bg-[var(--surface)]"
          onClick={() => setIsMobileOpen(true)}
          type="button"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {isMobileOpen ? (
        <>
          <button
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileOpen(false)}
            type="button"
          />
          <aside className="animate-slide-in-left fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[var(--border)] bg-[var(--surface-strong)] shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
              <div className="flex items-center gap-3">
                {logoElement}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                    Admin
                  </p>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {userLabel}
                  </p>
                </div>
              </div>
              <button
                aria-label="Cerrar menú"
                className="flex size-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                onClick={() => setIsMobileOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>
            {mobileNavLinks}
            {mobileLogoutButton}
          </aside>
        </>
      ) : null}
    </>
  );
}