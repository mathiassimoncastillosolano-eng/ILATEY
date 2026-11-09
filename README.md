# ILATEY Flower Studio

Sitio web de ILATEY Flower Studio: flores artesanales y un configurador para diseñar tu propio ramo.

## Stack

React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS v4 · React Router 7 · Framer Motion · Zustand (persist) · Lucide · ESLint

## Cómo usarlo

```bash
npm install
npm run lint
npm run build        # incluye la comprobación de tipos (tsc -b)
npm run dev          # servidor de desarrollo
npm run preview      # vista previa del build
```

Requiere Node 20.19 o superior.

> **Estado de la verificación.** Este código se desarrolló sin acceso a la red, por lo que `npm install`, `lint` y `build` reales **no se ejecutaron**. Se comprobó la lógica con pruebas propias (precios, validación, geometría, modelo de vista previa) y un recorrido funcional con Playwright sobre un bundle de esbuild con *shims*. Ejecuta los comandos anteriores antes de publicar y revisa en especial las animaciones de Framer Motion (dibujo del logo, resortes de la vista previa).

## Estructura

```
src/
  types/customization.ts        Tipos del configurador
  data/
    products.ts                 Catálogo, ocasiones (MOODS), frases
    customizationOptions.ts     Flores, formas, paletas, papeles, cintas, tarjetas, pasos
    pricingRules.ts             ÚNICA fuente de precios y límites (valores provisionales)
  lib/
    customizerValidation.ts     Validación por paso
    bouquetLayout.ts, prng.ts   Geometría de la vista previa (con semilla)
    previewModel.ts             Modelo de la vista previa
    requestText.ts              Resumen de la solicitud en texto plano
    requestChannel.ts           Capa de integración para enviar solicitudes
    productSeed.ts, useCustomizer.ts, welcome.ts, usePageTitle.ts
  store/
    useStore.ts                 Favoritos, filtros, bienvenida
    useCustomizerStore.ts       Configurador (persistido en este dispositivo)
  components/
    branding/                   Logo SVG animado y variantes (full, symbol, navbar, footer)
    welcome/                    Bienvenida de primera visita con pétalos
    customizer/                 Configurador de 8 pasos, vista previa, resumen de precio
  pages/                        Home, Catalog, Occasions, Customize (/personalizar)
  styles/                       brand.css, customizer.css, welcome.css
public/                         favicon.svg, logo-symbol.svg, apple-touch-icon.png
```

## Configurador de ramos

Ruta `/personalizar`, con accesos desde el menú, el inicio, el catálogo y la ficha de cada ramo. Ocho pasos: flores, cantidad, forma, colores, envoltorio, tarjeta, detalles extra y resumen. El diseño se guarda en el navegador. La vista previa es **ilustrativa** y así se rotula.

### Precios (provisionales)

Todo está en `src/data/pricingRules.ts`. Los precios por flor se derivaron del catálogo actual (precio ÷ flores) y **no son tarifas oficiales**. `null` significa «por cotizar» y `0` «incluido»; mientras haya conceptos por cotizar, el total se muestra como «Desde».

ILATEY debe definir allí: precio por flor (peonía y complementos hoy por cotizar), suplementos de forma, papel, cinta, acabado, tarjeta y caja, y los límites (mínimo/máximo de flores, días de elaboración).

### Solicitud de pedido

El flujo distingue **configuración → solicitud preparada → pedido confirmado**. Hoy solo existe la solicitud preparada (local): se puede copiar o descargar como `.txt`. No se simula backend ni pagos, y no hay número de WhatsApp, correo ni API inventados. Para conectar un canal real, implementa `RequestChannel` y regístralo con `registerChannel` en `src/lib/requestChannel.ts`; el botón de envío del resumen aparecerá automáticamente.

## Marca y bienvenida

- Logo: `src/components/branding/` (`BrandLogo` con variantes). El tulipán se dibuja con `pathLength` y respeta `prefers-reduced-motion`.
- Bienvenida: pantalla completa en la primera visita (`localStorage`, clave `ilatey-welcome-v1`), con «Omitir» y Esc; se puede ver de nuevo desde el pie de página.
- Colores y tipografía: `src/styles/brand.css` y `:root` en `src/index.css`.

## Notas

- Las ilustraciones del catálogo son referenciales (`Bouquet.tsx`). Para usar fotos reales, sustituye `<Bouquet />`.
- Hosting estático: `vercel.json` y `public/_redirects` reescriben a `index.html` para rutas como `/catalogo`.
- Accesibilidad: foco visible, controles nativos, movimiento reducido y modo claro/oscuro del sistema.
- Pendiente de decidir: el catálogo muestra «Ramo a tu Medida» con un precio de referencia, mientras el configurador calcula una estimación distinta.

## Flujo de solicitud (catálogo → WhatsApp)

- **Ficha de producto**: «Quiero este ramo» (principal, empieza en el paso 5 · Envoltorio), «Personalizar este ramo» (empieza en Flores) y «Guardar».
- **Resumen**: el cliente elige PDF o TXT, se genera el documento y «Continuar por WhatsApp» lo descarga y abre `https://wa.me/51949265514` con el mensaje preparado. WhatsApp no permite adjuntar archivos desde un enlace: el cliente debe adjuntar el documento a mano (la interfaz lo indica).
- **Una sola fuente de datos**: `src/lib/requestDocument.ts` (derivado de `BouquetConfig` + `Quote`) alimenta el resumen, el TXT (`requestText.ts`), el PDF (`lib/pdf/renderRequestPdf.ts`) y el mensaje (`whatsapp.ts`).
- **PDF**: `pdf-lib` + `@pdf-lib/fontkit`, cargados solo al generar un PDF. Tipografías (Cormorant Garamond y DM Sans, licencia OFL) recortadas a Latin en `src/assets/pdf-fonts/`.

### Pruebas E2E

```bash
npm run build && npx vite preview --port 4173 &
python3 qa/e2e.py        # requiere `pip install playwright` y Chromium; capturas en /tmp/qa
```
