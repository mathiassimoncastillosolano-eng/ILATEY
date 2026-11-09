import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'
import AnimatedLogo from '../../branding/AnimatedLogo'
import PetalAnimation from '../../welcome/PetalAnimation'
import { EASE } from '../../../data/products'

type Props = {
  /** Enlace wa.me con el mensaje ya preparado. */
  url: string
  /** Qué debe hacer el cliente con el documento descargado (se muestra en cuanto WhatsApp se abre). */
  note: string
  onClose: () => void
}

/** Hitos (ms). Se abre WhatsApp cuando el anillo se completa, dentro de la ventana de activación del clic. */
const T = { title: 900, body: 1900, final: 2800, open: 3600 }
const T_REDUCED = { title: 0, body: 0, final: 0, open: 1800 }
const RING = 2 * Math.PI * 74

const TITLE = ['Gracias', 'por', 'contar', 'con', 'nosotros.']

/** Dispositivos táctiles: se navega en la misma pestaña (Safari bloquea window.open fuera del gesto del clic). */
const isTouch = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

/**
 * Despedida de la solicitud. Pantalla completa, sin bloquear nada: el enlace «Abrir WhatsApp» existe desde el principio
 * y la apertura automática solo es una comodidad. Si el navegador bloquea la ventana, el botón pasa a ser el camino principal.
 * Secuencia: fondo y luz → logo que se traza dentro de un anillo → pétalos → mensaje → apertura de WhatsApp.
 */
export default function ContactTransition({ url, note, onClose }: Props) {
  const reduce = useReducedMotion()
  const t = reduce ? T_REDUCED : T
  const [stage, setStage] = useState(reduce ? 3 : 0)
  const [state, setState] = useState<'waiting' | 'opened' | 'blocked'>('waiting')
  const closeBtn = useRef<HTMLButtonElement>(null)
  const link = useRef<HTMLAnchorElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const closed = useRef(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), t.title),
      setTimeout(() => setStage(2), t.body),
      setTimeout(() => setStage(3), t.final),
      setTimeout(() => {
        if (closed.current) return
        if (isTouch()) {
          setState('opened')
          window.location.assign(url)
          return
        }
        const w = window.open(url, '_blank')
        if (w) { w.opener = null; setState('opened') } else setState('blocked')
      }, t.open),
    ]
    return () => timers.forEach(clearTimeout)
  }, [url, t.title, t.body, t.final, t.open])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    root.current?.focus({ preventScroll: true })
    return () => { document.body.style.overflow = prev }
  }, [])

  const close = () => { closed.current = true; onClose() }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return }
    if (e.key !== 'Tab') return
    const items = [link.current, closeBtn.current].filter(Boolean) as HTMLElement[]
    const i = items.indexOf(document.activeElement as HTMLElement)
    e.preventDefault()
    items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
  }

  const fade = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 16, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: reduce ? 0 : 1.1, delay, ease: EASE },
  })

  const finalText =
    state === 'opened' ? 'WhatsApp se abrió. Tu conversación con ILATEY te espera.'
      : state === 'blocked' ? 'Tu navegador bloqueó la ventana. Ábrela con el botón.'
        : 'Estamos preparando el contacto con nuestro equipo.'

  return createPortal(
    <motion.div
      ref={root}
      className="thx"
      role="dialog"
      aria-modal="true"
      aria-labelledby="thx-title"
      aria-describedby="thx-status"
      tabIndex={-1}
      onKeyDown={onKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
    >
      <div className="thx-bg" aria-hidden="true" />
      <div className="thx-glow" aria-hidden="true" />
      <div className="thx-glow thx-glow-2" aria-hidden="true" />
      <PetalAnimation seed={20260512} count={18} slow={1.3} />

      <div className="thx-center">
        <div className="thx-mark" aria-hidden="true">
          <svg className="thx-ring" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="74" className="thx-ring-track" />
            <motion.circle
              cx="80" cy="80" r="74" className="thx-ring-bar"
              strokeDasharray={RING}
              initial={{ strokeDashoffset: reduce ? 0 : RING }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: reduce ? 0 : t.open / 1000, ease: 'linear' }}
            />
          </svg>
          <AnimatedLogo size={58} strokeWidth={1.6} delay={0.35} />
        </div>

        <h2 id="thx-title" className="thx-title" aria-label="Gracias por contar con nosotros.">
          <span aria-hidden="true">
            {TITLE.map((w, i) => (
              // El espacio va FUERA del inline-block: dentro, el espacio final se colapsa y las palabras quedan pegadas.
              <Fragment key={w}>
                {i > 0 && ' '}
                <motion.span
                  className={i >= 2 ? 'thx-em' : undefined}
                  initial={reduce ? false : { opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={stage >= 1 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
                  transition={{ duration: 0.9, delay: reduce ? 0 : i * 0.11, ease: EASE }}
                >
                  {w}
                </motion.span>
              </Fragment>
            ))}
          </span>
        </h2>

        {stage >= 2 && (
          <motion.p className="thx-body" {...fade()}>
            Cada detalle de tu ramo ha sido preparado con especial cariño. Nuestro equipo estará encantado de acompañarte para hacer realidad tu elección.
          </motion.p>
        )}

        {stage >= 3 && (
          <motion.div className="thx-final" {...fade()}>
            <p id="thx-status" role="status" className={`thx-status ${state}`}>
              {state === 'waiting' && <span className="thx-dots" aria-hidden="true"><i /><i /><i /></span>}
              {finalText}
            </p>
            {state !== 'waiting' && <p className="thx-note">{note}</p>}
          </motion.div>
        )}

        <a
          ref={link}
          className={`thx-open ${state === 'blocked' ? 'is-key' : ''}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { closed.current = true; setState('opened') }}
        >
          {state === 'opened' ? 'Abrir WhatsApp de nuevo' : 'Abrir WhatsApp ahora'} <ExternalLink size={14} strokeWidth={1.7} aria-hidden="true" />
        </a>
      </div>

      <button ref={closeBtn} type="button" className="thx-close" onClick={close} aria-label="Volver a mi solicitud">
        Volver a mi solicitud <X size={14} strokeWidth={1.6} aria-hidden="true" />
      </button>
    </motion.div>,
    document.body,
  )
}
