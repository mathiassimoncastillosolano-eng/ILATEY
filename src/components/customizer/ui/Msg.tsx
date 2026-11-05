import type { ReactNode } from 'react'

/** Mensaje de validación o ayuda. «error» se anuncia a lectores de pantalla. */
export default function Msg({ kind = 'info', children }: { kind?: 'info' | 'error' | 'warn'; children: ReactNode }) {
  return <p className={`cz-msg cz-msg-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</p>
}
