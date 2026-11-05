import { CARD_STYLES, MESSAGE_SUGGESTIONS } from '../../../data/customizationOptions'
import { CARD_SUPPLEMENT, LIMITS, supplementLabel } from '../../../data/pricingRules'
import { useCustomizerStore } from '../../../store/useCustomizerStore'
import CardPreview from '../ui/CardPreview'
import OptionCard from '../ui/OptionCard'

export default function DedicationForm() {
  const card = useCustomizerStore((s) => s.config.card)
  const set = useCustomizerStore((s) => s.setCard)
  const left = LIMITS.messageMax - card.message.length

  return (
    <div className="cz-card-step">
      <div className="cz-form">
        <div className="cz-field">
          <label htmlFor="cz-to">Para quién es</label>
          <input id="cz-to" type="text" maxLength={LIMITS.nameMax} autoComplete="off" value={card.recipient} placeholder="Nombre de la persona" onChange={(e) => set({ recipient: e.target.value })} />
        </div>

        <div className="cz-field">
          <label htmlFor="cz-msg">Dedicatoria</label>
          <textarea id="cz-msg" rows={5} maxLength={LIMITS.messageMax} value={card.message} placeholder="Escribe con tus palabras o elige una sugerencia…" aria-describedby="cz-msg-count" onChange={(e) => set({ message: e.target.value })} />
          <small id="cz-msg-count" className={`cz-counter ${left < 20 ? 'low' : ''}`}>{card.message.length} / {LIMITS.messageMax}</small>
        </div>

        <div className="cz-sugs" role="group" aria-label="Sugerencias de mensaje">
          <span className="cz-lab">Sugerencias</span>
          {MESSAGE_SUGGESTIONS.map((m) => (
            <button key={m} type="button" className={`cz-sug ${card.message === m ? 'on' : ''}`} aria-pressed={card.message === m} onClick={() => set({ message: m })}>“{m}”</button>
          ))}
        </div>

        <div className="cz-field">
          <label htmlFor="cz-from">De parte de</label>
          <input id="cz-from" type="text" maxLength={LIMITS.nameMax} autoComplete="off" value={card.sender} placeholder="Tu nombre o firma" onChange={(e) => set({ sender: e.target.value })} />
        </div>

        <fieldset className="cz-fs cz-group">
          <legend>Estilo de tarjeta</legend>
          <div className="cz-inline">
            {CARD_STYLES.map((c) => (
              <OptionCard key={c.id} type="radio" name="tarjeta-estilo" checked={card.style === c.id} onChange={() => set({ style: c.id })} className="cz-swatch">
                <i className={`cz-dotc cz-cs-${c.id}`} aria-hidden="true" />
                <span>{c.name} <small>{supplementLabel(CARD_SUPPLEMENT[c.id])}</small></span>
              </OptionCard>
            ))}
          </div>
        </fieldset>
      </div>
      <CardPreview card={card} />
    </div>
  )
}
