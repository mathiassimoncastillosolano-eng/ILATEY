import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { STEPS } from '../../data/customizationOptions'

type Props = { step: number; maxStep: number; onGo: (i: number) => void }

/** Indicador de progreso animado. Solo se puede saltar a pasos ya alcanzables. */
export default function CustomizerProgress({ step, maxStep, onGo }: Props) {
  const reduce = useReducedMotion()
  return (
    <div className="cz-prog" role="group" aria-label="Progreso del diseño">
      <div className="cz-bar" aria-hidden="true">
        <motion.i initial={false} animate={{ scaleX: step / (STEPS.length - 1) }} transition={reduce ? { duration: 0 } : { duration: 0.7, ease: [0.22, 0.8, 0.24, 1] }} />
      </div>
      <ol className="cz-steps">
        {STEPS.map((s, i) => {
          const done = i < step
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`cz-st ${i === step ? 'now' : ''} ${done ? 'done' : ''}`}
                disabled={i > maxStep}
                aria-current={i === step ? 'step' : undefined}
                aria-label={`Paso ${i + 1}: ${s.label}${done ? ', completado' : ''}`}
                onClick={() => onGo(i)}
              >
                <span className="cz-dot">{done ? <Check size={13} strokeWidth={2.4} /> : i + 1}</span>
                <span className="cz-sl">{s.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="cz-prog-m" aria-hidden="true">Paso {step + 1} de {STEPS.length} · <b>{STEPS[step].label}</b></p>
    </div>
  )
}
