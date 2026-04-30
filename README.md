# Tienda Catalogo WhatsApp

Plantilla reusable para tiendas online con checkout directo por WhatsApp, panel admin, stock, Prisma 7 sobre Neon y despliegue completo en Vercel.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Componentes con estilo Aceternity-like y utilidades propias
- Prisma 7 + Neon Postgres
- NextAuth Credentials para admin
- Cloudinary para uploads
- Zustand para carrito
- Zod + React Hook Form para validacion

## Incluye

- Home moderna no generica
- Catalogo publico y detalle de producto
- Carrito con mensaje listo para WhatsApp
- Panel admin con overview, CRUD real de productos, categorias y ajustes
- API routes protegidas para auth, productos y uploads
- Seed inicial con admin demo y producto demo
- `.env` y `.env.example` preparados para clonar el proyecto por cliente

## Estructura

```text
src/
	app/
		(shop)/
			productos/
			carrito/
		(admin)/
			admin/
			login/
		api/
	components/
		aceternity/
		admin/
		shop/
		ui/
	lib/
	schemas/
	store/
prisma/
```

## Variables de entorno

El proyecto ya trae un `.env` local y un `.env.example` base con estas variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_STORE_NAME`
- `NEXT_PUBLIC_STORE_DESCRIPTION`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_CURRENCY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Si Cloudinary no esta configurado, el admin sigue funcionando con URL manual para imagenes. El upload directo queda disponible apenas completes esas tres variables.

## Flujo inicial

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Para clonar el proyecto a otro cliente:

```bash
Copy-Item .env.example .env
```

Admin demo inicial:

- Email: el valor de `ADMIN_EMAIL`
- Contrasena: el valor de `ADMIN_PASSWORD`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run postinstall
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
```

## Despliegue en Vercel

1. Importa el repositorio en Vercel como proyecto Next.js.
2. Copia todas las variables del `.env.example` en Project Settings -> Environment Variables.
3. Usa la misma `DATABASE_URL` de Neon en Preview y Production.
4. Si quieres upload directo de imagenes, agrega las claves de Cloudinary.
5. Despues del primer deploy, ejecuta `npm run db:push` y `npm run db:seed` sobre la base elegida si aun no la inicializaste.

## Estado actual

- El proyecto compila correctamente con `npm run build`
- El task `dev` de VS Code ya fue creado y queda listo para usar
- Con `DATABASE_URL` real, el admin puede persistir productos, categorias y ajustes
- Si faltan claves de Cloudinary, el admin sigue aceptando URL manual para imagenes
