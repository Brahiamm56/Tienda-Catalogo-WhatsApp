# Reglas de seguridad y arquitectura (contrato para la IA)

> Este archivo es **vinculante** para cualquier asistente (Copilot, Claude, etc.) que escriba código en este repo. El objetivo es mantener el sistema seguro y dejarlo listo para integrar **pagos online + envíos** sin re-arquitecturar.
>
> Si una regla bloquea una tarea solicitada, la IA **debe** detenerse y explicar el conflicto antes de avanzar.

---

## 0. Lectura obligatoria antes de cualquier cambio

1. Leer [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md) para conocer el estado actual.
2. Si vas a modificar `src/middleware.ts`, `src/lib/auth.ts`, `src/lib/admin.ts`, `src/app/api/**`, `src/actions/**`, `prisma/schema.prisma`, `next.config.ts` o cualquier archivo bajo `docs/`: avisar al usuario y pedir confirmación.
3. Nunca borrar reglas de este archivo sin un PR/cambio explícito acordado con el dueño.

---

## 1. Autenticación y autorización

- **R1.1** El middleware de NextAuth vive en `src/middleware.ts` (no `proxy.ts`, no en otro nombre). El `matcher` debe cubrir `/admin/:path*`. Cualquier subruta admin nueva queda automáticamente protegida.
- **R1.2** Toda página, layout, server action o route handler bajo `/admin` o que mute datos **debe** llamar a `requireAdminSession()` de [src/lib/admin.ts](src/lib/admin.ts) como primera instrucción. No confiar en el middleware solo.
- **R1.3** Verificar **rol** además de sesión: usar `hasAdminAccess(session.user.role)` o un helper específico (`requireRole('owner')`). No asumir que existir sesión = admin.
- **R1.4** Las acciones financieras futuras (reembolsos, cambios de precio masivos, eliminación de órdenes pagadas) requieren step-up auth: re-prompt de password o segundo factor. No implementarlas con el chequeo de sesión normal.
- **R1.5** No exponer `passwordHash`, `email` de admins, ni tokens en responses, logs, ni server components serializados.
- **R1.6** Política de password mínima al crear/cambiar credenciales: ≥12 caracteres, no en lista de filtrados (HaveIBeenPwned k-anon). Hasher: `bcryptjs` cost ≥10 o `argon2id`.
- **R1.7** Sesión: `strategy: 'jwt'` está OK mientras no haya pagos. Cuando se habiliten pagos, evaluar mover a `database` sessions para poder revocar.
- **R1.8** Nunca aceptar `role` desde el cliente. El rol se setea sólo en `jwt`/`session` callbacks leyendo de la BD.

---

## 2. Validación de entrada y salida

- **R2.1** Toda entrada externa (formData, JSON body, query params, headers no triviales) se valida con **Zod** antes de tocar Prisma o Cloudinary. Sin excepción.
- **R2.2** Las URLs editables por el usuario (banners, logo, CTA, futuros webhooks) se validan con `z.string().url()` **y** un refinement que limite el protocolo a `https:` (o ruta relativa `/`). Prohibido aceptar `javascript:`, `data:`, `vbscript:`, `file:`.
- **R2.3** Los datos leídos desde la BD que se inyectarán en HTML/CSS (e.g. settings de tema) se **re-validan con Zod** antes de usarse en el render. Nunca asumir que un `Json` de Prisma respeta el schema.
- **R2.4** Prohibido `dangerouslySetInnerHTML` salvo con strings 100% generados por código del repo (no concatenan input). Para variables CSS dinámicas usar el atributo `style` de React.
- **R2.5** Salidas: nunca devolver `error.message` de Prisma, librerías o stacktraces al cliente. Loggear server-side, devolver `{ message: string, code: string }` genérico al cliente.

---

## 3. Server Actions y Route Handlers

- **R3.1** Toda mutación (Server Action o `POST/PUT/PATCH/DELETE`) sigue este orden:
  1. `await requireAdminSession()` (o equivalente para customer-facing).
  2. Validación Zod.
  3. Verificación de pertenencia/permiso fino sobre el recurso.
  4. Operación.
  5. `revalidatePath` sólo de las rutas afectadas (no invalidar `/` si no cambia).
  6. Retorno del estado tipado (`AdminFormState`).
- **R3.2** Configurar `serverActions.allowedOrigins` en `next.config.ts` con los dominios productivos. En route handlers críticos comparar `request.headers.get('origin')` con la allowlist.
- **R3.3** Endpoints de cara pública (search, lecturas) van en server actions o route handlers `GET` sin efectos secundarios.
- **R3.4** Cualquier endpoint nuevo que pueda ser llamado en loop (search, login, upload, futuro `/api/checkout`) requiere **rate-limiting**. Sin rate-limit no se mergea.
- **R3.5** Endpoints monetarios (futuros) son **idempotentes**: aceptar y exigir header `Idempotency-Key`, persistir y rechazar repeticiones.

