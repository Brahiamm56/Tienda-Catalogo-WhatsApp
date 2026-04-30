# Auditoría de seguridad y arquitectura

Fecha: 2026-04-30
Stack: Next.js 16 (App Router) · React 19 · NextAuth (Credentials/JWT) · Prisma 7 + Neon · Cloudinary · Zod · TailwindCSS 4

> Esta auditoría es la línea base previa a integrar **pagos online + envíos**. La prioridad es cerrar todo lo `CRÍTICO`/`ALTO` antes de tocar dinero o datos personales (PII).

---

## 1. Resumen ejecutivo

| Severidad | # hallazgos | Estado bloqueante para pagos |
|-----------|-------------|------------------------------|
| Crítico   | 2           | Sí                           |
| Alto      | 6           | Sí                           |
| Medio     | 7           | Recomendado antes de prod    |
| Bajo      | 5           | Mejora continua              |

**Vereda buena:** uso correcto de `bcryptjs` para passwords, validación con Zod en todas las server actions de escritura, separación clara `lib/admin.ts` (`requireAdminSession`, `hasAdminAccess`), `server-only` aplicado, Prisma con consultas tipadas (sin SQL crudo), no hay `eval`/`new Function`, secretos no se exponen al cliente.

---

## 2. Hallazgos críticos

### ✅ C-1. Middleware (`proxy.ts` en Next 16) ahora valida sesión + rol — Resuelto 2026-04-30
- **Archivo:** [src/proxy.ts](src/proxy.ts)
- **Resolución:** se reescribió usando `withAuth` de NextAuth con un callback `authorized` y validación explícita de `role` (`owner` / `admin`). Cualquier sesión sin rol válido es redirigida a `/`. Matcher ampliado a `["/admin", "/admin/:path*"]` para cubrir todas las subrutas (incluida `/admin/banners`).
- **Nota Next 16:** Next.js 16 marcó `middleware` como deprecado en favor de `proxy`. La convención correcta es `src/proxy.ts` (lo que originalmente tenía el repo). Se mantiene el nombre y se actualizó el contenido.

### ✅ C-2. CSS dinámico vía atributo `style` (no `dangerouslySetInnerHTML`) — Resuelto 2026-04-30
- **Archivo:** [src/app/layout.tsx](src/app/layout.tsx)
- **Resolución:** el bloque `<style dangerouslySetInnerHTML>` fue eliminado. Las variables del tema se aplican vía `<body style={themeStyle}>` y React escapa automáticamente. Además, antes de construir el style, los settings se **re-validan** con `storeSettingsSchema` para no confiar en lo que llegue desde la BD.

---

## 3. Hallazgos altos

### ✅ A-1. Headers de seguridad + CSP — Resuelto 2026-04-30
- **Archivo:** [next.config.ts](next.config.ts)
- Se agregó `headers()` con CSP allowlist (Cloudinary + Unsplash), HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. `frame-ancestors 'none'` en CSP. `X-Robots-Tag: noindex` para `/admin/*` y `/login`.

### ✅ A-2. Rate-limit en login y endpoints sensibles — Resuelto 2026-04-30
- **Archivos:** [src/lib/rate-limit.ts](src/lib/rate-limit.ts), [src/lib/auth.ts](src/lib/auth.ts), [src/app/api/upload/route.ts](src/app/api/upload/route.ts), [src/app/api/products/route.ts](src/app/api/products/route.ts)
- Limiter in-memory por bucket. Login: 5/min/email. Upload: 30/min/usuario. Products POST: 60/min/usuario.
- **Limitación:** in-memory funciona en single instance. Para multi-instance migrar a Upstash/Redis (regla R3.4 de SECURITY.md).

### ✅ A-3. `/api/upload` endurecido — Resuelto 2026-04-30
- **Archivo:** [src/app/api/upload/route.ts](src/app/api/upload/route.ts)
- Allowlist por prefijo (`catalog`, `banners`, `branding`), rechazo de path traversal (`..`, `/`, `\0`), regex de carpeta. Rate-limit aplicado. El cliente ([src/components/admin/cloudinary-upload-field.tsx](src/components/admin/cloudinary-upload-field.tsx)) valida MIME (jpg/png/webp/avif) y tamaño (≤5 MB) antes de pedir firma.

