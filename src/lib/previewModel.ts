import type { BouquetConfig, FlowerId, PaletteId } from '../types/customization'
import { FLOWERS, flowerById, paletteById } from '../data/customizationOptions'
import { totalFlowers } from '../data/pricingRules'
import { MAX_RENDERED, layoutFlowers } from './bouquetLayout'
import type { Placed } from './bouquetLayout'

/** Convierte una configuración en un modelo de dibujo. Función pura: sin React ni efectos. */

export interface PreviewFlower extends Placed { id: FlowerId; fill: string; key: string }

export interface PreviewModel {
  flowers: PreviewFlower[]
  /** Marcadores tenues cuando todavía no hay flores elegidas. */
  ghost: Placed[]
  total: number
  rendered: number
  truncated: boolean
}

/** Reparte `target` entre los tipos conservando proporciones (mayor resto) y al menos 1 por tipo. */
export function scaleCounts(counts: Partial<Record<FlowerId, number>>, target: number): Partial<Record<FlowerId, number>> {
  const ids = FLOWERS.map((f) => f.id).filter((id) => (counts[id] ?? 0) > 0)
  const total = ids.reduce((s, id) => s + (counts[id] ?? 0), 0)
  if (total <= target) return { ...counts }
  const out: Partial<Record<FlowerId, number>> = {}
  const rest: { id: FlowerId; frac: number }[] = []
  let used = 0
  for (const id of ids) {
    const exact = ((counts[id] ?? 0) / total) * target
    const base = Math.max(1, Math.floor(exact))
    out[id] = base
    used += base
    rest.push({ id, frac: exact - Math.floor(exact) })
  }
  rest.sort((a, b) => b.frac - a.frac)
  for (let i = 0; used < target && i < rest.length * 4; i++, used++) {
    const id = rest[i % rest.length].id
    out[id] = (out[id] ?? 0) + 1
  }
  return out
}

/** Intercala los tipos de forma uniforme: [rosa, tulipán, rosa, tulipán, rosa…]. */
export function interleave(counts: Partial<Record<FlowerId, number>>): FlowerId[] {
  const items: { id: FlowerId; pos: number; order: number }[] = []
  FLOWERS.forEach((f, order) => {
    const c = counts[f.id] ?? 0
    for (let j = 0; j < c; j++) items.push({ id: f.id, pos: (j + 0.5) / c, order })
  })
  items.sort((a, b) => a.pos - b.pos || (counts[b.id] ?? 0) - (counts[a.id] ?? 0) || a.order - b.order)
  return items.map((i) => i.id)
}

/** Tonos con los que se dibuja una flor según las paletas elegidas y las que ella admite. */
export function tonesFor(id: FlowerId, palettes: PaletteId[]): string[] {
  const own = flowerById(id).palettes
  let use = palettes.filter((p) => own.includes(p))
  if (use.length === 0) use = [own.includes('nude') ? 'nude' : own[0]]
  return use.flatMap((p) => paletteById(p).tones)
}

export function buildPreviewModel(c: BouquetConfig): PreviewModel {
  const total = totalFlowers(c.flowers)
  const rendered = Math.min(total, MAX_RENDERED)
  const shape = c.shape ?? 'redondo'

  if (total === 0) {
    return { flowers: [], ghost: layoutFlowers(shape, 9), total: 0, rendered: 0, truncated: false }
  }

  const seq = interleave(scaleCounts(c.flowers, rendered))
  const placed = layoutFlowers(shape, seq.length)
  const seen: Partial<Record<FlowerId, number>> = {}
  const flowers: PreviewFlower[] = placed.map((p, i) => {
    const id = seq[i]
    const k = seen[id] ?? 0
    seen[id] = k + 1
    const tones = tonesFor(id, c.palettes)
    return { ...p, id, fill: tones[(k + (id === 'rosa' ? 0 : 1)) % tones.length], key: `${id}-${k}` }
  })
  flowers.sort((a, b) => a.z - b.z)
  return { flowers, ghost: [], total, rendered: seq.length, truncated: total > rendered }
}
