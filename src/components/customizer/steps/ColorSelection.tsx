import { PALETTES, flowerById, paletteById } from '../../../data/customizationOptions'
import { LIMITS } from '../../../data/pricingRules'
import { allowedPalettes, selectedFlowers } from '../../../lib/customizerValidation'
import { useCustomizerStore } from '../../../store/useCustomizerStore'
import OptionCard from '../ui/OptionCard'
import Msg from '../ui/Msg'

export default function ColorSelection() {
  const config = useCustomizerStore((s) => s.config)
  const toggle = useCustomizerStore((s) => s.togglePalette)
  const allowed = allowedPalettes(config)
  const chosen = config.palettes
  const atLimit = chosen.filter((p) => p !== 'mixto').length >= LIMITS.maxPalettes

  // Flores que no admiten ninguna de las paletas elegidas: se dibujarán en su color propio.
  const constrained = selectedFlowers(config).filter((id) => {
    const own = flowerById(id).palettes
    return chosen.length > 0 && !chosen.some((p) => own.includes(p))
  })

  return (
    <fieldset className="cz-fs">
      <legend className="sr-only">Paletas de color</legend>
      <div className="cz-grid-opts cz-pals">
        {PALETTES.map((p) => {
          const on = chosen.includes(p.id)
          const ok = allowed.includes(p.id)
          const blocked = !on && (!ok || (p.id !== 'mixto' && atLimit))
          return (
            <OptionCard key={p.id} type="checkbox" name="colores" checked={on} disabled={blocked} onChange={() => toggle(p.id)} className="cz-vert">
              <span className="cz-sws" aria-hidden="true">
                {p.swatches.map((c) => <i key={c} style={{ background: c }} />)}
              </span>
              <span className="cz-ot">
                <strong>{p.name}</strong>
                <span>{!ok ? 'No disponible con las flores elegidas.' : p.desc}</span>
              </span>
            </OptionCard>
          )
        })}
      </div>
      <p className="cz-count" aria-live="polite">
        {chosen.length === 0 ? 'Aún no elegiste colores' : `Elegiste: ${chosen.map((id) => paletteById(id).name).join(' + ')}`}
      </p>
      {constrained.map((id) => (
        <Msg key={id} kind="warn">
          {flowerById(id).name}: en este configurador solo se ofrecen en {flowerById(id).palettes.filter((p) => p !== 'mixto').map((p) => paletteById(p).name.toLowerCase()).join(' o ')}, así que se dibujarán así.
        </Msg>
      ))}
      <Msg kind="info">Puedes combinar hasta {LIMITS.maxPalettes} paletas. «Colores mixtos» reemplaza al resto.</Msg>
    </fieldset>
  )
}
