import { useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import Msg from './ui/Msg'

type Props = {
  step: number
  last: number
  errors: string[]
  showErrors: boolean
  onBack: () => void
  onNext: () => void
  onReset: () => void
}

export default function CustomizerNavigation({ step, last, errors, showErrors, onBack, onNext, onReset }: Props) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="cz-nav" role="navigation" aria-label="Pasos del configurador">
      {showErrors && errors.map((e) => <Msg key={e} kind="error">{e}</Msg>)}
      <div className="cz-nav-row">
        <button type="button" className="btn ghost" onClick={onBack} disabled={step === 0}>
          <ArrowLeft size={16} strokeWidth={1.8} /> Atrás
        </button>
        <span className="cz-saved">Se guarda solo en este dispositivo</span>
        {step < last && (
          <button type="button" className="btn" onClick={onNext}>
            Siguiente <ArrowRight size={16} strokeWidth={1.8} />
          </button>
        )}
      </div>
      <div className="cz-reset">
        {!confirm ? (
          <button type="button" className="cz-link" onClick={() => setConfirm(true)}><RotateCcw size={14} strokeWidth={1.8} /> Reiniciar diseño</button>
        ) : (
          <span role="alert">
            ¿Borrar todo tu diseño?{' '}
            <button type="button" className="cz-link strong" onClick={() => { setConfirm(false); onReset() }}>Sí, reiniciar</button>{' · '}
            <button type="button" className="cz-link" onClick={() => setConfirm(false)}>Cancelar</button>
          </span>
        )}
      </div>
    </div>
  )
}