---

## 4. Base de datos (Prisma + Neon)

- **R4.1** Sólo Prisma client. Prohibido `$queryRawUnsafe`. Si hace falta SQL, usar `Prisma.sql` con tagged template (parametrizado).
- **R4.2** Toda nueva tabla incluye `createdAt`, `updatedAt` y, donde aplique, soft-delete (`deletedAt`) en lugar de `delete` físico para registros financieros.
- **R4.3** Las tablas de dominio para pagos (`Order`, `OrderItem`, `Address`, `Payment`, `Refund`, `Shipment`, `AuditLog`) **nunca** se modifican o borran sin migración revisada.
- **R4.4** No persistir datos de tarjeta (PAN, CVV, expiración). Sólo guardar el `paymentIntentId`/`preferenceId` y los últimos 4 dígitos si el PSP lo entrega.
- **R4.5** Conexión: usar `@neondatabase/serverless` + `PrismaNeon` adapter (ya configurado). En producción `DATABASE_URL` es obligatorio; el fallback `postgresql://demo:demo@...` debe lanzar error si `NODE_ENV === 'production'`.
- **R4.6** Migraciones: nunca usar `prisma db push` en producción para tablas con datos reales. Usar `prisma migrate deploy`.

---

## 5. Manejo de archivos (Cloudinary)

- **R5.1** El endpoint de firma (`/api/upload`) requiere sesión admin y debe firmar siempre con: `resource_type=image`, `allowed_formats` allowlist (`jpg,jpeg,png,webp,avif`), `max_bytes` ≤ 5 MB, y `folder` en allowlist (`catalog`, `banners`, `branding`).
- **R5.2** El `secure_url` devuelto por Cloudinary se valida server-side: dominio `res.cloudinary.com`, debe pertenecer al `cloud_name` propio.
- **R5.3** `next.config.ts > images.remotePatterns` se mantiene como allowlist exacta (Cloudinary + Unsplash sólo si se usa como demo). Cualquier dominio nuevo se agrega explícitamente.
- **R5.4** Al borrar un producto/banner, intentar `cloudinary.uploader.destroy(publicId)` y registrar fallos en `AuditLog` para reintento. No dejar imágenes huérfanas pagas.

---

## 6. Secretos y variables de entorno

- **R6.1** Todos los secretos viven en `.env.local` (dev) y en el secret manager del hosting (prod). Nunca commitear `.env*`. Mantener `.env.example` actualizado.
- **R6.2** Validar el env con Zod al boot (un `lib/env.ts` que lance error si falta `NEXTAUTH_SECRET`, `DATABASE_URL`, `CLOUDINARY_*` en producción). Reemplazar el patrón `process.env.X ?? "fallback"` excepto para variables verdaderamente opcionales.
- **R6.3** Variables expuestas al cliente sólo si arrancan con `NEXT_PUBLIC_`. Antes de añadir una, confirmar que su filtración es aceptable.
- **R6.4** Las claves de PSP (Stripe/MP) van **server-only**. La `publishable_key` es la única `NEXT_PUBLIC_`. Webhook secrets nunca se loggean.

---

## 7. Cabeceras HTTP y CSP

- **R7.1** `next.config.ts` debe exponer `headers()` con al menos:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
  - `Content-Security-Policy` con allowlist explícita (self, Cloudinary, Unsplash, fonts.googleapis, dominios del PSP cuando aplique). Sin `'unsafe-inline'` salvo `style-src` con hash/nonce mientras exista CSS dinámico.
  - `frame-ancestors 'none'` salvo páginas que necesiten embed.
- **R7.2** Cookies de sesión: `httpOnly`, `secure`, `sameSite=lax` (NextAuth ya lo hace; no sobreescribir a `none` salvo necesidad real).

---

## 8. Logging, auditoría y observabilidad

- **R8.1** Toda acción admin que muta datos persistentes (crear/editar/borrar producto, categoría, banner, settings, ajuste de stock, futuras órdenes/reembolsos) escribe una fila en `AuditLog` con `actorId`, `action`, `entity`, `entityId`, `diff`, `ip`, `userAgent`, `createdAt`.
- **R8.2** Errores 5xx se reportan a un sink externo (Sentry/Logtail). No depender sólo de `console.error`.
- **R8.3** Logs de webhook (futuros) deben guardar el evento crudo + status de procesamiento. Retención mínima 90 días.

