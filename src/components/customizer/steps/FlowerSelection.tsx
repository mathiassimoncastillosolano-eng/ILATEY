import { FLOWERS } from '../../../data/customizationOptions'
import { LIMITS, flowerPriceLabel } from '../../../data/pricingRules'
import { useCustomizerStore } from '../../../store/useCustomizerStore'
import FlowerThumb from '../ui/FlowerThumb'
import OptionCard from '../ui/OptionCard'
import Msg from '../ui/Msg'

const AVAIL = { available: 'Disponible', consult: 'Consultar disponibilidad', unavailable: 'No disponible' } as const

export default function FlowerSelection() {
  const flowers = useCustomizerStore((s) => s.config.flowers)
  const toggle = useCustomizerStore((s) => s.toggleFlower)
  const count = Object.keys(flowers).length
  const full = count >= LIMITS.maxFlowerTypes

  return (
    <fieldset className="cz-fs">
      <legend className="sr-only">Tipos de flor</legend>
      <div className="cz-grid-opts">
        {FLOWERS.map((f) => {
          const on = (flowers[f.id] ?? 0) > 0
          return (
            <OptionCard key={f.id} type="checkbox" name="flores" checked={on} disabled={f.availability === 'unavailable' || (!on && full)} onChange={() => toggle(f.id)}>
              <FlowerThumb id={f.id} />
              <span className="cz-ot">
                <strong>{f.name}</strong>
                <span>{f.desc}</span>
                <span className="cz-meta">
                  <b>{flowerPriceLabel(f.id)}</b>
                  <i className={`cz-av cz-av-${f.availability}`}>{AVAIL[f.availability]}</i>
                </span>
              </span>
            </OptionCard>
          )
        })}
      </div>
      <p className="cz-count" aria-live="polite">{count} de {LIMITS.maxFlowerTypes} tipos de flor elegidos</p>
      {full && <Msg kind="info">Llegaste al máximo de tipos. Quita uno para elegir otro.</Msg>}
      <Msg kind="info">Las flores marcadas «Consultar disponibilidad» se confirman con el taller antes de elaborar tu ramo.</Msg>
    </fieldset>
  )
}
