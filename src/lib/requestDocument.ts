import type { BouquetConfig, CardStyleId, Quote } from '../types/customization'
import {
  CARD_STYLES, FINISHES, FLOWERS, PALETTES, PAPERS, PAPER_COLORS, RIBBONS, RIBBON_COLORS, SHAPES,
} from '../data/customizationOptions'
import { PRICING, formatMoney, totalHeadline } from '../data/pricingRules'
import { bouquetOrigin } from './bouquetOrigin'
import { formatDate } from './customizerValidation'

/**
 * ÚNICA fuente de datos de una solicitud. El TXT (requestText.ts), el PDF (pdf/renderRequestPdf.ts) y el mensaje de
 * WhatsApp (whatsapp.ts) se generan todos a partir de este objeto, que a su vez se deriva de BouquetConfig + Quote.
 * Aquí se decide qué texto se muestra cuando falta un dato; los formatos solo lo dibujan.
 */

export const NOT_SPECIFIED = 'No especificado'
export const NOT_SPECIFIED_OPTIONAL = 'No especificado (opcional)'

export interface DocSwatch { name: string; hex: string }
export interface DocPriceLine { label: string; detail?: string; amount: string; pending: boolean }

export interface RequestDocument {
  reference: string
  createdAt: string
  /** «8 de noviembre de 2026» */
  createdLabel: string
  /** ILATEY-Solicitud-ILA-XXXXXXXX (sin extensión) */
  fileBase: string

  bouquetName: string
  origin: { kind: 'catalog' | 'catalog-custom' | 'custom'; label: string; baseName: string | null }
  /** Una línea: «9 flores · Rosas · Redondo clásico · Nude» */
  summary: string

  flowers: { name: string; qty: number }[]
  totalFlowers: number
  shape: string
  palettes: DocSwatch[]

  wrapping: {
    paper: string
    paperColor: DocSwatch
    layers: string
    ribbon: string
    ribbonColor: DocSwatch
    finish: string
    box: string
  }

  card: { styleId: CardStyleId; style: string; recipient: string; message: string; sender: string }

  delivery: {
    /** «15 de diciembre de 2026» o null */
    date: string | null
    /** «15/12/2026» o null */
    dateShort: string | null
    budget: string | null
    notes: string
    preferences: string
    restrictions: string
  }

  pricing: {
    groups: { label: string; lines: DocPriceLine[] }[]
    subtotal: string
    pending: string[]
    totalLabel: string
    totalValue: string
    totalSuffix: string
    notes: string[]
  }
}

const nameOf = <T extends string>(list: { id: T; name: string }[], id: T) => list.find((x) => x.id === id)?.name ?? id

const amountLabel = (a: number | null) => (a === null ? 'Por cotizar' : a === 0 ? 'Incluido' : formatMoney(a))

/** 2026-12-15 → 15/12/2026 */
export const shortDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : iso
}

const clean = (s: string) => s.trim()

export function buildRequestDocument(c: BouquetConfig, q: Quote, id: string, createdAt: string): RequestDocument {
  const origin = bouquetOrigin(c)
  const w = c.wrapping
  const created = new Date(createdAt)
  const flowers = FLOWERS.filter((f) => c.flowers[f.id]).map((f) => ({ name: f.name, qty: c.flowers[f.id] ?? 0 }))
  const shape = c.shape ? nameOf(SHAPES, c.shape) : NOT_SPECIFIED
  const palettes = c.palettes.map((pid) => {
    const p = PALETTES.find((x) => x.id === pid)
    return { name: p?.name ?? pid, hex: p?.swatches[0] ?? '#D9B7AC' }
  })
  const paperColor = PAPER_COLORS.find((x) => x.id === w.paperColor)
  const ribbonColor = RIBBON_COLORS.find((x) => x.id === w.ribbonColor)
  const head = totalHeadline(q)

  const bouquetName = origin.kind === 'catalog' ? origin.product.name : 'Ramo personalizado'
  const originLabel =
    origin.kind === 'catalog' ? 'Ramo de catálogo'
      : origin.kind === 'catalog-custom' ? 'Diseño personalizado a partir de un ramo de catálogo'
        : 'Diseño personalizado'

  const notes: string[] = []
  if (q.pending.length > 0 && q.totalFlowers > 0) {
    notes.push(`El total no es definitivo: ${q.pending.length === 1 ? 'hay 1 elemento' : `hay ${q.pending.length} elementos`} sin precio definido. ILATEY te confirmará su valor.`)
  }
  if (q.provisional) notes.push(`Precios provisionales y referenciales. ${PRICING.source}`)
  notes.push('Precio referencial: sujeto a confirmación por ILATEY.')

  return {
    reference: id,
    createdAt,
    createdLabel: new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).format(created),
    fileBase: `ILATEY-Solicitud-${id}`,

    bouquetName,
    origin: { kind: origin.kind, label: originLabel, baseName: origin.product?.name ?? null },
    summary: [
      q.totalFlowers > 0 ? `${q.totalFlowers} ${q.totalFlowers === 1 ? 'flor' : 'flores'}` : null,
      flowers.length ? flowers.map((f) => f.name).join(', ') : null,
      c.shape ? shape : null,
      palettes.length ? palettes.map((p) => p.name).join(', ') : null,
    ].filter(Boolean).join(' · '),

    flowers,
    totalFlowers: q.totalFlowers,
    shape,
    palettes,

    wrapping: {
      paper: nameOf(PAPERS, w.paper),
      paperColor: { name: paperColor?.name ?? w.paperColor, hex: paperColor?.hex ?? '#F1E8D8' },
      layers: `${w.layers} ${w.layers === 1 ? 'capa' : 'capas'}`,
      ribbon: nameOf(RIBBONS, w.ribbon),
      ribbonColor: { name: ribbonColor?.name ?? w.ribbonColor, hex: ribbonColor?.hex ?? '#B98272' },
      finish: nameOf(FINISHES, w.finish),
      box: w.box ? 'Sí (por cotizar)' : 'No',
    },

    card: {
      styleId: c.card.style,
      style: nameOf(CARD_STYLES, c.card.style),
      recipient: clean(c.card.recipient),
      message: clean(c.card.message),
      sender: clean(c.card.sender),
    },

    delivery: {
      date: c.extras.deliveryDate ? formatDate(c.extras.deliveryDate) : null,
      dateShort: c.extras.deliveryDate ? shortDate(c.extras.deliveryDate) : null,
      budget: c.extras.budget !== null ? formatMoney(c.extras.budget) : null,
      notes: clean(c.extras.notes),
      preferences: clean(c.extras.preferences),
      restrictions: clean(c.extras.restrictions),
    },

    pricing: {
      groups: q.groups.filter((g) => g.lines.length > 0).map((g) => ({
        label: g.label,
        lines: g.lines.map((l) => ({ label: l.label, detail: l.detail, amount: amountLabel(l.amount), pending: l.amount === null })),
      })),
      subtotal: formatMoney(q.subtotal),
      pending: q.pending.map((l) => l.label.replace(/^\d+ × /, '')),
      totalLabel: head.label,
      totalValue: head.value,
      totalSuffix: !q.isComplete && q.totalFlowers > 0 ? '+ por cotizar' : '',
      notes,
    },
  }
}
