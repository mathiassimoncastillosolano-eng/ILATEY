import fontkit from '@pdf-lib/fontkit'
import {
  LineCapStyle, LineJoinStyle, PDFDocument, appendBezierCurve, clip, closePath, degrees, endPath, lineTo, moveTo,
  popGraphicsState, pushGraphicsState, rgb, setLineJoin,
} from 'pdf-lib'
import type { PDFFont, PDFImage, PDFPage } from 'pdf-lib'
import { LOGO_PATHS } from '../../components/branding/logoPaths'
import type { RequestDocument } from '../requestDocument'
import { NOT_SPECIFIED, NOT_SPECIFIED_OPTIONAL } from '../requestDocument'

/**
 * Documento PDF editorial de una solicitud. Módulo puro: recibe el RequestDocument (la misma fuente que el TXT),
 * los bytes de las fuentes y, si existe, una imagen PNG del ramo. No toca el DOM ni la red.
 * Todo se dibuja con vectores: el logo sale de logoPaths.ts (el original del proyecto), no se redibuja ni se rasteriza.
 */

export interface PdfFontBytes {
  serif: Uint8Array
  serifMedium: Uint8Array
  serifItalic: Uint8Array
  sans: Uint8Array
  sansBold: Uint8Array
}

export interface PdfOptions {
  fonts: PdfFontBytes
  /** PNG del ramo (vista ilustrativa). Opcional: si falta, el documento se compone sin imagen. */
  bouquetPng?: Uint8Array | null
}

/* ───────────── Paleta: los mismos tokens de brand.css / index.css ───────────── */
const hex = (h: string) => rgb(...([1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number]))
const C = {
  ivory: hex('#F6F2EA'), warm: hex('#FCFAF7'), nude: hex('#E8D4CC'), blush: hex('#D9B7AC'),
  copper: hex('#B98272'), copText: hex('#96604F'), brown: hex('#72564D'), ink: hex('#302C2A'), sage: hex('#8A9677'),
}

/** Fondos de tarjeta de dedicatoria: los de .cz-card-* en customizer.css */
const CARD_FILL = { clasica: '#FBF7EF', floral: '#F2DDD6', kraft: '#D8BC9B', minimal: '#FFFFFF' } as const

/* ───────────── Geometría de página (A4, puntos) ───────────── */
const W = 595.28
const H = 841.89
const ML = 56
const MR = 56
const CW = W - ML - MR
const BOTTOM = 96 // por debajo de esta distancia al borde inferior vive el pie
const TOP_NEXT = 100 // inicio del contenido en páginas 2+

const PETAL = 'M20 2 C34 14 40 38 20 58 C0 38 6 14 20 2 Z'
const K = 0.5523

/** Rectángulo redondeado como path SVG (origen arriba-izquierda, y hacia abajo). */
function roundedRect(w: number, h: number, r: number): string {
  const k = r * K
  return `M${r} 0 L${w - r} 0 C${w - r + k} 0 ${w} ${r - k} ${w} ${r} L${w} ${h - r} C${w} ${h - r + k} ${w - r + k} ${h} ${w - r} ${h} L${r} ${h} C${r - k} ${h} 0 ${h - r + k} 0 ${h - r} L0 ${r} C0 ${r - k} ${r - k} 0 ${r} 0 Z`
}

