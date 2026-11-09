import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { useReducedMotion } from 'framer-motion'
import { rng } from '../../lib/prng'

type Layer = 'far' | 'mid' | 'near' | 'edge'

interface Petal {
  id: number
  layer: Layer
  gradient: 1 | 2 | 3
  style: CSSProperties
}

/**
 * Pétalos con profundidad: lejanos (pequeños, nítidos), medios, cercanos al centro y de borde (grandes y desenfocados).
 * Todo se anima con transform/opacity vía CSS (compuesto en GPU). Los valores salen de un generador con semilla:
 * son estables entre renders y no hay Math.random en el render.
 */
function makePetals(count: number, seed: number, slow: number): Petal[] {
  const rand = rng(seed)
  const range = (a: number, b: number) => a + rand() * (b - a)
  const list: Petal[] = []
  for (let i = 0; i < count; i++) {
    const layer: Layer = i % 5 === 0 ? 'edge' : i % 5 === 1 ? 'near' : i % 5 === 2 || i % 5 === 3 ? 'mid' : 'far'
    const left = rand() > 0.5
    let w: number, blur: number, x0: number, x1: number, x2: number, dur: number, o: number
    switch (layer) {
      case 'edge': // cerca de la «cámara»: grandes, desenfocados, por los extremos
        w = range(46, 74); blur = range(3, 6); o = range(0.5, 0.75); dur = range(9, 12)
        x0 = left ? range(-4, 10) : range(90, 104); x1 = x0 + (left ? range(2, 8) : -range(2, 8)); x2 = x1 + range(-6, 6)
        break
      case 'near': // se acercan al centro de la pantalla
        w = range(26, 40); blur = range(0, 1.2); o = range(0.8, 0.95); dur = range(8, 10.5)
        x0 = range(22, 78); x1 = 50 + (x0 - 50) * 0.35; x2 = 50 + (x0 - 50) * 0.15 + range(-8, 8)
        break
      case 'mid':
        w = range(18, 28); blur = range(0, 0.8); o = range(0.7, 0.9); dur = range(10, 13)
        x0 = range(5, 95); x1 = x0 + range(-14, 14); x2 = x1 + range(-12, 12)
        break
      default: // lejanos
        w = range(10, 16); blur = range(0.6, 1.6); o = range(0.45, 0.7); dur = range(13, 17)
        x0 = range(0, 100); x1 = x0 + range(-8, 8); x2 = x1 + range(-8, 8)
    }
    // Escena 1: unos pocos pétalos nacen despacio. Escena 2: el resto se une al movimiento.
    dur *= slow
    const delay = i < 5 ? range(0.2, 1.6) : range(1.4, 5.2)
    const style = {
      '--w': `${w.toFixed(1)}px`,
      '--blur': `${blur.toFixed(1)}px`,
      '--o': o.toFixed(2),
      '--dur': `${dur.toFixed(1)}s`,
      '--delay': `${delay.toFixed(2)}s`,
      '--x0': `${x0.toFixed(1)}vw`,
      '--x1': `${x1.toFixed(1)}vw`,
      '--x2': `${x2.toFixed(1)}vw`,
      '--r0': `${range(-60, 60).toFixed(0)}deg`,
      '--r1': `${range(-120, 120).toFixed(0)}deg`,
      '--r2': `${range(-200, 200).toFixed(0)}deg`,
      '--ry': `${range(40, 80).toFixed(0)}deg`,
      '--fl': `${range(2.2, 4).toFixed(2)}s`,
    } as CSSProperties
    list.push({ id: i, layer, gradient: ((i % 3) + 1) as 1 | 2 | 3, style })
  }
  return list
}

type Props = {
  /** Semilla de la disposición: otra semilla, otra coreografía (la bienvenida usa la predeterminada). */
  seed?: number
  /** Pétalos en escritorio; en pantallas pequeñas se reducen para cuidar el rendimiento. */
  count?: number
  /** Multiplicador de duración: > 1 = más lento y sereno. */
  slow?: number
}

export default function PetalAnimation({ seed = 20261105, count: desktop = 26, slow = 1 }: Props) {
  const reduce = useReducedMotion()
  const count = typeof window !== 'undefined' && window.innerWidth < 640 ? Math.round(desktop * 0.62) : desktop
  const petals = useMemo(() => makePetals(count, seed, slow), [count, seed, slow])
  if (reduce) return null

  return (
    <div className="wp-field" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }} focusable="false">
        <defs>
          <linearGradient id="wpg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F3DCD5" /><stop offset="1" stopColor="#D9B7AC" /></linearGradient>
          <linearGradient id="wpg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBEEEA" /><stop offset="1" stopColor="#E8D4CC" /></linearGradient>
          <linearGradient id="wpg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E3B7A8" /><stop offset="1" stopColor="#B98272" /></linearGradient>
        </defs>
      </svg>
      {petals.map((p) => (
        <span key={p.id} className={`wp wp-${p.layer}`} style={p.style}>
          <span className="wp-in">
            <svg viewBox="0 0 40 60" focusable="false">
              <path d="M20 2 C34 14 40 38 20 58 C0 38 6 14 20 2 Z" fill={`url(#wpg${p.gradient})`} />
              <path d="M20 10 C19 26 19 40 20 52" stroke="rgba(114,86,77,.22)" strokeWidth="0.8" fill="none" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  )
}
