/** Tipos del configurador de ramos. Los identificadores son estables: se guardan en localStorage. */

export type FlowerId = 'rosa' | 'tulipan' | 'girasol' | 'margarita' | 'peonia' | 'complemento'
export type ShapeId = 'redondo' | 'compacto' | 'abierto' | 'cascada' | 'asimetrico' | 'silvestre' | 'personalizado'
export type PaletteId = 'rojo' | 'rosa-pastel' | 'blanco-crema' | 'lavanda' | 'amarillo' | 'nude' | 'mixto'
export type PaperId = 'kraft' | 'seda' | 'texturizado'
export type PaperColorId = 'marfil' | 'rosa' | 'kraft' | 'salvia' | 'blanco'
export type RibbonId = 'saten' | 'algodon' | 'organza'
export type RibbonColorId = 'cobre' | 'marfil' | 'rosa' | 'salvia' | 'marron'
export type FinishId = 'lazo' | 'mono' | 'ninguno'
export type CardStyleId = 'clasica' | 'floral' | 'kraft' | 'minimal'
export type LayerCount = 1 | 2 | 3

/** available: se vende hoy · consult: hay que confirmarlo con el taller · unavailable: no seleccionable */
export type Availability = 'available' | 'consult' | 'unavailable'

export type StepId = 'flores' | 'cantidad' | 'forma' | 'colores' | 'envoltorio' | 'tarjeta' | 'detalles' | 'resumen'

export interface Wrapping {
  paper: PaperId
  paperColor: PaperColorId
  layers: LayerCount
  ribbon: RibbonId
  ribbonColor: RibbonColorId
  finish: FinishId
  box: boolean
}

export interface CardDraft {
  recipient: string
  message: string
  sender: string
  style: CardStyleId
}

export interface Extras {
  notes: string
  preferences: string
  restrictions: string
  /** Presupuesto aproximado en soles (opcional). */
  budget: number | null
  /** Fecha deseada, formato AAAA-MM-DD (opcional, sujeta a confirmación). */
  deliveryDate: string
}

export interface BouquetConfig {
  /** Cantidad por tipo de flor. Solo aparecen los tipos elegidos. */
  flowers: Partial<Record<FlowerId, number>>
  shape: ShapeId | null
  palettes: PaletteId[]
  wrapping: Wrapping
  card: CardDraft
  extras: Extras
  /** Producto del catálogo desde el que se inició el diseño, si aplica. */
  baseProductId: number | null
}

export type QuoteGroupId = 'flores' | 'suplementos' | 'presentacion' | 'accesorios'

export interface QuoteLine {
  id: string
  group: QuoteGroupId
  label: string
  detail?: string
  /** null = sin precio definido todavía (por cotizar). 0 = incluido. */
  amount: number | null
}

export interface QuoteGroup {
  id: QuoteGroupId
  label: string
  lines: QuoteLine[]
  /** Suma de las líneas con precio definido. */
  total: number
  hasPending: boolean
}

export interface Quote {
  lines: QuoteLine[]
  groups: QuoteGroup[]
  /** Suma de lo que sí tiene precio. */
  subtotal: number
  pending: QuoteLine[]
  /** true cuando todas las líneas tienen precio definido y hay flores. */
  isComplete: boolean
  totalFlowers: number
  /** true mientras los valores de pricingRules.ts sean provisionales. */
  provisional: boolean
}

/** Solicitud preparada: existe solo en este dispositivo hasta que se conecte un canal comercial. */
export interface PurchaseRequest {
  id: string
  createdAt: string
  config: BouquetConfig
  quote: Quote
  text: string
  status: 'prepared' | 'sent'
}
