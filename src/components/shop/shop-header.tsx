"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  LogIn,
  Menu,
  MessageCircleMore,
  Search,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CartDrawer } from "@/components/shop/cart-drawer";
import { useCartStore } from "@/store/cart";
import { searchProducts } from "@/actions/shop";
import type { CatalogProduct } from "@/lib/catalog";
import { formatCurrencyFromCents } from "@/lib/utils";

type ShopHeaderProps = {
  storeName: string;
  whatsappHref: string;
  whatsappNumber: string;
  logoUrl?: string;
  freeShippingThresholdCents?: number;
};

export function ShopHeader({ storeName, whatsappHref, whatsappNumber, logoUrl, freeShippingThresholdCents }: ShopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const cartOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CatalogProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const lastItemCount = useRef(itemCount);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Bounce cart badge whenever item count grows
  useEffect(() => {
    if (itemCount > lastItemCount.current) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 500);
      lastItemCount.current = itemCount;
      return () => clearTimeout(t);
    }
    lastItemCount.current = itemCount;
  }, [itemCount]);

  // Predictive search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close overlays on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuOpen) setMenuOpen(false);
        if (searchOpen) setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, searchOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim() || searchInputRef.current?.value?.trim();
    if (query) {
      router.push(`/productos?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
      setMenuOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", icon: House, label: "Inicio" },
    { href: "/productos", icon: Tag, label: "Productos" },
  ];

  return (
    <>
      {/* Top header — dark glass */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-black/95 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5 lg:px-10">
          {/* Left side: logo + brand name */}
          <div className="flex items-center gap-2.5">
            <Link className="flex items-center gap-2.5" href="/">
              {logoUrl ? (
                <span className="relative size-9 overflow-hidden rounded-md bg-black sm:size-10">
                  <Image
                    alt={storeName}
                    className="object-cover"
                    fill
                    sizes="40px"
                    src={logoUrl}
                  />
                </span>
              ) : (
                <span className="flex size-9 items-center justify-center rounded-md border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] sm:size-10">
                  {storeName.slice(0, 2)}
                </span>
              )}
              <span className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[0.12em] text-[var(--foreground)] sm:text-xl">
                {storeName}
              </span>
            </Link>
          </div>

          {/* Right side: cart count + search + hamburger */}
          <div className="flex items-center gap-0.5">
            {itemCount > 0 && (
              <button
                aria-label="Ver carrito"
                className="relative flex size-9 items-center justify-center rounded-full text-[var(--foreground)] transition hover:text-[var(--accent)] sm:size-10"
                onClick={openCart}
                type="button"
              >
                <ShoppingBag className="size-5" />
                <span className={`absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-[var(--accent-ink)] ${cartBump ? "animate-badge-bounce" : ""}`}>
                  {itemCount}
                </span>
              </button>
            )}
            <button
              aria-label="Buscar"
              className="relative flex size-9 items-center justify-center rounded-full text-[var(--foreground)] transition hover:text-[var(--accent)] sm:size-10"
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (!searchOpen) {
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }
              }}
              type="button"
            >
              <Search className="size-5" />
            </button>
            <button
              aria-label="Abrir menú"
              className="flex size-9 items-center justify-center rounded-full text-[var(--foreground)] transition hover:text-[var(--accent)] sm:size-10"
              onClick={() => setMenuOpen(true)}
              type="button"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        {/* Search Panel sliding down */}
        <div
          className={`w-full overflow-hidden transition-all duration-300 ease-in-out bg-black/98 backdrop-blur-2xl ${
            searchOpen ? "max-h-[80vh] border-t border-[var(--border)] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
            <form className="relative flex gap-2" onSubmit={handleSearchSubmit}>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] pl-9 pr-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] transition focus:border-[var(--accent)]/50 focus:bg-[rgba(255,255,255,0.05)]"
                  placeholder="Buscar perfume..."
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="rounded-lg px-3 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                onClick={() => setSearchOpen(false)}
                type="button"
              >
                Cancelar
              </button>
            </form>

            {/* Predictive Search Results */}
            {searchQuery.trim() && (
              <div className="mt-4 flex max-h-[50vh] flex-col overflow-y-auto">
                {isSearching ? (
                  <div className="py-4 text-center text-sm text-[var(--muted-foreground)]">Buscando...</div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-1 pb-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/productos/${product.slug}`}
                        className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-[var(--surface-strong)]"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-[var(--border)]">
                          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="flex flex-col">
                          <span className="line-clamp-1 text-sm font-medium text-[var(--foreground)]">{product.name}</span>
                          <span className="text-xs font-medium text-[var(--accent)]">{formatCurrencyFromCents(product.priceCents)}</span>
                        </div>
                      </Link>
                    ))}
                    <button
                      className="mt-2 w-full rounded-lg border border-[var(--border)] p-3 text-center text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
                      onClick={() => {
                        router.push(`/productos?q=${encodeURIComponent(searchQuery)}`);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      type="button"
                    >
                      Ver todos los resultados
                    </button>
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-[var(--muted-foreground)]">No se encontraron productos.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========== MENU DRAWER (slides from left) ========== */}
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      {/* Drawer panel */}
      <aside
        aria-label="Menú de navegación"
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-[var(--border)] bg-black shadow-[8px_0_60px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <span className="relative size-9 overflow-hidden rounded-md bg-black">
                <Image alt={storeName} className="object-cover" fill sizes="36px" src={logoUrl} />
              </span>
            ) : (
              <span className="flex size-9 items-center justify-center rounded-md border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                {storeName.slice(0, 2)}
              </span>
            )}
            <span className="font-[family-name:var(--font-display)] text-base font-light italic tracking-[0.16em] text-[var(--foreground)]">
              {storeName}
            </span>
          </div>
          <button
            aria-label="Cerrar menú"
            className="flex size-9 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              const LinkIcon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "text-[var(--accent)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    <LinkIcon className="size-4.5" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* WhatsApp + login */}
          <div className="mt-4 space-y-0.5 border-t border-[var(--border)] pt-4">
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#1b9c53] transition hover:text-[#25D366]"
              href={whatsappHref}
              onClick={() => setMenuOpen(false)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircleMore className="size-4.5" />
              Contactar por WhatsApp
            </a>
            <Link
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
              href="/login"
              onClick={() => setMenuOpen(false)}
            >
              <LogIn className="size-4.5" />
              Iniciar sesión
            </Link>
          </div>
        </nav>

        {/* Drawer footer */}
        <div className="border-t border-[var(--border)] px-5 py-4">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-4 py-3 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/15 hover:border-[var(--accent)]/40"
            onClick={() => {
              openCart();
              setMenuOpen(false);
            }}
            type="button"
          >
            <ShoppingBag className="size-4" />
            Ver carrito
            {itemCount > 0 ? (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-bold text-[var(--accent-ink)]">
                {itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </aside>

      {/* Cart Drawer */}
      <CartDrawer freeShippingThresholdCents={freeShippingThresholdCents} onClose={closeCart} open={cartOpen} whatsappNumber={whatsappNumber} />
    </>
  );
}

