import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Eye, Layers, Tag } from 'lucide-react'
import type { BouquetConfig } from '../../types/customization'
import { defaultConfig } from '../../store/customizerDefaults'
import { useOpenCustomizer } from '../../lib/useCustomizer'
import Reveal from '../Reveal'
import BouquetPreview from './BouquetPreview'

const demo = (patch: Partial<BouquetConfig>, wrap: Partial<BouquetConfig['wrapping']> = {}): BouquetConfig => {
  const d = defaultConfig()
  return { ...d, ...patch, wrapping: { ...d.wrapping, ...wrap } }
}

/** Ejemplos que se alternan para mostrar que la vista previa responde. */
const DEMOS: BouquetConfig[] = [
  demo({ flowers: { rosa: 12, complemento: 4 }, shape: 'redondo', palettes: ['rosa-pastel'] }, { paperColor: 'rosa', ribbonColor: 'cobre' }),
  demo({ flowers: { tulipan: 9, margarita: 6 }, shape: 'asimetrico', palettes: ['blanco-crema', 'lavanda'] }, { paper: 'seda', paperColor: 'blanco', ribbonColor: 'salvia', finish: 'mono' }),
  demo({ flowers: { girasol: 7, margarita: 8 }, shape: 'silvestre', palettes: ['amarillo'] }, { paperColor: 'kraft', ribbon: 'algodon', ribbonColor: 'marron', layers: 2 }),
]

export default function CustomizerPromo() {
  const customizer = useOpenCustomizer()
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % DEMOS.length), 4200)
    return () => clearInterval(t)
  }, [reduce])

  return (
    <section className="cz-promo" id="personaliza">
      <div className="w cz-promo-g">
        <Reveal className="cz-promo-t">
          <span className="eb">Bouquet Studio</span>
          <h2>Un ramo, <em>infinitas posibilidades.</em></h2>
          <p>Elige cada detalle, combina colores y crea un ramo que cuente exactamente lo que quieres expresar.</p>
          <ul className="cz-promo-f">
            <li><Layers size={18} strokeWidth={1.6} /> Flores, forma, colores y envoltorio a tu gusto</li>
            <li><Eye size={18} strokeWidth={1.6} /> Vista previa que cambia con cada elección</li>
            <li><Tag size={18} strokeWidth={1.6} /> Precio estimado al instante, sin sorpresas</li>
          </ul>
          <button className="btn" onClick={customizer.create}>Crear mi ramo</button>
        </Reveal>
        <Reveal className="cz-promo-v" delay={150}>
          <div className="cz-promo-arch"><BouquetPreview config={DEMOS[i]} caption={false} /></div>
          <p className="cz-promo-cap">Vista ilustrativa de ejemplo</p>
        </Reveal>
      </div>
    </section>
  )
}
