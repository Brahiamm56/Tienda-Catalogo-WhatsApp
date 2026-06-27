"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  House,
  LogIn,
  Menu,
  MessageCircleMore,
  Search,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CartDrawer } from "@/components/shop/cart-drawer";
import { useCartStore } from "@/store/cart";
import { getShopCategories, searchProducts } from "@/actions/shop";
import type { CatalogProduct, CatalogCategory } from "@/lib/catalog";
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
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  // Load categories for the hamburger menu
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getShopCategories();
        setCategories(cats.filter((c) => c.name && c.name.trim() !== ""));
      } catch (err) {
        console.error("Error loading categories in header:", err);
      }
    }
    loadCategories();
  }, []);
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
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/8 px-1.5 py-0.5">
                <svg className="size-3.5 rounded-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="12" r="12" fill="#74ACDF" />
                  <rect x="0" y="8" width="24" height="8" fill="#FFFFFF" />
                  <circle cx="12" cy="12" r="3.2" fill="#F6B40E" />
                  <circle cx="12" cy="12" r="1.4" fill="#843C0E" />
                </svg>
                <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">AR</span>
              </span>
            </Link>
          </div>

          {/* Right side: search + hamburger */}
          <div className="flex items-center gap-0.5">
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
                  aria-label="Buscar perfume"
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
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
                      <Search className="size-5 text-[var(--muted-foreground)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">No se encontraron productos</p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Probá con otro término de búsqueda</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Marquee Promotion Ticker */}
      <div className="w-full bg-white py-0.5 overflow-hidden border-b border-[var(--border)] relative z-20">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marqueeLoop {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .animate-marquee-loop {
            display: inline-flex;
            white-space: nowrap;
            animation: marqueeLoop 36s linear infinite;
          }
        `}} />
        <div className="flex w-max animate-marquee-loop">
          <div className="flex gap-16 text-black text-[10px] font-black uppercase tracking-[0.2em]">
            <span>✦ 15% DE DESCUENTO EN CUALQUIER PERFUME A ELECCIÓN ✦</span>
            <span>✦ ENVÍOS GRATIS EN COMPRAS MAYORES A $80.000 ✦</span>
            <span>✦ HASTA 3 CUOTAS SIN INTERÉS ✦</span>
            <span>✦ IMPORTADOS & DECANT DE CALIDAD PREMIUM ✦</span>
          </div>
          <div className="flex gap-16 text-black text-[10px] font-black uppercase tracking-[0.2em] pl-16">
            <span>✦ 15% DE DESCUENTO EN CUALQUIER PERFUME A ELECCIÓN ✦</span>
            <span>✦ ENVÍOS GRATIS EN COMPRAS MAYORES A $80.000 ✦</span>
            <span>✦ HASTA 3 CUOTAS SIN INTERÉS ✦</span>
            <span>✦ IMPORTADOS & DECANT DE CALIDAD PREMIUM ✦</span>
          </div>
        </div>
      </div>

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
        aria-modal="true"
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
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/8 px-1.5 py-0.5">
              <svg className="size-3.5 rounded-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="12" fill="#74ACDF" />
                <rect x="0" y="8" width="24" height="8" fill="#FFFFFF" />
                <circle cx="12" cy="12" r="3.2" fill="#F6B40E" />
                <circle cx="12" cy="12" r="1.4" fill="#843C0E" />
              </svg>
              <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">AR</span>
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

              if (link.href === "/productos") {
                return (
                  <li key={link.href} className="flex flex-col">
                    <div className="flex items-center justify-between rounded-lg hover:bg-[var(--surface)] transition">
                      <Link
                        className={`flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium ${
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
                      <button
                        aria-label="Desplegar categorías"
                        className="p-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-transform duration-200"
                        aria-expanded={categoriesExpanded}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setCategoriesExpanded(!categoriesExpanded);
                        }}
                        style={{
                          transform: categoriesExpanded ? "rotate(180deg)" : "rotate(0deg)"
                        }}
                        type="button"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                    </div>
                    {/* Submenu for categories */}
                    {categoriesExpanded && (
                      <ul className="mt-1 ml-9 pl-3 border-l border-[var(--border)] space-y-1.5">
                        <li>
                          <Link
                            href="/productos"
                            className="block py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] transition"
                            onClick={() => setMenuOpen(false)}
                          >
                            Ver todos
                          </Link>
                        </li>
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <Link
                              href={`/productos?categoria=${cat.slug}`}
                              className="block py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] transition"
                              onClick={() => setMenuOpen(false)}
                            >
                              {cat.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

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

      </aside>

      {/* Floating cart button below the hamburger menu button */}
      <button
        aria-label="Ver carrito"
        className={`fixed right-4 top-[72px] z-20 flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-black/90 text-[var(--foreground)] shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 sm:right-6 sm:top-[80px] ${
          cartBump ? "animate-cart-bounce border-[var(--accent)]/60 shadow-[0_0_15px_rgba(212,175,55,0.3)] bg-[var(--surface-strong)]" : ""
        }`}
        onClick={openCart}
        type="button"
      >
        <ShoppingCart className="size-4.5 text-[var(--accent)]" />
        {itemCount > 0 && (
          <span className={`absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[9px] font-bold text-[var(--accent-ink)] ${cartBump ? "animate-badge-bounce" : ""}`}>
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      <CartDrawer freeShippingThresholdCents={freeShippingThresholdCents} onClose={closeCart} open={cartOpen} whatsappNumber={whatsappNumber} />
    </>
  );
}

