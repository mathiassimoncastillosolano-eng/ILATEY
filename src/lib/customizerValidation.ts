import type { BouquetConfig, FlowerId, StepId } from '../types/customization'
import { FLOWERS, PALETTES, STEPS, flowerById } from '../data/customizationOptions'
import { LIMITS, totalFlowers } from '../data/pricingRules'

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Primera fecha de entrega que se puede solicitar (hoy + días de elaboración), en hora local. */
export function minDeliveryDate(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + LIMITS.leadDays)
  return iso(d)
}

export const selectedFlowers = (c: BouquetConfig): FlowerId[] =>
  FLOWERS.filter((f) => (c.flowers[f.id] ?? 0) > 0).map((f) => f.id)

/** Paletas que al menos una de las flores elegidas admite. */
export function allowedPalettes(c: BouquetConfig) {
  const sel = selectedFlowers(c)
  if (sel.length === 0) return PALETTES.map((p) => p.id)
  return PALETTES.filter((p) => sel.some((id) => flowerById(id).palettes.includes(p.id))).map((p) => p.id)
}

/** Mensajes de error de un paso. Vacío = válido. */
export function validateStep(id: StepId, c: BouquetConfig): string[] {
  const errors: string[] = []
  const total = totalFlowers(c.flowers)
  const types = selectedFlowers(c)

  switch (id) {
    case 'flores':
      if (types.length === 0) errors.push('Elige al menos un tipo de flor para continuar.')
      if (types.length > LIMITS.maxFlowerTypes) errors.push(`Puedes combinar hasta ${LIMITS.maxFlowerTypes} tipos de flor.`)
      break
    case 'cantidad':
      if (total < LIMITS.minTotal) errors.push(`Un ramo necesita al menos ${LIMITS.minTotal} flores (ahora hay ${total}).`)
      if (total > LIMITS.maxTotal) errors.push(`El máximo es de ${LIMITS.maxTotal} flores por ramo (ahora hay ${total}).`)
      break
    case 'forma':
      if (!c.shape) errors.push('Elige la forma de tu ramo para continuar.')
      break
    case 'colores': {
      if (c.palettes.length === 0) errors.push('Elige al menos una paleta de colores.')
      if (c.palettes.length > LIMITS.maxPalettes) errors.push(`Puedes combinar hasta ${LIMITS.maxPalettes} paletas.`)
      const ok = allowedPalettes(c)
      if (c.palettes.some((p) => !ok.includes(p))) errors.push('Alguna paleta elegida no es compatible con tus flores.')
      break
    }
    case 'detalles':
      if (c.extras.deliveryDate && c.extras.deliveryDate < minDeliveryDate()) {
        errors.push(`La fecha de entrega debe ser a partir del ${formatDate(minDeliveryDate())}.`)
      }
      if (c.extras.budget !== null && (!Number.isFinite(c.extras.budget) || c.extras.budget < 0)) {
        errors.push('El presupuesto debe ser un número positivo.')
      }
      break
    default:
      break
  }
  return errors
}

/** Índice del primer paso inválido; si todo está bien, el del resumen. Los pasos posteriores quedan bloqueados. */
export function firstInvalidStep(c: BouquetConfig): number {
  const last = STEPS.length - 1
  for (let i = 0; i < last; i++) if (validateStep(STEPS[i].id, c).length > 0) return i
  return last
}

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d))
}
