# Carpeta de perfumes para el carrusel

Agrega aquí tus imágenes PNG de los perfumes que se mostrarán en el carrusel del inicio.

## Formato recomendado
- Formato: PNG con fondo transparente (ideal) o fondo negro
- Tamaño recomendado: 400×600px o similar (relación 2:3)
- Nombres sugeridos: `perfume-01.png`, `perfume-02.png`, etc.

## Cómo activar el carrusel

Una vez que tengas tus imágenes PNG aquí, edita el componente:
`src/components/shop/perfume-showcase.tsx`

Y pasa el array de imágenes desde el `page.tsx`:

```tsx
// En src/app/(shop)/page.tsx
<PerfumeShowcase images={[
  "/perfumes/perfume-01.png",
  "/perfumes/perfume-02.png",
  "/perfumes/perfume-03.png",
  "/perfumes/perfume-04.png",
  "/perfumes/perfume-05.png",
]} />
```

El carrusel se desliza automáticamente de forma infinita y se pausa al pasar el cursor.
