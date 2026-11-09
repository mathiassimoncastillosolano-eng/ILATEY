import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { EASE } from '../../../data/products'

/**
 * Calendario de ILATEY para elegir la fecha de entrega.
 * · Valor en formato AAAA-MM-DD (hora local), igual que Extras.deliveryDate.
 * · Los días anteriores a `min` se ven pero no se pueden elegir ni enfocar con el teclado.
 * · Teclado: flechas (día/semana), Inicio/Fin (semana), RePág/AvPág (mes; con Mayús, año), Intro o Espacio elige, Esc cierra.
 */

type Props = {
  id: string
  value: string
  /** Primera fecha elegible, AAAA-MM-DD. */
  min: string
  onChange: (iso: string) => void
  describedBy?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
const valid = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(iso)
const addDays = (iso: string, n: number) => { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d) }
const addMonths = (iso: string, n: number) => {
  const d = fromISO(iso)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, last))
  return toISO(d)
}
/** Lunes = 0 … domingo = 6 */
const weekday = (iso: string) => (fromISO(iso).getDay() + 6) % 7

const LONG = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const MONTH = new Intl.DateTimeFormat('es-PE', { month: 'long' })
const READABLE = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
const WEEK = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']
const WEEK_FULL = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type Cell = { iso: string; day: number } | null

