import { FLOWERS, flowerById } from '../../../data/customizationOptions'
import { FLOWER_UNIT_PRICE, LIMITS, formatMoney, totalFlowers } from '../../../data/pricingRules'
import { validateStep } from '../../../lib/customizerValidation'
import { useCustomizerStore } from '../../../store/useCustomizerStore'
import FlowerThumb from '../ui/FlowerThumb'
import QtyStepper from '../ui/QtyStepper'
import Msg from '../ui/Msg'

export default function QuantitySelection({ onGo }: { onGo: (i: number) => void }) {
  const config = useCustomizerStore((s) => s.config)
  const setQuantity = useCustomizerStore((s) => s.setQuantity)
  const setTotal = useCustomizerStore((s) => s.setTotal)
  const total = totalFlowers(config.flowers)
  const chosen = FLOWERS.filter((f) => (config.flowers[f.id] ?? 0) > 0)
  const errors = validateStep('cantidad', config)

  if (chosen.length === 0) {
    return (
      <div className="cz-empty">
        <p>Todavía no elegiste ninguna flor.</p>
        <button type="button" className="btn ghost" onClick={() => onGo(0)}>Elegir flores</button>
      </div>
    )
  }

  return (
    <div className="cz-qwrap">
      <ul className="cz-rows">
        {chosen.map((f) => {
          const qty = config.flowers[f.id] ?? 0
          const unit = FLOWER_UNIT_PRICE[f.id]
          const others = total - qty
          return (
            <li key={f.id} className="cz-row">
              <FlowerThumb id={f.id} size={52} />
              <span className="cz-rn">
                <strong>{flowerById(f.id).name}</strong>
                <small>{unit === null ? 'Por cotizar' : `${formatMoney(unit)} c/u`}</small>
              </span>
              <QtyStepper label={`cantidad de ${f.name.toLowerCase()}`} value={qty} min={1} max={LIMITS.maxTotal - others} onChange={(n) => setQuantity(f.id, n)} />
              <span className="cz-rs">{unit === null ? 'Por cotizar' : formatMoney(unit * qty)}</span>
            </li>
          )
        })}
      </ul>

      <div className="cz-total">
        <div>
          <span className="cz-lab">Total de flores</span>
          <strong className="cz-big" aria-live="polite">{total}</strong>
        </div>
        <div className="cz-presets" role="group" aria-label="Cantidades sugeridas">
          {LIMITS.quantityPresets.map((n) => (
            <button key={n} type="button" className={`cz-chip ${total === n ? 'on' : ''}`} aria-pressed={total === n} onClick={() => setTotal(n)}>{n}</button>
          ))}
        </div>
        <div className="cz-custom">
          <label htmlFor="cz-total">Otra cantidad</label>
          <QtyStepper id="cz-total" label="total de flores" value={Math.max(total, 1)} min={Math.max(LIMITS.minTotal, chosen.length)} max={LIMITS.maxTotal} onChange={setTotal} />
        </div>
      </div>
      <p className="cz-help">
        Mínimo {LIMITS.minTotal} y máximo {LIMITS.maxTotal} flores. Al elegir un total con varios tipos, lo repartimos por igual; luego puedes ajustar cada uno.
      </p>
      {errors.map((e) => <Msg key={e} kind="error">{e}</Msg>)}
    </div>
  )
}
