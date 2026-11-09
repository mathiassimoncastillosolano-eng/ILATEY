import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BouquetConfig, CardDraft, EntryMode, Extras, FlowerId, PaletteId, PurchaseRequest, RequestFormat, ShapeId, Wrapping,
} from '../types/customization'
import { FLOWERS, STEPS, flowerById } from '../data/customizationOptions'
import { LIMITS, computeQuote, totalFlowers } from '../data/pricingRules'
import { allowedPalettes, firstInvalidStep } from '../lib/customizerValidation'
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
  /** Cómo se llegó al configurador: solo explica el punto de partida (el origen real del ramo se deriva de config). */
  entry: EntryMode

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
  /**
   * Empieza un diseño a partir de una semilla. `startStep` es solo un deseo: nunca supera el primer paso inválido
   * de la semilla, así que no se puede aterrizar en un paso bloqueado por la validación secuencial.
   */
  begin: (seed: BouquetConfig, opts?: { startStep?: number; entry?: EntryMode }) => void
  restorePrevious: () => void
  dismissPrevious: () => void
  prepareRequest: () => PurchaseRequest
  markContacted: (format: RequestFormat) => void
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
        entry: 'scratch',

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

        reset: () => set({ config: defaultConfig(), step: 0, request: null, previous: null, entry: 'scratch' }),

        begin: (seed, opts) =>
          set((s) => {
            const config = prune(seed)
            const wanted = clamp(Math.trunc(opts?.startStep ?? 0), 0, STEPS.length - 1)
            return {
              previous: isPristine(s.config) ? s.previous : s.config,
              config,
              step: Math.min(wanted, firstInvalidStep(config)),
              entry: opts?.entry ?? 'catalog-custom',
              request: null,
            }
          }),

        restorePrevious: () => {
          const prev = get().previous
          if (prev) set({ config: prev, previous: null, step: 0, request: null, entry: prev.baseProductId === null ? 'scratch' : 'catalog-custom' })
        },
        dismissPrevious: () => set({ previous: null }),

        prepareRequest: () => {
          const { config } = get()
          const quote = computeQuote(config)
          const id = `ILA-${Date.now().toString(36).toUpperCase()}`
          const createdAt = new Date().toISOString()
          const request: PurchaseRequest = {
            id,
            createdAt,
            config,
            quote,
            text: formatRequestText(config, quote, id, createdAt),
            status: 'prepared',
          }
          set({ request })
          return request
        },

        markContacted: (format) =>
          set((s) => (s.request && s.request.status !== 'sent' ? { request: { ...s.request, status: 'contacted', format } } : s)),

        markSent: () => set((s) => (s.request ? { request: { ...s.request, status: 'sent' } } : s)),
      }
    },
    {
      name: 'ilatey-customizer',
      version: 1,
      partialize: (s) => ({ config: s.config, step: s.step, request: s.request, previous: s.previous, entry: s.entry }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<CustomizerState, 'config' | 'step' | 'request' | 'previous' | 'entry'>>
        const config = normalizeConfig(p.config)
        const entries: EntryMode[] = ['scratch', 'catalog-custom', 'catalog-direct']
        return {
          ...current,
          config,
          step: typeof p.step === 'number' ? clamp(p.step, 0, STEPS.length - 1) : 0,
          request: p.request ?? null,
          previous: p.previous ? normalizeConfig(p.previous) : null,
          // Diseños guardados antes de existir `entry`: se deduce del producto de origen.
          entry: p.entry && entries.includes(p.entry) ? p.entry : config.baseProductId === null ? 'scratch' : 'catalog-custom',
        }
      },
    },
  ),
)