function monthCells(year: number, month: number): Cell[][] {
  const first = new Date(year, month, 1)
  const lead = (first.getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  const cells: Cell[] = [...Array<Cell>(lead).fill(null)]
  for (let d = 1; d <= count; d++) cells.push({ iso: toISO(new Date(year, month, d)), day: d })
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: Cell[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

type GridProps = {
  year: number
  month: number
  value: string
  min: string
  today: string
  focusISO: string
  grabFocus: React.MutableRefObject<boolean>
  labelId: string
  onPick: (iso: string) => void
  onKey: (e: React.KeyboardEvent) => void
}

function MonthGrid({ year, month, value, min, today, focusISO, grabFocus, labelId, onPick, onKey }: GridProps) {
  const root = useRef<HTMLDivElement>(null)
  const rows = monthCells(year, month)

  // Solo el día con foco lógico entra en el orden de tabulación; el teclado lo mueve y aquí se le da el foco real.
  useEffect(() => {
    if (!grabFocus.current) return
    root.current?.querySelector<HTMLButtonElement>(`button[data-iso="${focusISO}"]`)?.focus({ preventScroll: true })
  }, [focusISO, grabFocus])

  return (
    <div className="dp-grid" role="grid" aria-labelledby={labelId} ref={root} onKeyDown={onKey}>
      <div className="dp-row dp-wk" role="row">
        {WEEK.map((w, i) => (
          <span key={w} role="columnheader" aria-label={WEEK_FULL[i]} title={WEEK_FULL[i]}>{w}</span>
        ))}
      </div>
      {rows.map((row, r) => (
        <div className="dp-row" role="row" key={r}>
          {row.map((c, i) => {
            if (!c) return <span key={i} role="gridcell" aria-hidden="true" />
            const off = c.iso < min
            const sel = c.iso === value
            const isToday = c.iso === today
            const label = `${cap(LONG.format(fromISO(c.iso)))}${isToday ? ', hoy' : ''}${off ? ', no disponible' : ''}`
            return (
              <span key={c.iso} role="gridcell" aria-selected={sel}>
                <button
                  type="button"
                  data-iso={c.iso}
                  className={`dp-day ${sel ? 'is-sel' : ''} ${isToday ? 'is-today' : ''} ${off ? 'is-off' : ''}`.trim()}
                  tabIndex={c.iso === focusISO && !off ? 0 : -1}
                  aria-disabled={off || undefined}
                  aria-label={label}
                  onClick={() => { if (!off) onPick(c.iso) }}
                >
                  {c.day}
                </button>
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function DatePicker({ id, value, min, onChange, describedBy }: Props) {
  const reduce = useReducedMotion()
  const uid = useId()
  const labelId = `${uid}-title`
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const grabFocus = useRef(false)
  const pop = useRef<HTMLDivElement>(null)

  const today = toISO(new Date())
  const start = valid(value) && value >= min ? value : min
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => ({ y: fromISO(start).getFullYear(), m: fromISO(start).getMonth() }))
  const [focusISO, setFocusISO] = useState(start)
  const [dir, setDir] = useState(1)

  const minIdx = fromISO(min).getFullYear() * 12 + fromISO(min).getMonth()
  const viewIdx = view.y * 12 + view.m

  const show = () => {
    const s = valid(value) && value >= min ? value : min
    setView({ y: fromISO(s).getFullYear(), m: fromISO(s).getMonth() })
    setFocusISO(s)
    grabFocus.current = true
    setOpen(true)
  }
  const close = (restore = true) => {
    setOpen(false)
    grabFocus.current = false
    if (restore) trigger.current?.focus()
  }

  // Cierre al hacer clic fuera.
  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => {
      if (root.current?.contains(e.target as Node)) return
      grabFocus.current = false
      setOpen(false)
    }
    document.addEventListener('pointerdown', down)
    return () => document.removeEventListener('pointerdown', down)
  }, [open])

  // Si el calendario se abre por debajo del borde visible, la página se desplaza hasta mostrarlo entero.
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => pop.current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' }))
    return () => cancelAnimationFrame(id)
  }, [open, reduce])

  // En móvil el calendario es una hoja inferior: se bloquea el desplazamiento del fondo mientras está abierto.
  useEffect(() => {
    if (!open || !matchMedia('(max-width: 640px)').matches) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const goMonth = (delta: number, byKeyboard = false) => {
    const next = viewIdx + delta
    if (next < minIdx) return
    grabFocus.current = byKeyboard
    setDir(delta >= 0 ? 1 : -1)
    setView({ y: Math.floor(next / 12), m: ((next % 12) + 12) % 12 })
    if (!byKeyboard) {
      // Con el ratón, el día enfocable pasa al mismo número (o al primero elegible) del mes mostrado.
      const base = toISO(new Date(Math.floor(next / 12), ((next % 12) + 12) % 12, 1))
      setFocusISO(base < min ? min : base)
    }
  }

  const moveFocus = (target: string) => {
    const t = target < min ? min : target
    const idx = fromISO(t).getFullYear() * 12 + fromISO(t).getMonth()
    grabFocus.current = true
    if (idx !== viewIdx) {
      setDir(idx > viewIdx ? 1 : -1)
      setView({ y: Math.floor(idx / 12), m: idx % 12 })
    }
    setFocusISO(t)
  }

  const onKey = (e: React.KeyboardEvent) => {
    const step: Record<string, () => string> = {
      ArrowLeft: () => addDays(focusISO, -1),
      ArrowRight: () => addDays(focusISO, 1),
      ArrowUp: () => addDays(focusISO, -7),
      ArrowDown: () => addDays(focusISO, 7),
      Home: () => addDays(focusISO, -weekday(focusISO)),
      End: () => addDays(focusISO, 6 - weekday(focusISO)),
      PageUp: () => addMonths(focusISO, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focusISO, e.shiftKey ? 12 : 1),
    }
    const fn = step[e.key]
    if (!fn) return
    e.preventDefault()
    moveFocus(fn())
  }

  const onDialogKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close() }
  }

  const pick = (iso: string) => { onChange(iso); close() }
  const title = `${cap(MONTH.format(new Date(view.y, view.m, 1)))} ${view.y}`
  const dur = reduce ? 0 : 0.28

  return (
    <div className="dp" ref={root} onBlur={(e) => { if (open && !root.current?.contains(e.relatedTarget as Node | null)) close(false) }}>
      <div className="dp-field">
        <button
          ref={trigger}
          id={id}
          type="button"
          className={`dp-trigger ${value ? 'has' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={describedBy}
          onClick={() => (open ? close(false) : show())}
        >
          <CalendarDays size={18} strokeWidth={1.6} aria-hidden="true" />
          <span>{value && valid(value) ? READABLE.format(fromISO(value)) : 'Elegir una fecha'}</span>
        </button>
        {value && (
          <button type="button" className="dp-clear" aria-label="Quitar la fecha elegida" onClick={() => { onChange(''); trigger.current?.focus() }}>
            <X size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="dp-scrim" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur }} onClick={() => close(false)} />
            <motion.div
              ref={pop}
              className="dp-pop"
              role="dialog"
              aria-label="Elegir la fecha de entrega"
              onKeyDown={onDialogKey}
              initial={{ opacity: 0, y: reduce ? 0 : 10, scale: reduce ? 1 : 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduce ? 0 : 6, transition: { duration: reduce ? 0 : 0.18 } }}
              transition={{ duration: reduce ? 0 : 0.34, ease: EASE }}
            >
              <header className="dp-head">
                <button type="button" className="dp-nav" aria-label="Mes anterior" disabled={viewIdx <= minIdx} onClick={() => goMonth(-1)}>
                  <ChevronLeft size={18} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <h3 id={labelId} aria-live="polite">{title}</h3>
                <button type="button" className="dp-nav" aria-label="Mes siguiente" onClick={() => goMonth(1)}>
                  <ChevronRight size={18} strokeWidth={1.7} aria-hidden="true" />
                </button>
              </header>

              <div className="dp-body">
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.div
                    key={`${view.y}-${view.m}`}
                    custom={dir}
                    variants={{
                      enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 26 }),
                      center: { opacity: 1, x: 0 },
                      exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -26 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: dur, ease: EASE }}
                  >
                    <MonthGrid year={view.y} month={view.m} value={value} min={min} today={today} focusISO={focusISO} grabFocus={grabFocus} labelId={labelId} onPick={pick} onKey={onKey} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="dp-foot">
                <p><span className="dp-legend"><i className="dp-key" aria-hidden="true" />Hoy</span> · Disponible desde el {READABLE.format(fromISO(min))}</p>
                <div>
                  {value && <button type="button" className="cz-link" onClick={() => { onChange(''); close() }}>Quitar fecha</button>}
                  <button type="button" className="cz-link strong dp-close" onClick={() => close()}>Cerrar</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
