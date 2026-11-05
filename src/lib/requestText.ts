import type { BouquetConfig, Quote } from '../types/customization'
import {
  CARD_STYLES, FINISHES, FLOWERS, PALETTES, PAPERS, PAPER_COLORS, RIBBONS, RIBBON_COLORS, SHAPES,
} from '../data/customizationOptions'
import { formatMoney, totalHeadline } from '../data/pricingRules'
import { formatDate } from './customizerValidation'

const nameOf = <T extends string>(list: { id: T; name: string }[], id: T) => list.find((x) => x.id === id)?.name ?? id

/** Resumen en texto plano de una configuración: es lo que se copia/descarga y lo que recibirá un canal comercial. */
export function formatRequestText(c: BouquetConfig, q: Quote, id?: string): string {
  const out: string[] = []
  out.push('ILATEY Flower Studio — Solicitud de ramo personalizado')
  if (id) out.push(`Referencia: ${id}`)
  out.push('')
  out.push('FLORES')
  for (const f of FLOWERS) if (c.flowers[f.id]) out.push(`· ${c.flowers[f.id]} × ${f.name}`)
  out.push(`· Total: ${q.totalFlowers} flores`)
  out.push('')
  out.push(`FORMA: ${c.shape ? nameOf(SHAPES, c.shape) : '—'}`)
  out.push(`COLORES: ${c.palettes.map((p) => nameOf(PALETTES, p)).join(', ') || '—'}`)
  out.push('')
  out.push('ENVOLTORIO')
  const w = c.wrapping
  out.push(`· Papel: ${nameOf(PAPERS, w.paper)} (${nameOf(PAPER_COLORS, w.paperColor)}), ${w.layers} ${w.layers === 1 ? 'capa' : 'capas'}`)
  out.push(`· Cinta: ${nameOf(RIBBONS, w.ribbon)} (${nameOf(RIBBON_COLORS, w.ribbonColor)})`)
  out.push(`· Acabado: ${nameOf(FINISHES, w.finish)}`)
  out.push(`· Caja de regalo: ${w.box ? 'sí (por cotizar)' : 'no'}`)
  out.push('')
  out.push('TARJETA')
  out.push(`· Estilo: ${nameOf(CARD_STYLES, c.card.style)}`)
  out.push(`· Para: ${c.card.recipient || '—'}`)
  out.push(`· Mensaje: ${c.card.message || '—'}`)
  out.push(`· De: ${c.card.sender || '—'}`)
  out.push('')
  out.push('INDICACIONES')
  out.push(`· Comentarios: ${c.extras.notes || '—'}`)
  out.push(`· Preferencias: ${c.extras.preferences || '—'}`)
  out.push(`· Restricciones: ${c.extras.restrictions || '—'}`)
  out.push(`· Presupuesto aproximado: ${c.extras.budget !== null ? formatMoney(c.extras.budget) : '—'}`)
  out.push(`· Fecha deseada: ${c.extras.deliveryDate ? `${formatDate(c.extras.deliveryDate)} (sujeta a confirmación)` : '—'}`)
  out.push('')
  out.push('PRECIO ESTIMADO')
  for (const l of q.lines) out.push(`· ${l.label}: ${l.amount === null ? 'por cotizar' : l.amount === 0 ? 'incluido' : formatMoney(l.amount)}`)
  const h = totalHeadline(q)
  out.push(`${h.label}: ${h.value}${q.pending.length ? ` + ${q.pending.length} elemento(s) por cotizar` : ''}`)
  out.push('Precio referencial: sujeto a confirmación por ILATEY.')
  return out.join('\n')
}
