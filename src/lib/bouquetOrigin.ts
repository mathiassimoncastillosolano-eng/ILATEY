import type { Product } from '../data/products'
import { products } from '../data/products'
import type { BouquetConfig } from '../types/customization'
import { seedFromProduct } from './productSeed'

export type BouquetOrigin =
  /** Diseñado desde cero. */
  | { kind: 'custom'; product: null }
  /** Ramo del catálogo con su composición original (flores, forma y colores sin tocar). */
  | { kind: 'catalog'; product: Product }
  /** Parte de un ramo del catálogo, pero la composición ya cambió. */
  | { kind: 'catalog-custom'; product: Product }

const sameFlowers = (a: BouquetConfig['flowers'], b: BouquetConfig['flowers']) => {
  const ka = Object.keys(a).sort()
  const kb = Object.keys(b).sort()
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k as keyof typeof a] === b[k as keyof typeof b])
}
const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))

/**
 * Origen del ramo, DERIVADO de la configuración (no se guarda aparte, así nunca se contradice con ella).
 * Compara solo la composición: el envoltorio, la tarjeta y los detalles no cambian la naturaleza del ramo.
 */
export function bouquetOrigin(config: BouquetConfig): BouquetOrigin {
  const product = config.baseProductId === null ? undefined : products.find((p) => p.id === config.baseProductId)
  if (!product) return { kind: 'custom', product: null }
  const seed = seedFromProduct(product)
  const untouched = sameFlowers(config.flowers, seed.flowers) && config.shape === seed.shape && sameSet(config.palettes, seed.palettes)
  return { kind: untouched ? 'catalog' : 'catalog-custom', product }
}
