import type { FlowerId } from '../../../types/customization'
import { FlowerGlyph } from '../../Bouquet'
import { flowerById } from '../../../data/customizationOptions'
import { tonesFor } from '../../../lib/previewModel'

/** Representación de una flor: fotografía real si el catálogo la trae; si no, el dibujo ilustrativo. */
export default function FlowerThumb({ id, size = 64 }: { id: FlowerId; size?: number }) {
  const opt = flowerById(id)
  if (opt.photo) return <img className="cz-thumb" src={opt.photo} alt="" width={size} height={size} loading="lazy" />
  return (
    <svg className="cz-thumb" viewBox="-62 -76 124 134" width={size} height={size} aria-hidden="true" focusable="false">
      <FlowerGlyph t={id} r={36} c={tonesFor(id, [])[0]} />
    </svg>
  )
}
