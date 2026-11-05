import { motion, useReducedMotion } from 'framer-motion'
import { LOGO_PATHS, LOGO_VIEWBOX } from './logoPaths'
import type { LogoTone } from './LogoSymbol'

type Props = {
  size?: number
  tone?: LogoTone
  strokeWidth?: number
  /** Retraso antes de empezar a trazar, en segundos. */
  delay?: number
  className?: string
  /** Se llama cuando el trazado termina y el símbolo queda en su estado estable. */
  onDrawn?: () => void
}

const EASE = [0.45, 0.05, 0.25, 1] as const

/**
 * Símbolo que se dibuja a mano: pétalo central → pétalo izquierdo → pétalo derecho (stroke-dashoffset),
 * y después un único movimiento suave de asentamiento. Termina quieto. Con prefers-reduced-motion aparece ya dibujado.
 */
export default function AnimatedLogo({ size = 140, tone = 'copper', strokeWidth = 1.5, delay = 0, className = '', onDrawn }: Props) {
  const reduce = useReducedMotion()

  const draw = (d: number, dur: number) => ({
    initial: reduce ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration: dur, delay: delay + d, ease: EASE },
      opacity: { duration: 0.25, delay: delay + d },
    },
  })

  const settle = (angle: number, ox: number, oy: number) => ({
    style: { originX: ox, originY: oy },
    animate: reduce ? undefined : { rotate: [0, angle, -angle * 0.35, 0] },
    transition: { delay: delay + 2.1, duration: 3.4, ease: 'easeInOut' as const, times: [0, 0.38, 0.72, 1] },
  })

  return (
    <svg
      className={`logo-sym logo-${tone} ${className}`.trim()}
      viewBox={LOGO_VIEWBOX}
      width={size}
      height={(size * 120) / 100}
      fill="none"
      stroke="var(--logo)"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <motion.g {...settle(0.9, 0.5, 2.85)}>
        <motion.path d={LOGO_PATHS.arch} {...draw(0, 1.0)} />
      </motion.g>
      <motion.g {...settle(-1.8, 0.73, 1)}>
        <motion.path d={LOGO_PATHS.left} {...draw(0.55, 1.5)} />
      </motion.g>
      <motion.g {...settle(1.8, 0.27, 1)}>
        <motion.path d={LOGO_PATHS.right} {...draw(0.8, 1.5)} onAnimationComplete={onDrawn} />
      </motion.g>
    </svg>
  )
}
