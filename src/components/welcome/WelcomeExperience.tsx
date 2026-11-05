import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import AnimatedLogo from '../branding/AnimatedLogo'
import PetalAnimation from './PetalAnimation'
import { EASE } from '../../data/products'

const NAME = 'ILATEY'.split('')

/** Hitos (ms) de la secuencia. Escena 1–2 (pétalos) ocurren desde el inicio; ver PetalAnimation. */
const T = { logo: 2400, phrase: 6200, exit: 9800 }

/**
 * Bienvenida de primera visita. Escenas:
 *  1 · nacimiento: pétalos aparecen despacio · 2 · movimiento: derivan con profundidad
 *  3 · identidad: se traza el símbolo y se revela el nombre · 4 · bienvenida: frase y desvanecimiento
 * Se puede omitir en cualquier momento (botón, Esc). No bloquea nada más allá de su duración.
 */
export default function WelcomeExperience({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState(reduce ? 4 : 2)
  const skip = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const timers = reduce
      ? [setTimeout(onDone, 4200)]
      : [setTimeout(() => setPhase(3), T.logo), setTimeout(() => setPhase(4), T.phrase), setTimeout(onDone, T.exit)]
    return () => timers.forEach(clearTimeout)
  }, [reduce, onDone])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    skip.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone()
      if (e.key === 'Tab') { e.preventDefault(); skip.current?.focus() } // el único control es «Omitir»
    }
    addEventListener('keydown', key)
    return () => { document.body.style.overflow = prev; removeEventListener('keydown', key) }
  }, [onDone])

  const fast = reduce ? 0 : 1

  return (
    <motion.div
      className="wl"
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a ILATEY Flower Studio"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)', transition: { duration: reduce ? 0.2 : 1.1, ease: EASE } }}
    >
      <div className="wl-bg" aria-hidden="true" />
      <div className="wl-glow" aria-hidden="true" />
      <PetalAnimation />

      <div className="wl-center">
        {phase >= 3 && <AnimatedLogo size={112} strokeWidth={1.5} />}
        {phase >= 3 && (
          <h1 className="wl-name" aria-label="ILATEY Flower Studio">
            <span aria-hidden="true" className="wl-letters">
              {NAME.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 22, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.9, delay: fast * (1.3 + i * 0.09), ease: EASE }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
            <motion.span
              aria-hidden="true"
              className="wl-sub"
              initial={reduce ? false : { opacity: 0, letterSpacing: '0.9em' }}
              animate={{ opacity: 1, letterSpacing: '0.46em' }}
              transition={{ duration: 1.6, delay: fast * 2.1, ease: EASE }}
            >
              FLOWER STUDIO
            </motion.span>
          </h1>
        )}
        {phase >= 4 && (
          <motion.p
            className="wl-phrase"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE }}
          >
            Cada flor tiene una historia.<br />
            <em>Hagamos florecer la tuya.</em>
          </motion.p>
        )}
      </div>

      <button ref={skip} type="button" className="wl-skip" onClick={onDone} aria-label="Omitir bienvenida">
        Omitir <X size={14} strokeWidth={1.6} />
      </button>
    </motion.div>
  )
}
