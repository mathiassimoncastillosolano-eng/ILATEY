import type { Product } from '../data/products'
import type { BouquetConfig, FlowerId, PaletteId } from '../types/customization'
import { LIMITS } from '../data/pricingRules'
import { defaultConfig } from '../store/customizerDefaults'

/** Paleta inicial sugerida para cada ramo del catálogo (aproximación a sus colores). El cliente puede cambiarla. */
const SEED_PALETTES: Record<number, PaletteId[]> = {
  1: ['rosa-pastel'],
  2: ['nude'],
  3: ['amarillo'],
  4: ['blanco-crema'],
  5: ['mixto'],
}

const MIXED: FlowerId[] = ['rosa', 'tulipan', 'margarita']

/** Convierte un ramo del catálogo en un punto de partida editable del configurador. */
export function seedFromProduct(p: Product, message?: string): BouquetConfig {
  const base = defaultConfig()
  base.baseProductId = p.id
  if (message) base.card.message = message.slice(0, LIMITS.messageMax)
  // «Ramo a tu Medida» no trae flores: se empieza desde cero.
  if (p.flowers <= 0) return base

  const total = Math.max(LIMITS.minTotal, Math.min(LIMITS.maxTotal, p.flowers))
  if (p.type === 'mixto') {
    const each = Math.floor(total / MIXED.length)
    const rem = total - each * MIXED.length
    MIXED.forEach((id, i) => { base.flowers[id] = each + (i < rem ? 1 : 0) })
  } else {
    base.flowers[p.type] = total
  }
  base.shape = 'redondo'
  base.palettes = SEED_PALETTES[p.id] ?? []
  return base
}
