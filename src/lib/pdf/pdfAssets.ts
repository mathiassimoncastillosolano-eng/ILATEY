import { createElement } from 'react'
import type { BouquetConfig } from '../../types/customization'
import type { PdfFontBytes } from './renderRequestPdf'
import serifUrl from '../../assets/pdf-fonts/CormorantGaramond-Regular.ttf?url'
import serifMediumUrl from '../../assets/pdf-fonts/CormorantGaramond-Medium.ttf?url'
import serifItalicUrl from '../../assets/pdf-fonts/CormorantGaramond-Italic.ttf?url'
import sansUrl from '../../assets/pdf-fonts/DMSans-Regular.ttf?url'
import sansBoldUrl from '../../assets/pdf-fonts/DMSans-SemiBold.ttf?url'

/** Recursos del navegador que necesita el PDF: tipografías de marca y la imagen del ramo. Solo se cargan al generar un PDF. */

const isTrueType = (b: Uint8Array) =>
  (b[0] === 0x00 && b[1] === 0x01 && b[2] === 0x00 && b[3] === 0x00) || (b[0] === 0x74 && b[1] === 0x72 && b[2] === 0x75 && b[3] === 0x65)

async function fetchFont(url: string): Promise<Uint8Array> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No se pudo cargar una tipografía del documento (${res.status}).`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  // Si el servidor responde con la página de inicio (SPA) en lugar de la fuente, no es TrueType.
  if (!isTrueType(bytes)) throw new Error('La tipografía del documento llegó dañada.')
  return bytes
}

export async function loadPdfFonts(): Promise<PdfFontBytes> {
  const [serif, serifMedium, serifItalic, sans, sansBold] = await Promise.all(
    [serifUrl, serifMediumUrl, serifItalicUrl, sansUrl, sansBoldUrl].map(fetchFont),
  )
  return { serif, serifMedium, serifItalic, sans, sansBold }
}

/**
 * PNG de la vista ilustrativa del ramo (800×1000), dibujada con el mismo SVG de la vista previa.
 * Es opcional: si el navegador no puede rasterizar, devuelve null y el PDF se compone sin imagen.
 */
export async function rasterizeBouquet(config: BouquetConfig): Promise<Uint8Array | null> {
  try {
    const [{ renderToStaticMarkup }, { BouquetSvg }] = await Promise.all([
      import('react-dom/server'),
      import('../../components/customizer/BouquetPreview'),
    ])
    const W = 800
    const H = 1000
    const markup = renderToStaticMarkup(createElement(BouquetSvg, { config, still: true }))
    const svg = markup.replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" `)
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('No se pudo dibujar el ramo.'))
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    })
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    // Mismo fondo que .cz-pv svg: de marfil a un nude suave.
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#F6F2EA')
    bg.addColorStop(1, '#ECDDD5')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    ctx.drawImage(img, 0, 0, W, H)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null
  } catch {
    return null
  }
}
