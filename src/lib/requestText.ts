import type { BouquetConfig, Quote } from '../types/customization'
import type { RequestDocument } from './requestDocument'
import { NOT_SPECIFIED, NOT_SPECIFIED_OPTIONAL, buildRequestDocument } from './requestDocument'

const or = (v: string | null | undefined, fallback = NOT_SPECIFIED) => (v && v.length > 0 ? v : fallback)

/** Indenta las líneas siguientes de un valor de varias líneas para que el TXT siga siendo legible. */
const multi = (v: string) => v.split(/\r?\n/).map((l, i) => (i === 0 ? l : `    ${l}`)).join('\n')

/** Dibuja un RequestDocument como texto plano. Mismo contenido que el PDF, sin adornos. */
export function renderRequestText(d: RequestDocument, opts: { compact?: boolean } = {}): string {
  const out: string[] = []
  const rule = '────────────────────────────────'
  const compact = opts.compact === true

  if (!compact) {
    out.push('ILATEY FLOWER STUDIO')
    out.push('Detalle de tu ramo')
    out.push(`Referencia: ${d.reference}`)
    out.push(`Fecha de generación: ${d.createdLabel}`)
    out.push(rule)
  }

  if (!compact) out.push('')
  out.push('1. IDENTIFICACIÓN DEL RAMO')
  out.push(`· Ramo: ${d.bouquetName}`)
  out.push(`· Tipo: ${d.origin.label}`)
  if (d.origin.baseName && d.origin.kind !== 'catalog') out.push(`· Parte del ramo de catálogo: ${d.origin.baseName}`)
  if (d.summary) out.push(`· Composición general: ${d.summary}`)

  out.push('')
  out.push('2. COMPOSICIÓN FLORAL')
  for (const f of d.flowers) out.push(`· ${f.qty} × ${f.name}`)
  out.push(`· Cantidad total: ${d.totalFlowers} flores`)
  out.push(`· Forma: ${d.shape}`)
  out.push(`· Colores: ${d.palettes.length ? d.palettes.map((p) => p.name).join(', ') : NOT_SPECIFIED}`)

  out.push('')
  out.push('3. PRESENTACIÓN')
  const w = d.wrapping
  out.push(`· Papel: ${w.paper}`)
  out.push(`· Color del papel: ${w.paperColor.name}`)
  out.push(`· Capas: ${w.layers}`)
  out.push(`· Cinta: ${w.ribbon}`)
  out.push(`· Color de la cinta: ${w.ribbonColor.name}`)
  out.push(`· Lazo o moño: ${w.finish}`)
  out.push(`· Caja de regalo: ${w.box}`)

  out.push('')
  out.push('4. DEDICATORIA')
  out.push(`· Diseño de tarjeta: ${d.card.style}`)
  out.push(`· Para: ${or(d.card.recipient)}`)
  out.push(`· Mensaje: ${d.card.message ? `“${multi(d.card.message)}”` : NOT_SPECIFIED}`)
  out.push(`· De parte de: ${or(d.card.sender)}`)

  out.push('')
  out.push('5. ENTREGA Y OBSERVACIONES')
  out.push(`· Fecha deseada de entrega: ${d.delivery.date ? `${d.delivery.date} (sujeta a confirmación del taller)` : NOT_SPECIFIED_OPTIONAL}`)
  out.push(`· Presupuesto aproximado: ${or(d.delivery.budget, NOT_SPECIFIED_OPTIONAL)}`)
  out.push(`· Comentarios: ${d.delivery.notes ? multi(d.delivery.notes) : NOT_SPECIFIED_OPTIONAL}`)
  out.push(`· Preferencias: ${d.delivery.preferences ? multi(d.delivery.preferences) : NOT_SPECIFIED_OPTIONAL}`)
  out.push(`· Restricciones: ${d.delivery.restrictions ? multi(d.delivery.restrictions) : NOT_SPECIFIED_OPTIONAL}`)

  out.push('')
  out.push('6. INFORMACIÓN ECONÓMICA (REFERENCIAL)')
  if (!compact) {
    for (const g of d.pricing.groups) {
      out.push(`${g.label}:`)
      for (const l of g.lines) out.push(`· ${l.label}${l.detail ? ` (${l.detail})` : ''}: ${l.amount}`)
    }
    out.push(`Subtotal con precio definido: ${d.pricing.subtotal}`)
  }
  if (d.pricing.pending.length) out.push(`Pendiente de cotización: ${d.pricing.pending.join(', ')}`)
  out.push(`${d.pricing.totalLabel}: ${d.pricing.totalValue}${d.pricing.totalSuffix ? ` ${d.pricing.totalSuffix}` : ''}`)
  if (!compact) for (const n of d.pricing.notes) out.push(n)
  else out.push('Precios referenciales, sujetos a confirmación por ILATEY.')

  if (!compact) {
    out.push('')
    out.push(rule)
    out.push('Gracias por contar con nosotros. Cada detalle de tu ramo se prepara con especial cariño.')
    out.push('Esta solicitud está sujeta a confirmación comercial por parte de ILATEY.')
  }
  return out.join('\n')
}

/** Texto plano de una configuración. Se guarda en la solicitud preparada y es lo que descarga el TXT. */
export function formatRequestText(c: BouquetConfig, q: Quote, id: string, createdAt: string): string {
  return renderRequestText(buildRequestDocument(c, q, id, createdAt))
}