export async function renderRequestPdf(d: RequestDocument, opts: PdfOptions): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  pdf.setTitle(`Detalle de tu ramo · ${d.reference}`)
  pdf.setAuthor('ILATEY Flower Studio')
  pdf.setSubject('Solicitud de ramo')
  pdf.setCreator('ILATEY Flower Studio')
  pdf.setProducer('ILATEY Flower Studio')
  pdf.setLanguage('es-PE')
  const created = new Date(d.createdAt)
  if (!Number.isNaN(created.getTime())) { pdf.setCreationDate(created); pdf.setModificationDate(created) }

  const F = {
    serif: await pdf.embedFont(opts.fonts.serif, { subset: true }),
    serifMedium: await pdf.embedFont(opts.fonts.serifMedium, { subset: true }),
    serifItalic: await pdf.embedFont(opts.fonts.serifItalic, { subset: true }),
    sans: await pdf.embedFont(opts.fonts.sans, { subset: true }),
    sansBold: await pdf.embedFont(opts.fonts.sansBold, { subset: true }),
  }
  const image: PDFImage | null = opts.bouquetPng ? await pdf.embedPng(opts.bouquetPng).catch(() => null) : null

  /* ───────────── Texto seguro: solo glifos que la fuente tiene ───────────── */
  const charsets = new Map<PDFFont, Set<number>>()
  const safe = (s: string, f: PDFFont): string => {
    let set = charsets.get(f)
    if (!set) { set = new Set(f.getCharacterSet()); charsets.set(f, set) }
    let out = ''
    for (const ch of s.replace(/\r\n?/g, '\n').replace(/[\t\u00A0]/g, ' ')) {
      const cp = ch.codePointAt(0) ?? 0
      if (ch === '\n' || set.has(cp)) out += ch
      // Emojis y símbolos que la tipografía no trae se omiten (el TXT sí los conserva).
    }
    return out
  }

  const wrap = (text: string, f: PDFFont, size: number, maxW: number): string[] => {
    const lines: string[] = []
    for (const para of safe(text, f).split('\n')) {
      if (para.trim() === '') { lines.push(''); continue }
      let line = ''
      const push = (w: string) => {
        const test = line ? `${line} ${w}` : w
        if (f.widthOfTextAtSize(test, size) <= maxW) { line = test; return }
        if (line) lines.push(line)
        // Palabra más ancha que la columna: se parte por caracteres.
        if (f.widthOfTextAtSize(w, size) > maxW) {
          let chunk = ''
          for (const ch of w) {
            if (f.widthOfTextAtSize(chunk + ch, size) > maxW && chunk) { lines.push(chunk); chunk = ch } else chunk += ch
          }
          line = chunk
        } else line = w
      }
      para.split(/ +/).filter(Boolean).forEach(push)
      lines.push(line)
    }
    return lines
  }

  /* ───────────── Páginas y cursor (y = distancia desde el borde superior) ───────────── */
  const pages: PDFPage[] = []
  let page!: PDFPage
  let y = 0
  const py = (top: number) => H - top

  const frame = (p: PDFPage) => {
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.ivory })
    p.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44, borderColor: C.nude, borderWidth: 0.7 })
  }

  const symbol = (p: PDFPage, x: number, top: number, width: number, stroke = 2, color = C.copper) => {
    const scale = width / 100
    p.pushOperators(pushGraphicsState(), setLineJoin(LineJoinStyle.Round))
    for (const path of [LOGO_PATHS.arch, LOGO_PATHS.left, LOGO_PATHS.right]) {
      p.drawSvgPath(path, { x, y: py(top), scale, borderColor: color, borderWidth: stroke, borderLineCap: LineCapStyle.Round })
    }
    p.pushOperators(popGraphicsState())
  }

  const petal = (p: PDFPage, cx: number, cy: number, h: number, deg: number, color = C.blush, opacity = 0.5) => {
    const s = h / 60
    // El pétalo tiene el origen en su esquina: se desplaza para girar sobre su centro.
    const rad = (deg * Math.PI) / 180
    const ox = 20 * s
    const oy = 30 * s
    const x = cx - (ox * Math.cos(rad) - oy * Math.sin(rad))
    const yy = cy + (ox * Math.sin(rad) + oy * Math.cos(rad))
    p.drawSvgPath(PETAL, { x, y: yy, scale: s, rotate: degrees(-deg), color, opacity })
  }

  const tracked = (p: PDFPage, text: string, x: number, baseline: number, f: PDFFont, size: number, track: number, color = C.ink, opacity = 1) => {
    let cx = x
    for (const ch of safe(text, f)) {
      p.drawText(ch, { x: cx, y: baseline, font: f, size, color, opacity })
      cx += f.widthOfTextAtSize(ch, size) + track
    }
    return cx - track - x
  }

  const newPage = () => {
    page = pdf.addPage([W, H])
    pages.push(page)
    frame(page)
    if (pages.length === 1) return
    // Cabecera discreta de continuación
    symbol(page, ML, 50, 15, 3.6)
    tracked(page, 'ILATEY', ML + 24, py(61), F.serifMedium, 12, 3, C.brown)
    const right = `Detalle de tu ramo · ${d.reference}`
    page.drawText(safe(right, F.sans), { x: W - MR - F.sans.widthOfTextAtSize(safe(right, F.sans), 7.6), y: py(60), font: F.sans, size: 7.6, color: C.brown, opacity: 0.75 })
    page.drawLine({ start: { x: ML, y: py(76) }, end: { x: W - MR, y: py(76) }, thickness: 0.6, color: C.nude })
    y = TOP_NEXT
  }
  const ensure = (h: number) => { if (y + h > H - BOTTOM) newPage() }

  /* ───────────── Primitivas de contenido ───────────── */
  const label = (text: string, x: number, top: number) =>
    tracked(page, text.toUpperCase(), x, py(top + 6.6), F.sansBold, 6.6, 1.5, C.copText)

  const dot = (x: number, cy: number, color: string, r = 4.4) => {
    page.drawCircle({ x: x + r, y: cy, size: r, color: hex(color), borderColor: C.blush, borderWidth: 0.6 })
    return r * 2
  }

  const dotted = (x1: number, x2: number, yy: number) =>
    page.drawLine({ start: { x: x1, y: yy }, end: { x: x2, y: yy }, thickness: 0.7, color: C.blush, dashArray: [0.6, 2.6], lineCap: LineCapStyle.Round })

  const hairline = (top: number, x1 = ML, x2 = W - MR, color = C.nude) =>
    page.drawLine({ start: { x: x1, y: py(top) }, end: { x: x2, y: py(top) }, thickness: 0.6, color })

  const isPlaceholder = (v: string) => v === NOT_SPECIFIED || v === NOT_SPECIFIED_OPTIONAL

  /** Texto de valor: normal, o cursiva atenuada cuando el dato no se indicó. */
  const valueLines = (v: string, w: number) =>
    isPlaceholder(v)
      ? { lines: [safe(v, F.serifItalic)], font: F.serifItalic, size: 11, lh: 14, color: C.brown, opacity: 0.7 }
      : { lines: wrap(v, F.sans, 9.8, w), font: F.sans, size: 9.8, lh: 14.2, color: C.ink, opacity: 1 }

  type KV = { label: string; value: string; swatch?: string }

  /** Cuadrícula de pares etiqueta/valor en columnas. */
  const kvGrid = (items: KV[], cols = 2) => {
    const gap = 22
    const colW = (CW - gap * (cols - 1)) / cols
    for (let i = 0; i < items.length; i += cols) {
      const row = items.slice(i, i + cols)
      const prepared = row.map((it) => {
        const inset = it.swatch ? 14 : 0
        return { it, inset, v: valueLines(it.value, colW - inset) }
      })
      const h = Math.max(...prepared.map((p) => 13 + p.v.lines.length * p.v.lh)) + 9
      ensure(h)
      prepared.forEach((p, c) => {
        const x = ML + c * (colW + gap)
        label(p.it.label, x, y)
        if (p.it.swatch) dot(x, py(y + 13 + p.v.lh * 0.45), p.it.swatch)
        p.v.lines.forEach((ln, li) => {
          page.drawText(ln, { x: x + p.inset, y: py(y + 13 + p.v.size + li * p.v.lh - 2), font: p.v.font, size: p.v.size, color: p.v.color, opacity: p.v.opacity })
        })
      })
      y += h
    }
  }

  /** Párrafo con etiqueta; admite textos largos repartidos en varias páginas. */
  const paragraph = (lbl: string, text: string) => {
    const v = valueLines(text, CW)
    ensure(13 + v.lh * Math.min(v.lines.length, 3) + 8)
    label(lbl, ML, y)
    y += 13
    v.lines.forEach((ln) => {
      ensure(v.lh + 2)
      page.drawText(ln, { x: ML, y: py(y + v.size - 2), font: v.font, size: v.size, color: v.color, opacity: v.opacity })
      y += v.lh
    })
    y += 9
  }

  const section = (num: string, title: string, keep = 120) => {
    ensure(keep)
    y += 16
    page.drawText(num, { x: ML, y: py(y + 12), font: F.serifItalic, size: 14, color: C.copper })
    page.drawText(safe(title, F.serifMedium), { x: ML + 27, y: py(y + 13), font: F.serifMedium, size: 19, color: C.brown })
    y += 26
    hairline(y)
    y += 15
  }

  /* ═══════════════ PÁGINA 1: encabezado editorial ═══════════════ */
  newPage()
  // Luz ambiental y pétalos en la esquina superior derecha
  page.drawCircle({ x: W - 70, y: py(78), size: 150, color: C.nude, opacity: 0.26 })
  page.drawCircle({ x: W - 118, y: py(150), size: 62, borderColor: C.blush, borderWidth: 0.7, borderOpacity: 0.7 })
  petal(page, W - 92, py(66), 52, 24, C.blush, 0.55)
  petal(page, W - 142, py(120), 34, -32, C.nude, 0.9)
  petal(page, W - 66, py(150), 28, 58, C.blush, 0.4)
  petal(page, W - 176, py(58), 20, 14, C.nude, 0.9)

  symbol(page, ML, 58, 40, 2.1)
  tracked(page, 'ILATEY', ML + 56, py(84), F.serifMedium, 25, 5, C.brown)
  tracked(page, 'FLOWER STUDIO', ML + 56, py(98), F.sansBold, 7, 3.1, C.copText)

  // Título
  const t1 = 'Detalle de tu '
  page.drawText(t1, { x: ML, y: py(178), font: F.serif, size: 42, color: C.brown })
  page.drawText('ramo', { x: ML + F.serif.widthOfTextAtSize(t1, 42), y: py(178), font: F.serifItalic, size: 42, color: C.copper })
  page.drawLine({ start: { x: ML, y: py(196) }, end: { x: ML + 34, y: py(196) }, thickness: 1.1, color: C.copper })

  // Metadatos
  const metaY = 214
  const metas = [
    { l: 'Referencia', v: d.reference, f: F.sansBold },
    { l: 'Fecha de generación', v: d.createdLabel, f: F.sans },
    { l: 'Tipo de solicitud', v: d.origin.kind === 'catalog' ? 'Ramo de catálogo' : 'Diseño personalizado', f: F.sans },
  ]
  const metaW = CW / 3
  metas.forEach((m, i) => {
    label(m.l, ML + i * metaW, metaY)
    page.drawText(safe(m.v, m.f), { x: ML + i * metaW, y: py(metaY + 25), font: m.f, size: 11, color: C.brown })
  })
  y = metaY + 46
  hairline(y)
  y += 6

  /* ═══════════════ 01 · Identificación del ramo ═══════════════ */
  section('01', 'Identificación del ramo', 230)
  {
    const pad = 16
    const imgW = image ? 122 : 0
    const imgH = image ? 152 : 0
    const textX = ML + pad + (image ? imgW + 22 : 0)
    const textW = ML + CW - pad - textX

    const nameLines = wrap(d.bouquetName, F.serifMedium, 25, textW)
    const originLines = wrap(d.origin.label + (d.origin.baseName && d.origin.kind === 'catalog-custom' ? ` · ${d.origin.baseName}` : ''), F.sans, 9, textW - 18)
    const sumLines = d.summary ? wrap(d.summary, F.sans, 9.4, textW) : []
    const textH = nameLines.length * 28 + 12 + originLines.length * 12 + 22 + (sumLines.length ? 10 + sumLines.length * 14 : 0)
    const cardH = Math.max(imgH, textH) + pad * 2
    ensure(cardH + 8)

    page.drawSvgPath(roundedRect(CW, cardH, 14), { x: ML, y: py(y), color: C.warm, borderColor: C.nude, borderWidth: 0.8 })

    if (image) {
      const ax = ML + pad
      const ay = y + pad
      const r = imgW / 2
      const k = r * K
      // Arco clásico de ILATEY: media circunferencia arriba y base con esquinas suaves.
      const bx = ax
      const by = py(ay + imgH)
      const rr = 10
      page.pushOperators(
        pushGraphicsState(),
        moveTo(bx + rr, by),
        lineTo(bx + imgW - rr, by),
        appendBezierCurve(bx + imgW - rr + rr * K, by, bx + imgW, by + rr - rr * K, bx + imgW, by + rr),
        lineTo(bx + imgW, py(ay) - r),
        appendBezierCurve(bx + imgW, py(ay) - r + k, bx + r + k, py(ay), bx + r, py(ay)),
        appendBezierCurve(bx + r - k, py(ay), bx, py(ay) - r + k, bx, py(ay) - r),
        lineTo(bx, by + rr),
        appendBezierCurve(bx, by + rr - rr * K, bx + rr - rr * K, by, bx + rr, by),
        closePath(), clip(), endPath(),
      )
      page.drawRectangle({ x: bx, y: by, width: imgW, height: imgH, color: C.nude, opacity: 0.55 })
      // El PNG es 4:5; se ajusta cubriendo el arco.
      const scale = Math.max(imgW / image.width, imgH / image.height)
      const iw = image.width * scale
      const ih = image.height * scale
      page.drawImage(image, { x: bx - (iw - imgW) / 2, y: by - (ih - imgH) / 2, width: iw, height: ih })
      page.pushOperators(popGraphicsState())
    }

    let ty = y + pad + (Math.max(imgH, textH) - textH) / 2
    nameLines.forEach((ln, i) => { page.drawText(ln, { x: textX, y: py(ty + 20 + i * 28), font: F.serifMedium, size: 25, color: C.brown }) })
    ty += nameLines.length * 28 + 12
    // Etiqueta de origen
    const chipW = Math.min(textW, Math.max(...originLines.map((l) => F.sans.widthOfTextAtSize(l, 9))) + 18)
    const chipH = originLines.length * 12 + 10
    page.drawSvgPath(roundedRect(chipW, chipH, chipH / 2 > 12 ? 10 : chipH / 2), { x: textX, y: py(ty), color: C.nude, opacity: 0.7 })
    originLines.forEach((ln, i) => { page.drawText(ln, { x: textX + 9, y: py(ty + 12 + i * 12 - 1), font: F.sans, size: 9, color: C.copText }) })
    ty += chipH + 12
    if (sumLines.length) {
      sumLines.forEach((ln, i) => { page.drawText(ln, { x: textX, y: py(ty + 10 + i * 14), font: F.sans, size: 9.4, color: C.ink, opacity: 0.85 }) })
    }
    y += cardH + 6
  }

  /* ═══════════════ 02 · Composición floral ═══════════════ */
  section('02', 'Composición floral', 96)
  d.flowers.forEach((f) => {
    ensure(26)
    const baseline = py(y + 17)
    const qtyTxt = `× ${f.qty}`
    const qw = F.sansBold.widthOfTextAtSize(qtyTxt, 10)
    const nm = safe(f.name, F.serifMedium)
    const nw = F.serifMedium.widthOfTextAtSize(nm, 14.5)
    page.drawText(nm, { x: ML, y: baseline, font: F.serifMedium, size: 14.5, color: C.brown })
    dotted(ML + nw + 8, W - MR - qw - 8, baseline + 3)
    page.drawText(qtyTxt, { x: W - MR - qw, y: baseline, font: F.sansBold, size: 10, color: C.brown })
    y += 25
  })
  ensure(36)
  hairline(y + 3)
  tracked(page, 'CANTIDAD TOTAL', ML, py(y + 22), F.sansBold, 6.6, 1.5, C.copText)
  const totalTxt = `${d.totalFlowers} ${d.totalFlowers === 1 ? 'flor' : 'flores'}`
  page.drawText(totalTxt, { x: W - MR - F.serifMedium.widthOfTextAtSize(totalTxt, 16), y: py(y + 23), font: F.serifMedium, size: 16, color: C.brown })
  y += 38
  kvGrid([{ label: 'Forma del ramo', value: d.shape }])
  // Paleta de colores
  ensure(48)
  label('Paleta de colores', ML, y)
  y += 15
  if (d.palettes.length === 0) {
    page.drawText(NOT_SPECIFIED, { x: ML, y: py(y + 9), font: F.serifItalic, size: 11, color: C.brown, opacity: 0.7 })
    y += 20
  } else {
    let cx = ML
    d.palettes.forEach((p) => {
      const nm = safe(p.name, F.sans)
      const w = 8.8 + 7 + F.sans.widthOfTextAtSize(nm, 9.8) + 20
      if (cx + w > W - MR) { cx = ML; y += 20 }
      ensure(20)
      dot(cx, py(y + 6), p.hex, 4.4)
      page.drawText(nm, { x: cx + 15, y: py(y + 9.2), font: F.sans, size: 9.8, color: C.ink })
      cx += w
    })
    y += 22
  }

  /* ═══════════════ 03 · Presentación ═══════════════ */
  section('03', 'Presentación', 90)
  const w = d.wrapping
  kvGrid([
    { label: 'Papel', value: w.paper },
    { label: 'Color del papel', value: w.paperColor.name, swatch: w.paperColor.hex },
    { label: 'Capas de papel', value: w.layers },
    { label: 'Cinta', value: w.ribbon },
    { label: 'Color de la cinta', value: w.ribbonColor.name, swatch: w.ribbonColor.hex },
    { label: 'Lazo o moño', value: w.finish },
    { label: 'Caja de regalo', value: w.box },
  ])

  /* ═══════════════ 04 · Dedicatoria ═══════════════ */
  section('04', 'Dedicatoria', 140)
  {
    const fill = hex(CARD_FILL[d.card.styleId] ?? CARD_FILL.clasica)
    const cardW = Math.min(CW, 330)
    const pad = 22
    const inner = cardW - pad * 2
    const toTxt = d.card.recipient ? `Para ${d.card.recipient}` : ''
    const toLines = toTxt ? wrap(toTxt, F.serifItalic, 13, inner) : []
    const msg = d.card.message ? `“${d.card.message}”` : 'Sin mensaje (opcional)'
    const msgLines = wrap(msg, F.serifItalic, d.card.message ? 15 : 12, inner)
    const fromLines = d.card.sender ? wrap(`— ${d.card.sender}`, F.serifItalic, 13, inner) : []
    const msgSize = d.card.message ? 15 : 12
    const h = pad * 2 + toLines.length * 17 + (toLines.length ? 10 : 0) + msgLines.length * (msgSize * 1.32) + (fromLines.length ? 12 + fromLines.length * 17 : 0)
    ensure(h + 10)
    page.drawSvgPath(roundedRect(cardW, h, 5), { x: ML, y: py(y), color: fill, borderColor: d.card.styleId === 'minimal' ? C.nude : C.blush, borderWidth: 0.7 })
    if (d.card.styleId === 'clasica') page.drawSvgPath(roundedRect(cardW - 14, h - 14, 3), { x: ML + 7, y: py(y + 7), borderColor: C.copper, borderWidth: 0.7 })
    let ty = y + pad
    toLines.forEach((ln) => { page.drawText(ln, { x: ML + pad, y: py(ty + 13), font: F.serifItalic, size: 13, color: C.brown }); ty += 17 })
    if (toLines.length) ty += 10
    msgLines.forEach((ln) => { page.drawText(ln, { x: ML + pad, y: py(ty + msgSize), font: F.serifItalic, size: msgSize, color: C.brown, opacity: d.card.message ? 1 : 0.6 }); ty += msgSize * 1.32 })
    if (fromLines.length) {
      ty += 12
      fromLines.forEach((ln) => {
        const lw = F.serifItalic.widthOfTextAtSize(ln, 13)
        page.drawText(ln, { x: ML + cardW - pad - lw, y: py(ty + 13), font: F.serifItalic, size: 13, color: C.brown })
        ty += 17
      })
    }
    // Datos junto a la tarjeta (a la derecha si cabe)
    const sx = ML + cardW + 26
    const sw = W - MR - sx
    if (sw > 120) {
      let sy = y + 4
      // El destinatario y el remitente ya se leen en la tarjeta; aquí solo se repiten si faltan.
      const side: KV[] = [{ label: 'Diseño de tarjeta', value: d.card.style }]
      if (!d.card.recipient) side.push({ label: 'Destinatario', value: NOT_SPECIFIED })
      if (!d.card.sender) side.push({ label: 'Remitente', value: NOT_SPECIFIED })
      side.forEach((it) => {
        const v = valueLines(it.value, sw)
        label(it.label, sx, sy)
        v.lines.forEach((ln, i) => page.drawText(ln, { x: sx, y: py(sy + 13 + v.size + i * v.lh - 2), font: v.font, size: v.size, color: v.color, opacity: v.opacity }))
        sy += 13 + v.lines.length * v.lh + 11
      })
    }
    y += h + 12
    if (sw <= 120) kvGrid([{ label: 'Diseño de tarjeta', value: d.card.style }])
  }

  /* ═══════════════ 05 · Entrega y observaciones ═══════════════ */
  section('05', 'Entrega y observaciones', 100)
  kvGrid([
    { label: 'Fecha deseada de entrega', value: d.delivery.date ? `${d.delivery.date}` : NOT_SPECIFIED_OPTIONAL },
    { label: 'Presupuesto aproximado', value: d.delivery.budget ?? NOT_SPECIFIED_OPTIONAL },
  ])
  if (d.delivery.date) {
    page.drawText('Fecha sujeta a confirmación del taller.', { x: ML, y: py(y + 7), font: F.serifItalic, size: 10.5, color: C.brown, opacity: 0.8 })
    y += 24
  }
  paragraph('Comentarios', d.delivery.notes || NOT_SPECIFIED_OPTIONAL)
  paragraph('Preferencias', d.delivery.preferences || NOT_SPECIFIED_OPTIONAL)
  paragraph('Restricciones', d.delivery.restrictions || NOT_SPECIFIED_OPTIONAL)

  /* ═══════════════ 06 · Información económica ═══════════════ */
  section('06', 'Información económica', 110)
  d.pricing.groups.forEach((g) => {
    ensure(18 + g.lines.length * 19)
    label(g.label, ML, y)
    y += 15
    g.lines.forEach((l) => {
      ensure(19)
      const baseline = py(y + 11)
      const left = safe(l.label, F.sans)
      const lw = F.sans.widthOfTextAtSize(left, 9.8)
      page.drawText(left, { x: ML, y: baseline, font: F.sans, size: 9.8, color: C.ink })
      let endX = ML + lw
      if (l.detail) {
        const dt = safe(`· ${l.detail}`, F.sans)
        page.drawText(dt, { x: ML + lw + 5, y: baseline, font: F.sans, size: 8.2, color: C.brown, opacity: 0.7 })
        endX += 5 + F.sans.widthOfTextAtSize(dt, 8.2)
      }
      const amt = safe(l.amount, l.pending ? F.serifItalic : F.sansBold)
      const af = l.pending ? F.serifItalic : F.sansBold
      const asz = l.pending ? 11 : 9.8
      const aw = af.widthOfTextAtSize(amt, asz)
      dotted(endX + 8, W - MR - aw - 8, baseline + 3)
      page.drawText(amt, { x: W - MR - aw, y: baseline, font: af, size: asz, color: l.pending ? C.copText : C.brown })
      y += 19
    })
    y += 8
  })
  ensure(60)
  hairline(y)
  y += 6
  {
    const l = 'Subtotal con precio definido'
    const v = safe(d.pricing.subtotal, F.sansBold)
    page.drawText(l, { x: ML, y: py(y + 14), font: F.sans, size: 9.8, color: C.ink })
    page.drawText(v, { x: W - MR - F.sansBold.widthOfTextAtSize(v, 9.8), y: py(y + 14), font: F.sansBold, size: 9.8, color: C.brown })
    y += 26
  }
  if (d.pricing.pending.length) {
    paragraph('Conceptos pendientes de cotización', d.pricing.pending.join(' · '))
  }
  // Total
  {
    const h = 66
    ensure(h + 12)
    page.drawSvgPath(roundedRect(CW, h, 14), { x: ML, y: py(y), color: C.brown })
    tracked(page, d.pricing.totalLabel.toUpperCase(), ML + 22, py(y + 28), F.sansBold, 7.2, 2.2, C.blush)
    if (d.pricing.totalSuffix) page.drawText(d.pricing.totalSuffix, { x: ML + 22, y: py(y + 47), font: F.serifItalic, size: 11.5, color: C.blush })
    const tv = safe(d.pricing.totalValue, F.serifMedium)
    page.drawText(tv, { x: W - MR - 22 - F.serifMedium.widthOfTextAtSize(tv, 32), y: py(y + 43), font: F.serifMedium, size: 32, color: C.ivory })
    y += h + 14
  }
  d.pricing.notes.forEach((n) => {
    wrap(n, F.sans, 7.8, CW).forEach((ln) => {
      ensure(11)
      page.drawText(ln, { x: ML, y: py(y + 8), font: F.sans, size: 7.8, color: C.brown, opacity: 0.8 })
      y += 11
    })
    y += 3
  })

  /* ═══════════════ Cierre ═══════════════ */
  ensure(140)
  y += 22
  symbol(page, W / 2 - 13, y, 26, 2.8)
  y += 50
  const thanks = 'Gracias por contar con nosotros.'
  page.drawText(thanks, { x: (W - F.serifItalic.widthOfTextAtSize(thanks, 24)) / 2, y: py(y + 18), font: F.serifItalic, size: 24, color: C.brown })
  y += 32
  wrap('Cada detalle de tu ramo se prepara con especial cariño. Nuestro equipo estará encantado de acompañarte.', F.sans, 9, 330).forEach((ln) => {
    page.drawText(ln, { x: (W - F.sans.widthOfTextAtSize(ln, 9)) / 2, y: py(y + 8), font: F.sans, size: 9, color: C.brown, opacity: 0.85 })
    y += 14
  })

  /* ═══════════════ Pie de página (con total de páginas) ═══════════════ */
  const total = pages.length
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: ML, y: 70 }, end: { x: W - MR, y: 70 }, thickness: 0.6, color: C.nude })
    symbol(p, ML, H - 60, 11, 3.4)
    tracked(p, 'ILATEY FLOWER STUDIO', ML + 19, 47, F.sansBold, 6.8, 1.8, C.copText)
    p.drawText(safe('Gracias por contar con nosotros · Solicitud sujeta a confirmación comercial', F.sans), { x: ML + 19, y: 36, font: F.sans, size: 6.8, color: C.brown, opacity: 0.8 })
    const pg = `Página ${i + 1} de ${total}`
    p.drawText(pg, { x: W - MR - F.sansBold.widthOfTextAtSize(pg, 7.2), y: 47, font: F.sansBold, size: 7.2, color: C.copText })
    const ref = safe(d.reference, F.sans)
    p.drawText(ref, { x: W - MR - F.sans.widthOfTextAtSize(ref, 6.8), y: 36, font: F.sans, size: 6.8, color: C.brown, opacity: 0.8 })
  })

  return pdf.save()
}
