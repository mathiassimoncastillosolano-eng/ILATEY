import type {
  Availability, CardStyleId, FinishId, FlowerId, PaletteId, PaperColorId, PaperId,
  RibbonColorId, RibbonId, ShapeId, StepId,
} from '../types/customization'
import { MOODS, PHRASES } from './products'

/**
 * Catálogo de opciones del configurador.
 * Está pensado para migrar a una fuente de datos (API/CMS): solo contiene descripción y disponibilidad.
 * Los PRECIOS viven únicamente en pricingRules.ts.
 */

export interface FlowerOption {
  id: FlowerId
  name: string
  singular: string
  desc: string
  /** 'available' solo si hoy existe en el catálogo; el resto debe confirmarse con el taller. */
  availability: Availability
  /** Paletas en las que esta flor puede representarse/elaborarse. */
  palettes: PaletteId[]
  /** URL de fotografía real. Si falta, se usa la representación ilustrativa (FlowerGlyph). */
  photo?: string
}

const ALL_PALETTES: PaletteId[] = ['rojo', 'rosa-pastel', 'blanco-crema', 'lavanda', 'amarillo', 'nude', 'mixto']

export const FLOWERS: FlowerOption[] = [
  { id: 'rosa', name: 'Rosas', singular: 'rosa', desc: 'Amor profundo y promesas. Pétalos enrollados uno a uno.', availability: 'available', palettes: ALL_PALETTES },
  { id: 'tulipan', name: 'Tulipanes', singular: 'tulipán', desc: 'Cariño, admiración y nuevos comienzos.', availability: 'available', palettes: ALL_PALETTES },
  { id: 'girasol', name: 'Girasoles', singular: 'girasol', desc: 'Luz y alegría, con el centro en espiral.', availability: 'available', palettes: ['amarillo', 'mixto'] },
  { id: 'margarita', name: 'Margaritas', singular: 'margarita', desc: 'Sencillez y sinceridad: un «pensé en ti».', availability: 'available', palettes: ['blanco-crema', 'rosa-pastel', 'amarillo', 'lavanda', 'mixto'] },
  { id: 'peonia', name: 'Peonías', singular: 'peonía', desc: 'Voluminosas y románticas, para un ramo con presencia.', availability: 'consult', palettes: ['rosa-pastel', 'blanco-crema', 'rojo', 'nude', 'mixto'] },
  { id: 'complemento', name: 'Flores complementarias', singular: 'complemento', desc: 'Pequeñas flores y follaje que dan aire y textura.', availability: 'consult', palettes: ALL_PALETTES },
]

export const flowerById = (id: FlowerId) => FLOWERS.find((f) => f.id === id)!

export interface ShapeOption { id: ShapeId; name: string; desc: string }

export const SHAPES: ShapeOption[] = [
  { id: 'redondo', name: 'Redondo clásico', desc: 'Cúpula simétrica y equilibrada. El ramo de siempre.' },
  { id: 'compacto', name: 'Bouquet compacto', desc: 'Flores muy juntas, de aspecto denso y pulido.' },
  { id: 'abierto', name: 'Bouquet abierto', desc: 'Más aire entre flores, de aspecto fresco y ligero.' },
  { id: 'cascada', name: 'Cascada', desc: 'Las flores caen en diagonal, con movimiento.' },
  { id: 'asimetrico', name: 'Asimétrico', desc: 'Composición inclinada, moderna y editorial.' },
  { id: 'silvestre', name: 'Composición silvestre', desc: 'Disposición libre, como recogido en un jardín.' },
  { id: 'personalizado', name: 'Diseño personalizado', desc: 'Cuéntanos tu idea en el paso de comentarios.' },
]

export const shapeById = (id: ShapeId) => SHAPES.find((s) => s.id === id)!

export interface PaletteOption {
  id: PaletteId
  name: string
  desc: string
  /** Muestras que se ven en el selector. */
  swatches: string[]
  /** Tonos con los que se dibujan las flores en la vista previa. */
  tones: string[]
}

export const PALETTES: PaletteOption[] = [
  { id: 'rojo', name: 'Rojo romántico', desc: 'Intenso y apasionado.', swatches: ['#B5483F', '#C9604F', '#9E3A35'], tones: ['#B5483F', '#C9604F', '#A33F38'] },
  { id: 'rosa-pastel', name: 'Rosa pastel', desc: 'Dulce, suave y delicado.', swatches: ['#E9C3C3', '#F0D2D0', '#DCA9A9'], tones: ['#E9C3C3', '#F0D2D0', '#DCA9A9'] },
  { id: 'blanco-crema', name: 'Blanco y crema', desc: 'Limpio, luminoso y atemporal.', swatches: ['#FDFBF8', '#F3EADB', '#EADFCB'], tones: ['#FDFBF8', '#F3EADB', '#EADFCB'] },
  { id: 'lavanda', name: 'Lavanda', desc: 'Sereno, soñador y elegante.', swatches: ['#C8B6DC', '#D8CBE8', '#B39CCB'], tones: ['#C8B6DC', '#D8CBE8', '#B39CCB'] },
  { id: 'amarillo', name: 'Amarillo', desc: 'Alegre, cálido y lleno de luz.', swatches: ['#E8C25A', '#F0D27A', '#D9A93A'], tones: ['#E8C25A', '#F0D27A', '#D9A93A'] },
  { id: 'nude', name: 'Tonos nude', desc: 'Neutro, cálido y sofisticado.', swatches: ['#D9B7AC', '#E8D4CC', '#C99D8E'], tones: ['#D9B7AC', '#E8D4CC', '#C99D8E'] },
  { id: 'mixto', name: 'Colores mixtos', desc: 'Un poco de todo, con alegría.', swatches: ['#B5483F', '#E9C3C3', '#C8B6DC', '#E8C25A'], tones: ['#B5483F', '#E9C3C3', '#FDFBF8', '#C8B6DC', '#E8C25A', '#D9B7AC'] },
]