---

## 9. Carrito, checkout y dinero

- **R9.1** El carrito en `localStorage` (`src/store/cart.ts`) es **sólo UI**. Cualquier total mostrado es indicativo. El precio final se recalcula en el servidor desde `Product.priceCents` antes de cobrar.
- **R9.2** El stock se decrementa en una transacción Prisma junto con la creación de la `Order`. Usar `prisma.$transaction` con `isolationLevel: Serializable` o un `update` con condición `where: { stock: { gte: qty } }` para evitar oversell.
- **R9.3** Estados de orden con máquina explícita: `PENDING → PAID → FULFILLED → SHIPPED → DELIVERED` y estados terminales `CANCELLED`, `REFUNDED`. No aceptar transiciones libres.
- **R9.4** Reembolsos sólo vía API del PSP. Nunca marcar `REFUNDED` manualmente sin el evento del webhook que lo confirma.
- **R9.5** Precios e impuestos siempre en enteros (`cents`) para evitar errores de coma flotante. Moneda en ISO 4217 (`ARS`, `USD`).

---

## 10. Webhooks (preparación)

- **R10.1** Cada PSP tendrá su route handler dedicado (`/api/webhooks/<psp>`), `runtime: 'nodejs'`, lectura de raw body con `await request.text()` antes de cualquier parse.
- **R10.2** Verificar firma HMAC con el secret del PSP **antes** de procesar. Rechazar con 400 si falla.
- **R10.3** Idempotencia por `event.id` del PSP guardado en tabla `WebhookEvent` con índice único. Reintentos del PSP no deben duplicar efectos.
- **R10.4** Procesar el efecto del evento **dentro** de una transacción que también marque el `WebhookEvent` como procesado.
- **R10.5** Responder `200` rápido. Tareas largas se delegan a una cola.

---

## 11. PII y privacidad

- **R11.1** Datos del comprador (nombre, dirección, teléfono, DNI/CUIT) viven en tabla separada (`Customer`/`Address`) con acceso restringido por rol.
- **R11.2** Implementar endpoints de "exportar mis datos" y "borrar mis datos" antes de hacer marketing externo.
- **R11.3** No enviar PII a terceros (analytics, logs) sin consentimiento. Preferir IDs opacos.

---

## 12. Dependencias

- **R12.1** Antes de agregar una dependencia: verificar mantenedor, último release, vulnerabilidades conocidas (`npm audit`, GitHub advisories).
- **R12.2** Pinnear versiones críticas (`next`, `next-auth`, `prisma`, `@prisma/*`, `bcryptjs`, futuro PSP SDK) sin caret cuando estén cerca de un major.
- **R12.3** Revisar y corregir `lucide-react` (ver auditoría B-1/M-7) antes de seguir.
- **R12.4** No instalar paquetes que requieran ejecución de scripts post-install desconocidos.

---

## 13. Tests obligatorios al integrar pagos

- **R13.1** Tests de autorización por endpoint (anon, customer, admin, owner) — fallar el build si un endpoint mutador no tiene su test.
- **R13.2** Tests de cálculo de total (carrito server-side vs cliente).
- **R13.3** Tests de webhook: firma válida/inválida, replay, evento no soportado, idempotencia.
- **R13.4** E2E de checkout happy path + 3 fallos típicos (tarjeta rechazada, timeout PSP, sin stock).

---

## 14. Qué NO hacer (lista negra)

- ❌ Llamar a Prisma directamente desde un componente cliente.
- ❌ Confiar en el `role` o cualquier campo enviado por el cliente.
- ❌ Devolver mensajes crudos de excepciones al cliente.
- ❌ Hardcodear secretos (incluso "temporales").
- ❌ Deshabilitar TypeScript con `// @ts-ignore` o `any` sin comentario justificando.
- ❌ Usar `dangerouslySetInnerHTML`, `eval`, `new Function`, `Function(...)`, `setTimeout('string')`.
- ❌ Aceptar URLs sin validar protocolo.
- ❌ Persistir datos de tarjeta del comprador.
- ❌ Mergear cambios en `prisma/schema.prisma` sin migración.
- ❌ Subir un endpoint mutador sin rate-limit y sin test de autorización.
- ❌ Renombrar `src/middleware.ts` o moverlo fuera de la raíz de `src/`.

---

## 15. Cuando la IA tiene dudas

Si una tarea entra en conflicto con cualquier regla, o requiere tocar un archivo del listado de R0.2, **detenerse y preguntar al usuario** explicitando:
- Qué regla afecta.
- Qué riesgo introduce.
- Qué alternativa segura existe.

No avanzar "asumiendo" para no romper el flujo.
