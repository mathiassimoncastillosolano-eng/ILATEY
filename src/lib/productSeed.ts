import type { Product } from '../data/products'
import type { BouquetConfig, FlowerId, PaletteId, Wrapping } from '../types/customization'
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

/**
 * Presentación que ya describe cada ramo en la ficha del catálogo («Papel kraft rosado», «Lazo de satén cobre»…).
 * Solo se aplica al elegir «Quiero este ramo»: ahí el cliente se salta el diseño y debe encontrar el ramo tal como lo vio.
 * Lo que la ficha no menciona conserva el valor por defecto.
 */
const SEED_WRAPPING: Record<number, Partial<Wrapping>> = {
  1: { paper: 'kraft', paperColor: 'rosa', ribbon: 'saten', ribbonColor: 'cobre' },
  2: { paperColor: 'marfil' },
  3: { paperColor: 'marfil' },
  4: { ribbon: 'algodon' },
  5: { layers: 2 },
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

/** ¿Se puede elegir este ramo tal cual? Solo si trae una composición definida (no «Ramo a tu Medida»). */
export const canChooseDirectly = (p: Product) => p.flowers > 0

/**
 * «Quiero este ramo»: la misma composición que «Personalizar», más la presentación que describe su ficha.
 * Las flores, la forma y los colores NO se tocan: salen de seedFromProduct.
 */
export function seedDirectFromProduct(p: Product, message?: string): BouquetConfig {
  const seed = seedFromProduct(p, message)
  seed.wrapping = { ...seed.wrapping, ...(SEED_WRAPPING[p.id] ?? {}) }
  return seed
}