export const paletteById = (id: PaletteId) => PALETTES.find((p) => p.id === id)!

export interface SimpleOption<T extends string> { id: T; name: string; desc: string }

export const PAPERS: SimpleOption<PaperId>[] = [
  { id: 'kraft', name: 'Papel kraft', desc: 'Natural, con fibra visible.' },
  { id: 'seda', name: 'Papel de seda', desc: 'Ligero y translúcido, con pliegues suaves.' },
  { id: 'texturizado', name: 'Papel texturizado', desc: 'Relieve fino, de aspecto artesanal.' },
]

export const PAPER_COLORS: { id: PaperColorId; name: string; hex: string }[] = [
  { id: 'marfil', name: 'Marfil', hex: '#F1E8D8' },
  { id: 'rosa', name: 'Rosa empolvado', hex: '#E3C3BA' },
  { id: 'kraft', name: 'Kraft natural', hex: '#C9A27C' },
  { id: 'salvia', name: 'Verde salvia', hex: '#A9B592' },
  { id: 'blanco', name: 'Blanco', hex: '#FDFBF8' },
]

export const RIBBONS: SimpleOption<RibbonId>[] = [
  { id: 'saten', name: 'Satén', desc: 'Brillo suave y caída elegante.' },
  { id: 'algodon', name: 'Algodón', desc: 'Mate, cálido y natural.' },
  { id: 'organza', name: 'Organza', desc: 'Transparente y etérea.' },
]

export const RIBBON_COLORS: { id: RibbonColorId; name: string; hex: string }[] = [
  { id: 'cobre', name: 'Cobre', hex: '#B98272' },
  { id: 'marfil', name: 'Marfil', hex: '#F6F2EA' },
  { id: 'rosa', name: 'Rosa empolvado', hex: '#D9B7AC' },
  { id: 'salvia', name: 'Verde salvia', hex: '#8A9677' },
  { id: 'marron', name: 'Marrón cálido', hex: '#72564D' },
]

export const FINISHES: SimpleOption<FinishId>[] = [
  { id: 'lazo', name: 'Lazo clásico', desc: 'Un lazo sencillo y delicado.' },
  { id: 'mono', name: 'Moño amplio', desc: 'Grande y con colas largas.' },
  { id: 'ninguno', name: 'Sin lazo', desc: 'Solo la cinta, de forma minimalista.' },
]

export interface CardStyleOption { id: CardStyleId; name: string; desc: string }

export const CARD_STYLES: CardStyleOption[] = [
  { id: 'clasica', name: 'Clásica', desc: 'Marfil con filo cobre.' },
  { id: 'floral', name: 'Floral', desc: 'Rosa empolvado, más romántica.' },
  { id: 'kraft', name: 'Kraft', desc: 'Natural y cálida.' },
  { id: 'minimal', name: 'Minimal', desc: 'Blanca, sobria y limpia.' },
]

/** Sugerencias de dedicatoria: frases de la marca + mensajes de cada ocasión. */
export const MESSAGE_SUGGESTIONS: string[] = [...PHRASES, ...MOODS.slice(0, 3).map((m) => m.message)]

export interface StepDef { id: StepId; label: string; title: string; lead: string }

export const STEPS: StepDef[] = [
  { id: 'flores', label: 'Flores', title: '¿Qué flores quieres?', lead: 'Elige uno o varios tipos. Puedes combinarlos.' },
  { id: 'cantidad', label: 'Cantidad', title: '¿Cuántas flores?', lead: 'Ajusta cada tipo o elige un total y lo repartimos por ti.' },
  { id: 'forma', label: 'Forma', title: '¿Qué forma tendrá?', lead: 'La composición cambia por completo el carácter del ramo.' },
  { id: 'colores', label: 'Colores', title: '¿Qué colores lo vestirán?', lead: 'Elige hasta tres paletas, o deja que mezclemos.' },
  { id: 'envoltorio', label: 'Envoltorio', title: 'Cómo se presenta', lead: 'Papel, cinta y acabados: el primer vistazo del regalo.' },
  { id: 'tarjeta', label: 'Tarjeta', title: 'Tu mensaje', lead: 'Unas pocas palabras pueden decirlo todo.' },
  { id: 'detalles', label: 'Detalles', title: 'Cuéntanos más', lead: 'Todo lo que imaginas y no cabe en un botón.' },
  { id: 'resumen', label: 'Resumen', title: 'Tu ramo, a la vista', lead: 'Revisa cada detalle antes de preparar tu solicitud.' },
]

export const stepIndex = (id: StepId) => STEPS.findIndex((s) => s.id === id)
