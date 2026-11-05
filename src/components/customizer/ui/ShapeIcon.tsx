import type { ShapeId } from '../../../types/customization'
import { layoutFlowers } from '../../../lib/bouquetLayout'

/** Icono de cada forma, dibujado con el mismo cálculo de posiciones que usa la vista previa. */
export default function ShapeIcon({ shape }: { shape: ShapeId }) {
  const pts = layoutFlowers(shape, 11, 24)
  return (
    <svg className="cz-shape" viewBox="40 40 320 270" aria-hidden="true" focusable="false">
      <g fill="#E8D4CC" stroke="#B98272" strokeWidth={4}>
        {[...pts].sort((a, b) => a.z - b.z).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r * 0.92} />)}
      </g>
      <path d="M130 296 L270 296 L224 340 L176 340 Z" fill="#D9B7AC" stroke="#B98272" strokeWidth={4} />
    </svg>
  )
}
