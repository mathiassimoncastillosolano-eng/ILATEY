# ILATEY · Flores & Detalles

Sitio web de ILATEY: flores artesanales. Pequeños detalles, grandes sentimientos.

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · React Router · Framer Motion · Zustand · Lucide · ESLint

## Cómo usarlo

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # compila para producción (carpeta dist/)
npm run preview    # vista previa del build
npm run lint       # revisión de código
```

Requiere Node 20.19 o superior.

## Estructura

```
src/
  data/products.ts      Ramos, ocasiones (MOODS), frases y vistas de galería
  store/useStore.ts     Estado global (Zustand): favoritos, filtros, ramo abierto, aviso
  lib/useGoSection.ts   Navegación suave a secciones
  components/
    Navbar, Footer, Toast
    Bouquet.tsx         Ilustraciones referenciales de los ramos (SVG)
    Carousel.tsx        Carrusel infinito, continuo y arrastrable
    ProductModal.tsx    Ficha del ramo: galería, significado, ocasiones y relacionados
    Reveal.tsx          Aparición suave al hacer scroll
  pages/
    Home.tsx            Inicio: resúmenes de colección y ocasiones
    Catalog.tsx         Catálogo: búsqueda, filtros y todos los ramos
    Occasions.tsx       Ocasiones: ideas y mensajes (sin ramos)
  index.css             Diseño: paleta, modo oscuro, animaciones y Tailwind
```

## Dónde editar

- **Ramos, precios, textos:** `src/data/products.ts` → `products`
- **Ocasiones (mensaje, paleta, detalle):** `src/data/products.ts` → `MOODS`
- **Colores de marca:** `:root` en `src/index.css` y `@theme` (utilidades Tailwind como `text-brown`, `bg-ivory`)
- **Instagram:** `src/components/Footer.tsx` (https://www.instagram.com/_ilatey_)
- **Logo:** `public/logo.jpg`

## Notas

- Las imágenes de los ramos son ilustraciones referenciales (`Bouquet.tsx`). Para usar fotos reales, sustituye el componente `<Bouquet />` por `<img>` en `Carousel`, `Catalog` y `ProductModal`.
- Para publicar en un hosting estático (Netlify, Vercel…) configura una regla de reescritura a `index.html` para que funcionen rutas como `/catalogo` al recargar.
- Respeta `prefers-reduced-motion` y el modo claro/oscuro del sistema.
