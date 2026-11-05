import type {
  BouquetConfig, CardStyleId, FinishId, FlowerId, LayerCount, PaperId, Quote, QuoteGroup, QuoteGroupId,
  QuoteLine, RibbonId, ShapeId,
} from '../types/customization'
import {
  CARD_STYLES, FINISHES, FLOWERS, PAPERS, RIBBONS, SHAPES, flowerById,
} from './customizationOptions'

/**
 * ÚNICA fuente de precios y límites del configurador. Ningún componente define precios por su cuenta.
 *
 * ESTADO: PROVISIONAL. ILATEY aún no ha entregado una lista de precios para personalización.
 *   · Precio por flor: derivado del catálogo actual (precio del ramo ÷ cantidad de flores, redondeado).
 *       Rosas Eternas S/ 85 ÷ 9 ≈ 9 · Ramo Ternura S/ 65 ÷ 7 ≈ 9 · Girasoles S/ 70 ÷ 5 = 14 · Margaritas S/ 55 ÷ 11 = 5
 *   · 0  = incluido (no hay un suplemento definido por el negocio).
 *   · null = sin precio definido → se muestra «Por cotizar» y el total NO se presenta como definitivo.
 *
 * Para configurar precios reales: edita estos valores. No hay que tocar ningún componente.
 */

export const PRICING = {
  currency: 'S/',
  provisional: true,
  source: 'Precio por flor derivado del catálogo actual; suplementos pendientes de definir por ILATEY.',
} as const

/** Límites de negocio provisionales (ajustables). */
export const LIMITS = {
  minTotal: 5,
  maxTotal: 100,
  maxFlowerTypes: 4,
  maxPalettes: 3,
  defaultFirstQty: 12,
  defaultNextQty: 6,
  quantityPresets: [12, 18, 24, 36, 50],
  messageMax: 240,
  nameMax: 40,
  notesMax: 600,
  shortMax: 300,
  /** Días mínimos entre hoy y la fecha deseada (el catálogo indica elaboración de 3 a 7 días). */
  leadDays: 7,
} as const

export const FLOWER_UNIT_PRICE: Record<FlowerId, number | null> = {
  rosa: 9,
  tulipan: 9,
  girasol: 14,
  margarita: 5,
  peonia: null,
  complemento: null,
}

export const SHAPE_SUPPLEMENT: Record<ShapeId, number | null> = {
  redondo: 0, compacto: 0, abierto: 0, cascada: 0, asimetrico: 0, silvestre: 0, personalizado: 0,
}
export const PAPER_SUPPLEMENT: Record<PaperId, number | null> = { kraft: 0, seda: 0, texturizado: 0 }
export const LAYER_SUPPLEMENT: Record<LayerCount, number | null> = { 1: 0, 2: 0, 3: 0 }
export const RIBBON_SUPPLEMENT: Record<RibbonId, number | null> = { saten: 0, algodon: 0, organza: 0 }
export const FINISH_SUPPLEMENT: Record<FinishId, number | null> = { lazo: 0, mono: 0, ninguno: 0 }
/** El catálogo menciona «Caja de regalo opcional» sin precio. */
export const BOX_SUPPLEMENT: number | null = null
export const CARD_SUPPLEMENT: Record<CardStyleId, number | null> = { clasica: 0, floral: 0, kraft: 0, minimal: 0 }

export const GROUP_LABELS: Record<QuoteGroupId, string> = {
  flores: 'Precio de flores',
  suplementos: 'Suplementos',
  presentacion: 'Presentación',
  accesorios: 'Accesorios y tarjeta',
}

export function formatMoney(n: number): string {
  const v = Number.isInteger(n) ? String(n) : n.toFixed(2)
  return `${PRICING.currency} ${v}`
}

/** Texto corto para una opción: «Incluido», «Por cotizar» o «+ S/ 5». */
export function supplementLabel(amount: number | null): string {
  if (amount === null) return 'Por cotizar'
  if (amount === 0) return 'Incluido'
  return `+ ${formatMoney(amount)}`
}

export function flowerPriceLabel(id: FlowerId): string {
  const p = FLOWER_UNIT_PRICE[id]
  return p === null ? 'Por cotizar' : `${formatMoney(p)} c/u`
}

export const totalFlowers = (flowers: BouquetConfig['flowers']) =>
  Object.values(flowers).reduce<number>((sum, n) => sum + (n ?? 0), 0)

const nameOf = <T extends string>(list: { id: T; name: string }[], id: T) => list.find((x) => x.id === id)?.name ?? id

export function computeQuote(config: BouquetConfig): Quote {
  const lines: QuoteLine[] = []
  const add = (id: string, group: QuoteGroupId, label: string, amount: number | null, detail?: string) =>
    lines.push({ id, group, label, amount, detail })

  for (const f of FLOWERS) {
    const qty = config.flowers[f.id]
    if (!qty) continue
    const unit = FLOWER_UNIT_PRICE[f.id]
    add(`flor-${f.id}`, 'flores', `${qty} × ${flowerById(f.id).name}`, unit === null ? null : unit * qty, unit === null ? undefined : `${formatMoney(unit)} c/u`)
  }
  if (config.shape) add('forma', 'suplementos', `Forma: ${nameOf(SHAPES, config.shape)}`, SHAPE_SUPPLEMENT[config.shape])

  const w = config.wrapping
  add('papel', 'presentacion', nameOf(PAPERS, w.paper), PAPER_SUPPLEMENT[w.paper])
  add('capas', 'presentacion', `${w.layers} ${w.layers === 1 ? 'capa' : 'capas'} de papel`, LAYER_SUPPLEMENT[w.layers])
  add('cinta', 'presentacion', `Cinta de ${nameOf(RIBBONS, w.ribbon).toLowerCase()}`, RIBBON_SUPPLEMENT[w.ribbon])
  add('acabado', 'accesorios', nameOf(FINISHES, w.finish), FINISH_SUPPLEMENT[w.finish])
  if (w.box) add('caja', 'accesorios', 'Presentación en caja', BOX_SUPPLEMENT)
  add('tarjeta', 'accesorios', `Tarjeta ${nameOf(CARD_STYLES, config.card.style).toLowerCase()}`, CARD_SUPPLEMENT[config.card.style])

  const groups: QuoteGroup[] = (Object.keys(GROUP_LABELS) as QuoteGroupId[]).map((id) => {
    const gl = lines.filter((l) => l.group === id)
    return {
      id,
      label: GROUP_LABELS[id],
      lines: gl,
      total: gl.reduce((s, l) => s + (l.amount ?? 0), 0),
      hasPending: gl.some((l) => l.amount === null),
    }
  })

  const pending = lines.filter((l) => l.amount === null)
  const flowersCount = totalFlowers(config.flowers)
  return {
    lines,
    groups,
    subtotal: lines.reduce((s, l) => s + (l.amount ?? 0), 0),
    pending,
    isComplete: pending.length === 0 && flowersCount > 0,
    totalFlowers: flowersCount,
    provisional: PRICING.provisional,
  }
}

/** Texto principal del total: nunca presenta como definitivo un total con elementos por cotizar. */
export function totalHeadline(q: Quote): { label: string; value: string } {
  if (q.totalFlowers === 0) return { label: 'Total estimado', value: '—' }
  if (q.isComplete) return { label: 'Total estimado', value: formatMoney(q.subtotal) }
  return { label: 'Desde', value: formatMoney(q.subtotal) }
}
