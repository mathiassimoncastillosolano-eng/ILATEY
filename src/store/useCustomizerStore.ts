import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BouquetConfig, CardDraft, Extras, FlowerId, PaletteId, PurchaseRequest, ShapeId, Wrapping,
} from '../types/customization'
import { FLOWERS, STEPS, flowerById } from '../data/customizationOptions'
import { LIMITS, computeQuote, totalFlowers } from '../data/pricingRules'
import { allowedPalettes } from '../lib/customizerValidation'
import { formatRequestText } from '../lib/requestText'
import { defaultConfig, isPristine, normalizeConfig } from './customizerDefaults'

/**
 * Estado del configurador, independiente de favoritos y filtros (useStore).
 * Tres conceptos separados:
 *   config   → el diseño del ramo (se edita libremente, se guarda en este dispositivo)
 *   request  → solicitud PREPARADA a partir de un diseño (se invalida si el diseño cambia)
 *   (pedido confirmado) → no existe todavía: requiere un canal comercial (ver lib/requestChannel.ts)
 */

interface CustomizerState {
  config: BouquetConfig
  step: number
  request: PurchaseRequest | null
  /** Diseño anterior, conservado cuando se empieza desde un ramo del catálogo sobre un diseño en curso. */
  previous: BouquetConfig | null

  setStep: (n: number) => void
  toggleFlower: (id: FlowerId) => void
  setQuantity: (id: FlowerId, qty: number) => void
  setTotal: (total: number) => void
  setShape: (id: ShapeId) => void
  togglePalette: (id: PaletteId) => void
  setWrapping: (patch: Partial<Wrapping>) => void
  setCard: (patch: Partial<CardDraft>) => void
  setExtras: (patch: Partial<Extras>) => void
  reset: () => void
  begin: (seed: BouquetConfig) => void
  restorePrevious: () => void
  dismissPrevious: () => void
  prepareRequest: () => PurchaseRequest
  markSent: () => void
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Quita las paletas que ya no son compatibles con las flores elegidas. */
function prune(config: BouquetConfig): BouquetConfig {
  const ok = allowedPalettes(config)
  const palettes = config.palettes.filter((p) => ok.includes(p))
  return palettes.length === config.palettes.length ? config : { ...config, palettes }
}

export const useCustomizerStore = create<CustomizerState>()(
  persist(
    (set, get) => {
      /** Cualquier cambio de diseño invalida la solicitud ya preparada. */
      const edit = (fn: (c: BouquetConfig) => BouquetConfig) =>
        set((s) => ({ config: fn(s.config), request: null }))

      return {
        config: defaultConfig(),
        step: 0,
        request: null,
        previous: null,

        setStep: (n) => set({ step: clamp(Math.trunc(n), 0, STEPS.length - 1) }),

        toggleFlower: (id) =>
          edit((c) => {
            const flowers = { ...c.flowers }
            if (flowers[id]) {
              delete flowers[id]
              return prune({ ...c, flowers })
            }
            const opt = flowerById(id)
            const types = Object.keys(flowers).length
            const total = totalFlowers(flowers)
            if (opt.availability === 'unavailable' || types >= LIMITS.maxFlowerTypes || total >= LIMITS.maxTotal) return c
            const want = total === 0 ? LIMITS.defaultFirstQty : LIMITS.defaultNextQty
            flowers[id] = clamp(want, 1, LIMITS.maxTotal - total)
            return { ...c, flowers }
          }),

        setQuantity: (id, qty) =>
          edit((c) => {
            if (!c.flowers[id] || !Number.isFinite(qty)) return c
            const others = totalFlowers(c.flowers) - (c.flowers[id] ?? 0)
            return { ...c, flowers: { ...c.flowers, [id]: clamp(Math.trunc(qty), 1, LIMITS.maxTotal - others) } }
          }),

        setTotal: (total) =>
          edit((c) => {
            const ids = FLOWERS.filter((f) => c.flowers[f.id]).map((f) => f.id)
            if (ids.length === 0 || !Number.isFinite(total)) return c
            const t = clamp(Math.trunc(total), Math.max(LIMITS.minTotal, ids.length), LIMITS.maxTotal)
            const base = Math.floor(t / ids.length)
            const rem = t - base * ids.length
            const flowers: BouquetConfig['flowers'] = {}
            ids.forEach((id, i) => { flowers[id] = base + (i < rem ? 1 : 0) })
            return { ...c, flowers }
          }),

        setShape: (shape) => edit((c) => ({ ...c, shape })),

        togglePalette: (id) =>
          edit((c) => {
            const has = c.palettes.includes(id)
            if (id === 'mixto') return { ...c, palettes: has ? [] : ['mixto'] }
            if (has) return { ...c, palettes: c.palettes.filter((p) => p !== id) }
            if (!allowedPalettes(c).includes(id)) return c
            const rest = c.palettes.filter((p) => p !== 'mixto')
            if (rest.length >= LIMITS.maxPalettes) return c
            return { ...c, palettes: [...rest, id] }
          }),

        setWrapping: (patch) => edit((c) => ({ ...c, wrapping: { ...c.wrapping, ...patch } })),
        setCard: (patch) => edit((c) => ({ ...c, card: { ...c.card, ...patch } })),
        setExtras: (patch) => edit((c) => ({ ...c, extras: { ...c.extras, ...patch } })),

        reset: () => set({ config: defaultConfig(), step: 0, request: null, previous: null }),

        begin: (seed) =>
          set((s) => ({
            previous: isPristine(s.config) ? s.previous : s.config,
            config: prune(seed),
            step: 0,
            request: null,
          })),

        restorePrevious: () => {
          const prev = get().previous
          if (prev) set({ config: prev, previous: null, step: 0, request: null })
        },
        dismissPrevious: () => set({ previous: null }),

        prepareRequest: () => {
          const { config } = get()
          const quote = computeQuote(config)
          const id = `ILA-${Date.now().toString(36).toUpperCase()}`
          const request: PurchaseRequest = {
            id,
            createdAt: new Date().toISOString(),
            config,
            quote,
            text: formatRequestText(config, quote, id),
            status: 'prepared',
          }
          set({ request })
          return request
        },

        markSent: () => set((s) => (s.request ? { request: { ...s.request, status: 'sent' } } : s)),
      }
    },
    {
      name: 'ilatey-customizer',
      version: 1,
      partialize: (s) => ({ config: s.config, step: s.step, request: s.request, previous: s.previous }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<CustomizerState, 'config' | 'step' | 'request' | 'previous'>>
        return {
          ...current,
          config: normalizeConfig(p.config),
          step: typeof p.step === 'number' ? clamp(p.step, 0, STEPS.length - 1) : 0,
          request: p.request ?? null,
          previous: p.previous ? normalizeConfig(p.previous) : null,
        }
      },
    },
  ),
)
