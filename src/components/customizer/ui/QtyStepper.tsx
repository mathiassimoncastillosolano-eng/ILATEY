import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

type Props = { value: number; min: number; max: number; label: string; onChange: (n: number) => void; id?: string }

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Control de cantidad: botones grandes y campo numérico. Mientras se escribe se respeta el texto; al salir se normaliza. */
export default function QtyStepper({ value, min, max, label, onChange, id }: Props) {
  const [text, setText] = useState('')
  const [editing, setEditing] = useState(false)
  const shown = editing ? text : String(value)

  return (
    <div className="cz-qty" role="group" aria-label={label}>
      <button type="button" className="cz-qb" aria-label={`Reducir ${label}`} disabled={value <= min} onClick={() => onChange(clamp(value - 1, min, max))}>
        <Minus size={16} strokeWidth={1.8} />
      </button>
      <input
        id={id}
        className="cz-qi"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={label}
        value={shown}
        onFocus={(e) => { setText(String(value)); setEditing(true); e.currentTarget.select() }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 3)
          setText(raw)
          if (raw !== '') onChange(clamp(parseInt(raw, 10), min, max))
        }}
        onBlur={() => setEditing(false)}
      />
      <button type="button" className="cz-qb" aria-label={`Aumentar ${label}`} disabled={value >= max} onClick={() => onChange(clamp(value + 1, min, max))}>
        <Plus size={16} strokeWidth={1.8} />
      </button>
    </div>
  )
}
