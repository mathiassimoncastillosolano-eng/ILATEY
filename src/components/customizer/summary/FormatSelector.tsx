import { FileText, FileType } from 'lucide-react'
import type { RequestFormat } from '../../../types/customization'
import LogoSymbol from '../../branding/LogoSymbol'
import OptionCard from '../ui/OptionCard'

/** Miniatura del documento: identifica el formato antes de elegirlo. */
function Thumb({ format }: { format: RequestFormat }) {
  return (
    <span className={`cz-fmt-art cz-fmt-art-${format}`} aria-hidden="true">
      <span className="cz-fmt-sheet">
        {format === 'pdf' ? (
          <>
            <LogoSymbol size={16} strokeWidth={3.2} />
            <i style={{ width: '70%' }} /><i style={{ width: '52%' }} /><i style={{ width: '62%' }} />
            <b />
          </>
        ) : (
          <>
            <i style={{ width: '82%' }} /><i style={{ width: '58%' }} /><i style={{ width: '74%' }} /><i style={{ width: '40%' }} /><i style={{ width: '66%' }} />
          </>
        )}
      </span>
      <span className="cz-fmt-badge">
        {format === 'pdf' ? <FileText size={13} strokeWidth={1.8} /> : <FileType size={13} strokeWidth={1.8} />}
        {format === 'pdf' ? 'PDF' : 'TXT'}
      </span>
    </span>
  )
}

type Props = { value: RequestFormat | null; onChange: (f: RequestFormat) => void; disabled?: boolean }

const OPTIONS: { id: RequestFormat; name: string; desc: string }[] = [
  { id: 'pdf', name: 'Documento PDF', desc: 'Una presentación elegante y detallada de tu solicitud' },
  { id: 'txt', name: 'Archivo TXT', desc: 'Un resumen ligero con todos los detalles de tu ramo' },
]

/** Elección excluyente entre PDF y TXT. Son radios reales (teclado y lectores de pantalla) con aspecto propio. */
export default function FormatSelector({ value, onChange, disabled }: Props) {
  return (
    <fieldset className="cz-fs cz-fmt-group" disabled={disabled}>
      <legend className="sr-only">Formato de tu solicitud</legend>
      <div className="cz-fmt-grid">
        {OPTIONS.map((o) => (
          <OptionCard key={o.id} type="radio" name="formato-solicitud" checked={value === o.id} onChange={() => onChange(o.id)} className="cz-fmt">
            <Thumb format={o.id} />
            <span className="cz-ot"><strong>{o.name}</strong><span>{o.desc}</span></span>
          </OptionCard>
        ))}
      </div>
    </fieldset>
  )
}