### ✅ A-4. URLs validadas con allowlist de protocolo — Resuelto 2026-04-30
- **Archivos:** [src/schemas/banner.ts](src/schemas/banner.ts), [src/schemas/settings.ts](src/schemas/settings.ts), [src/schemas/product.ts](src/schemas/product.ts)
- `ctaHref` admite `https://` o ruta interna `/...`. `imageUrl` y `logoUrl` exigen `https:`. Cualquier `javascript:`, `data:`, `vbscript:`, `file:` se rechaza.

### ✅ A-5. Errores Prisma sanitizados — Resuelto 2026-04-30
- **Archivos:** [src/lib/errors.ts](src/lib/errors.ts), [src/actions/admin.ts](src/actions/admin.ts), [src/app/api/products/route.ts](src/app/api/products/route.ts)
- `logAndMaskError` loguea server-side con un código de correlación corto y devuelve mensaje genérico. `mapPrismaError` y los route handlers lo usan.

### ✅ A-6. `searchProducts` con Prisma + límites — Resuelto 2026-04-30
- **Archivo:** [src/actions/shop.ts](src/actions/shop.ts)
- Validación Zod (`min(1).max(60)`), filtrado server-side con `contains` + `mode: "insensitive"`, `take: 5`. Fallback al set demo cuando no hay BD configurada.

---

## 4. Hallazgos medios

### ✅ M-1. Validación de env al boot — Resuelto 2026-04-30
- [src/lib/env.ts](src/lib/env.ts) expone `assertProductionEnv()` que falla rápido si en `NODE_ENV=production` faltan `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`. Se invoca desde [src/lib/prisma.ts](src/lib/prisma.ts).

### 🟡 M-2. Política de password débil (parcial)
- [src/schemas/auth.ts](src/schemas/auth.ts) sigue en min 8 caracteres para no romper la cuenta seed (`Admin123*`). **Pendiente** crear un `strongPasswordSchema` (min 12, complejidad) cuando exista flujo "cambiar password" / "crear admin".
- Antes de habilitar pagos: TOTP/2FA obligatorio en cuentas con permiso de cobro. Documentado en [docs/SECURITY.md](docs/SECURITY.md) R1.4.

### ✅ M-3. Origin/Referer check + serverActions allowedOrigins — Resuelto 2026-04-30
- [next.config.ts](next.config.ts) incluye `experimental.serverActions.allowedOrigins`. [src/app/api/products/route.ts](src/app/api/products/route.ts) valida `Origin`/`Referer` antes de mutar.

### 🟡 M-4. PrismaAdapter + JWT (decisión documentada)
- Se mantiene `strategy: 'jwt'`. El adapter queda registrado para preparar futura migración a `database` sessions (necesaria para revocar tokens cuando entren pagos). Documentado en R1.7 de [docs/SECURITY.md](docs/SECURITY.md).

### 🟡 M-5. AuditLog (pendiente)
- Requiere migración Prisma. Se debe agregar antes de tocar dinero. Incluido en el plan de remediación (sección 7).

### 🟡 M-6. Cloudinary unconfigured (mejora menor)
- Las acciones de borrado se saltan silenciosamente cuando Cloudinary no está configurado. Comportamiento aceptable mientras el flag `isCloudinaryConfigured()` sea visible en el panel de Ajustes.

### 🟡 M-7. `lucide-react: ^1.14.0` (pendiente verificación)
- No se modificó para no introducir regresiones de UI sin verificación manual. Pendiente confirmar versión instalada y, si corresponde, fijar a la rama oficial estable.

---

## 5. Hallazgos bajos

