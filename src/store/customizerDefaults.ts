import type { BouquetConfig } from '../types/customization'

export const defaultConfig = (): BouquetConfig => ({
  flowers: {},
  shape: null,
  palettes: [],
  wrapping: { paper: 'kraft', paperColor: 'marfil', layers: 1, ribbon: 'saten', ribbonColor: 'cobre', finish: 'lazo', box: false },
  card: { recipient: '', message: '', sender: '', style: 'clasica' },
  extras: { notes: '', preferences: '', restrictions: '', budget: null, deliveryDate: '' },
  baseProductId: null,
})

/** Completa con valores por defecto lo que falte en una configuración guardada por una versión anterior. */
export function normalizeConfig(raw: Partial<BouquetConfig> | null | undefined): BouquetConfig {
  const d = defaultConfig()
  if (!raw) return d
  return {
    ...d,
    ...raw,
    flowers: { ...(raw.flowers ?? {}) },
    palettes: Array.isArray(raw.palettes) ? raw.palettes : [],
    wrapping: { ...d.wrapping, ...(raw.wrapping ?? {}) },
    card: { ...d.card, ...(raw.card ?? {}) },
    extras: { ...d.extras, ...(raw.extras ?? {}) },
  }
}

export const isPristine = (c: BouquetConfig) => JSON.stringify(c) === JSON.stringify(defaultConfig())
