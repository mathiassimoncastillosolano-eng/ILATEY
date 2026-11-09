import { LIMITS } from '../../../data/pricingRules'
import { formatDate, minDeliveryDate, validateStep } from '../../../lib/customizerValidation'
import { useCustomizerStore } from '../../../store/useCustomizerStore'
import DatePicker from '../ui/DatePicker'
import Msg from '../ui/Msg'

export default function AdditionalDetails() {
  const config = useCustomizerStore((s) => s.config)
  const set = useCustomizerStore((s) => s.setExtras)
  const x = config.extras
  const min = minDeliveryDate()
  const errors = validateStep('detalles', config)

  return (
    <div className="cz-form">
      <div className="cz-field cz-big-field">
        <label htmlFor="cz-notes">Cuéntanos cómo imaginas tu ramo</label>
        <textarea id="cz-notes" rows={7} maxLength={LIMITS.notesMax} value={x.notes} aria-describedby="cz-notes-count" placeholder="La ocasión, el estilo de la persona, lo que quieres transmitir, una flor o color imprescindible…" onChange={(e) => set({ notes: e.target.value })} />
        <small id="cz-notes-count" className="cz-counter">{x.notes.length} / {LIMITS.notesMax}</small>
      </div>

      <div className="cz-two">
        <div className="cz-field">
          <label htmlFor="cz-pref">Preferencias específicas</label>
          <textarea id="cz-pref" rows={3} maxLength={LIMITS.shortMax} value={x.preferences} placeholder="Ej.: más follaje, tonos suaves, estilo romántico…" onChange={(e) => set({ preferences: e.target.value })} />
        </div>
        <div className="cz-field">
          <label htmlFor="cz-res">Restricciones o indicaciones de composición</label>
          <textarea id="cz-res" rows={3} maxLength={LIMITS.shortMax} value={x.restrictions} placeholder="Ej.: sin girasoles, que no sea muy alto…" onChange={(e) => set({ restrictions: e.target.value })} />
        </div>
      </div>

      <div className="cz-two">
        <div className="cz-field">
          <label htmlFor="cz-budget">Presupuesto aproximado (S/) <small>opcional</small></label>
          <input id="cz-budget" type="number" inputMode="decimal" min={0} step={5} value={x.budget ?? ''} placeholder="Ej.: 150" onChange={(e) => set({ budget: e.target.value === '' ? null : Number(e.target.value) })} />
        </div>
        <div className="cz-field">
          <label htmlFor="cz-date">Fecha deseada de entrega <small>opcional</small></label>
          <DatePicker id="cz-date" value={x.deliveryDate} min={min} onChange={(deliveryDate) => set({ deliveryDate })} describedBy="cz-date-hint" />
          <small id="cz-date-hint" className="cz-hint">Desde el {formatDate(min)}. Sujeta a confirmación del taller.</small>
        </div>
      </div>
      {errors.map((e) => <Msg key={e} kind="error">{e}</Msg>)}
    </div>
  )
}