- ✅ **B-1.** [src/lib/prisma.ts](src/lib/prisma.ts) ahora lanza error explícito si falta `DATABASE_URL` en producción.
- ✅ **B-2.** [src/app/robots.ts](src/app/robots.ts) bloquea `/admin/*`, `/login`, `/api/*`. Adicionalmente `next.config.ts` aplica `X-Robots-Tag: noindex` para esas rutas.
- 🟡 **B-3.** Sobre-invalidación de cache (`revalidatePath('/')` en cada acción) sigue presente. Mejora opcional sin impacto de seguridad.
- 🟡 **B-4.** `Setting.value` sigue siendo `Json` libre. Mitigado parcialmente por la re-validación con Zod antes de renderizar.
- 🟡 **B-5.** Sin tests automatizados. Bloqueante antes de pagos (R13).

---

## 6. Brechas de arquitectura para pagos + envíos

Estas no son vulnerabilidades hoy pero **bloquean** cobrar dinero el día 1:

1. **Modelo de dominio inexistente:** no hay `Order`, `OrderItem`, `Address`, `Shipment`, `Payment`, `Refund`, `Customer`. El "checkout" actual es WhatsApp puro (cliente arma carrito en `localStorage` con [src/store/cart.ts](src/store/cart.ts)). El precio y stock viven sólo en `Product`.
2. **Cálculo de precio del lado cliente:** el carrito en `localStorage` es la única fuente. Para pagos, el total **debe** recalcularse server-side desde `Product.priceCents` y `Category` antes de crear la intención de pago.
3. **Sin idempotencia:** cualquier endpoint de checkout futuro necesita `Idempotency-Key` para no duplicar cargos por reintento.
4. **Sin webhooks:** falta infraestructura para recibir y verificar firmas (`Stripe-Signature`, `x-signature` de MP). Necesita route handler `POST` con `runtime: 'nodejs'`, leer raw body, verificar HMAC, persistir evento crudo, idempotencia por `event.id`.
5. **PII no contemplada:** dirección, DNI/CUIT, teléfono del comprador exigen cifrado en reposo o, mínimo, separación de tabla y políticas de retención.
6. **Sin separación de roles:** `owner`/`admin` se tratan igual ([src/lib/admin.ts](src/lib/admin.ts#L7)). Para pagos conviene `owner`, `admin`, `support` (puede ver órdenes, no reembolsar), `viewer`.
7. **Sin doble confirmación para acciones sensibles:** cambios de precio masivo, eliminación de productos vendidos, reembolsos requieren step-up auth (re-login o 2FA).
8. **Sin observabilidad:** no hay Sentry/Logtail. Una falla en checkout debe alertar en menos de 1 minuto.

---

## 7. Plan de remediación recomendado (orden de ejecución)

1. **Hoy mismo (críticos):**
   - Renombrar `src/proxy.ts` → `src/middleware.ts`, ampliar matcher y validar `role`.
   - Quitar `dangerouslySetInnerHTML` del layout o validar 100% el input.
2. **Sprint actual (altos):**
   - Headers de seguridad + CSP base.
   - Rate-limit (Upstash) en login + APIs.
   - Endurecer `/api/upload` (allowlist + límites).
   - Validar URLs de banner/logo.
   - Sanitizar errores devueltos al cliente.
   - Reescribir `searchProducts` con Prisma + límites.
3. **Antes de tocar pagos:**
   - 2FA opcional para `owner`/`admin`.
   - Validación de env con Zod al boot, fallar si falta `NEXTAUTH_SECRET` en prod.
   - Tabla `AuditLog`, Sentry/Logtail.
   - Modelo `Order`, `Address`, `Payment`, `Shipment` + recálculo server-side.
   - Webhooks con verificación de firma + idempotencia.
   - Tests e2e de autorización (`/admin/*`, server actions, APIs).

---

## 8. Cómo usar este informe

- Las reglas para que cualquier IA (Copilot/Claude) **no introduzca regresiones** están en [docs/SECURITY.md](docs/SECURITY.md). Ese archivo es el contrato; este es el snapshot del estado.
- Cuando cierres un hallazgo, marcalo aquí con ✅ y la fecha. No borres entradas: sirven como historial.
