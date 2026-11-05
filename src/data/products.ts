export type FlowerType = 'tulipan' | 'rosa' | 'girasol' | 'margarita' | 'mixto'

export interface Product {
  id: number
  name: string
  cat: string
  type: FlowerType
  price: number
  edition?: string
  colors: string[]
  flowers: number
  time: string
  emotional: string
  meaning: string
  moods: string[]
  features: string[]
}

export interface Mood {
  id: string
  name: string
  desc: string
  glyph: string
  message: string
  tip: string
  palette: string[]
  detail: string
}

export const products: Product[] = [
  { id: 1, name: 'Ramo Ternura', cat: 'Tulipanes', type: 'tulipan', price: 65, edition: 'Edición Primavera', colors: ['#D9B7AC', '#E8D4CC', '#B98272'], flowers: 7, time: '3 días', emotional: 'Un pequeño jardín para alguien especial.', meaning: 'Los tulipanes representan cariño, admiración y nuevos comienzos.', moods: ['mama', 'agradecer', 'enamorar'], features: ['Tallos reforzados con alambre', 'Papel kraft rosado', 'Lazo de satén cobre'] },
  { id: 2, name: 'Rosas Eternas', cat: 'Rosas', type: 'rosa', price: 85, edition: 'Más querido', colors: ['#B98272', '#D9B7AC', '#E8D4CC'], flowers: 9, time: '5 días', emotional: 'Un amor que no necesita temporada.', meaning: 'La rosa habla de amor profundo y de promesas. Estas duran tanto como el recuerdo del día en que las recibiste.', moods: ['enamorar', 'celebrar'], features: ['Pétalos enrollados uno a uno', 'Envoltorio marfil', 'Tarjeta manuscrita'] },
  { id: 3, name: 'Girasoles de Sol', cat: 'Girasoles', type: 'girasol', price: 70, colors: ['#D9A93F', '#72564D', '#F6F2EA'], flowers: 5, time: '4 días', emotional: 'Luz para quien más la necesita.', meaning: 'Los girasoles buscan la luz y la comparten: ideales para animar, agradecer o recordar que siempre sale el sol.', moods: ['alegrar', 'celebrar'], features: ['Centros en espiral', 'Tallos largos', 'Papel marfil'] },
  { id: 4, name: 'Margaritas Brisa', cat: 'Margaritas', type: 'margarita', price: 55, edition: 'Edición Primavera', colors: ['#FDFBF8', '#D9A93F', '#E8D4CC'], flowers: 11, time: '3 días', emotional: 'La alegría de lo simple.', meaning: 'La margarita es sencillez y sinceridad. Un detalle espontáneo que dice «pensé en ti».', moods: ['sorprender', 'alegrar'], features: ['Pétalos cortados a mano', 'Ramo ligero', 'Cinta de algodón'] },
  { id: 5, name: 'Jardín Mixto', cat: 'Mixtos', type: 'mixto', price: 95, edition: 'Edición Limitada', colors: ['#D9B7AC', '#B98272', '#E8D4CC', '#D9A93F'], flowers: 12, time: '6 días', emotional: 'Todo lo que quieres decir, en un solo ramo.', meaning: 'Cuando una sola flor no alcanza, un jardín entero habla: ternura, amor y alegría.', moods: ['celebrar', 'sorprender', 'mama'], features: ['Tres tipos de flor', 'Papel doble capa', 'Caja de regalo opcional'] },
  { id: 6, name: 'Ramo a tu Medida', cat: 'Personalizado', type: 'mixto', price: 110, edition: 'Hecho para ti', colors: ['#B98272', '#E8D4CC', '#D9B7AC', '#72564D'], flowers: 0, time: '7 días', emotional: 'Tu historia, pétalo a pétalo.', meaning: 'Elegimos contigo cada color y cada flor. Nadie más tendrá uno igual.', moods: ['enamorar', 'sorprender', 'celebrar'], features: ['Colores a elección', 'Tarjeta con tu mensaje', 'Cantidad a medida'] },
]

export const MOODS: Mood[] = [
  { id: 'enamorar', name: 'Para enamorar', desc: 'Un gesto pequeño para un sentimiento enorme.', glyph: '♡', message: 'Hay cosas que se dicen mejor sin prisa: te quiero, te elijo, sigo aquí.', tip: 'Habla desde lo íntimo: pocas palabras, mucha intención.', palette: ['#B98272', '#D9B7AC', '#E8D4CC'], detail: 'Tarjeta manuscrita y envoltorio marfil' },
  { id: 'celebrar', name: 'Para celebrar', desc: 'Que los días especiales tengan flores.', glyph: '✳', message: 'Por cada logro, cada año y cada motivo para brindar.', tip: 'Celebra con color: tonos vivos y un detalle que se vea desde lejos.', palette: ['#D9A93F', '#D9B7AC', '#B98272'], detail: 'Caja de regalo y lazo a tono' },
  { id: 'agradecer', name: 'Para agradecer', desc: 'Un gracias que florece en las manos.', glyph: '❀', message: 'Gracias por estar, por ayudar y por hacerlo todo más fácil.', tip: 'Sencillez ante todo: un gesto cálido y sin exageraciones.', palette: ['#E8D4CC', '#8A9677', '#FDFBF8'], detail: 'Nota breve escrita a mano' },
  { id: 'sorprender', name: 'Para sorprender', desc: 'Porque lo inesperado enamora.', glyph: '✧', message: 'Sin fecha, sin motivo… solo porque pensé en ti.', tip: 'Lo inesperado es lo que se recuerda: entrégalo sin avisar.', palette: ['#FDFBF8', '#D9A93F', '#E8D4CC'], detail: 'Entrega con mensaje escondido' },
  { id: 'mama', name: 'Para mamá', desc: 'Ternura hecha pétalo.', glyph: '✿', message: 'Para quien nos enseñó a crecer y nunca dejó de cuidarnos.', tip: 'Nombra algo concreto que ella hizo por ti.', palette: ['#D9B7AC', '#E8D4CC', '#B98272'], detail: 'Tarjeta con recuerdo compartido' },
  { id: 'alegrar', name: 'Para alegrar su día', desc: 'Un rayo de sol que no se marchita.', glyph: '☀', message: 'Que hoy tengas un poco más de luz.', tip: 'Ligereza y humor: un detalle que arranque una sonrisa.', palette: ['#D9A93F', '#F6F2EA', '#8A9677'], detail: 'Frase corta y alegre' },
]

export const PHRASES = [
  'Que nunca te falten motivos para florecer.',
  'Un pequeño detalle para recordarte lo especial que eres.',
  'Hay personas que hacen florecer nuestros días.',
]

export const GALLERY_VIEWS = ['Vista frontal', 'Ángulo lateral', 'Detalle de pétalos', 'Envoltorio', 'Listo para regalar']

export const EASE: [number, number, number, number] = [0.22, 0.8, 0.24, 1]
