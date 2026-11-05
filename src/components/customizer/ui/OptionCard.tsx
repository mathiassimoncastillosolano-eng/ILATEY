import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

type Props = {
  type: 'radio' | 'checkbox'
  name: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
  className?: string
  children: ReactNode
}

/** Opción seleccionable con entrada nativa (teclado, lector de pantalla y grupos de radio gratis). */
export default function OptionCard({ type, name, checked, disabled, onChange, className = '', children }: Props) {
  return (
    <label className={`cz-opt ${checked ? 'is-on' : ''} ${disabled ? 'is-off' : ''} ${className}`.trim()}>
      <input className="cz-in" type={type} name={name} checked={checked} disabled={disabled} onChange={onChange} />
      {children}
      <span className="cz-tick" aria-hidden="true"><Check size={13} strokeWidth={2.2} /></span>
    </label>
  )
}
