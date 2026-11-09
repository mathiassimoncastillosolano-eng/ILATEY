import { useId, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { BouquetConfig, PaperId, Wrapping } from '../../types/customization'
import { PAPER_COLORS, RIBBON_COLORS, shapeById } from '../../data/customizationOptions'
import { MAX_RENDERED } from '../../lib/bouquetLayout'
import { buildPreviewModel } from '../../lib/previewModel'
import { FlowerGlyph } from '../Bouquet'

/** Mezcla dos colores #RRGGBB (t = 0 → a, t = 1 → b). */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [r1, g1, b1] = p(a)
  const [r2, g2, b2] = p(b)
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0')
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`
}

const INK = '#72564D'
const SAGE = '#8A9677'
const CONE = 'M88 292 L312 292 L236 480 L164 480 Z'

const LEAVES: [number, number, number][] = [[128, 268, -58], [272, 268, 58], [150, 242, -32], [250, 242, 32], [108, 288, -75], [292, 288, 75]]
const WILD_LEAVES: [number, number, number][] = [[96, 170, -72], [304, 176, 72], [168, 92, -22], [240, 98, 26], [78, 230, -85], [322, 236, 85]]

function Cone({ k, paper, color, uid }: { k: number; paper: PaperId; color: string; uid: string }) {
  const fill = mix(color, '#FFFFFF', k * 0.1)
  const rot = k === 0 ? 0 : k % 2 ? -4 : 4
  const grow = 1 + k * 0.045
  return (
    <g transform={`rotate(${rot} 200 480) translate(200 480) scale(${grow}) translate(-200 -480)`}>
      <path d={CONE} fill={fill} fillOpacity={paper === 'seda' ? 0.9 : 1} stroke="#B98272" strokeOpacity={0.55} strokeWidth={1.3} />
      {paper === 'texturizado' && <path d={CONE} fill={`url(#${uid}-dots)`} />}
      {paper === 'kraft' && (
        <g stroke={INK} strokeOpacity={0.16} strokeWidth={1} strokeLinecap="round">
          <path d="M120 310 l8 22 M158 304 l5 30 M236 306 l-6 28 M276 312 l-9 24 M146 392 l8 30 M246 396 l-7 28" />
        </g>
      )}
      {paper === 'seda' && (
        <g fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={1.6} strokeLinecap="round">
          <path d="M124 298 C140 340 160 400 186 470" />
          <path d="M276 298 C262 340 242 400 214 470" />
          <path d="M200 296 C196 350 200 410 200 474" strokeOpacity={0.3} />
        </g>
      )}
      <path d="M200 292 L184 480 M200 292 L216 480" stroke="#B98272" strokeOpacity={0.35} fill="none" />
    </g>
  )
}

function Bow({ w, color }: { w: Wrapping; color: string }) {
  if (w.finish === 'ninguno') return null
  const edge = mix(color, INK, 0.3)
  const big = w.finish === 'mono'
  const rx = big ? 30 : 18
  const ry = big ? 15 : 9
  const cx = big ? 27 : 17
  return (
    <g transform="translate(200 344)" stroke={edge} strokeWidth={1.2} fill={color}>
      <path d={big ? 'M-4 6 Q-16 36 -30 58' : 'M-3 6 Q-10 22 -17 32'} fill="none" strokeWidth={big ? 6 : 4} stroke={color} strokeLinecap="round" />
      <path d={big ? 'M4 6 Q16 36 30 58' : 'M3 6 Q10 22 17 32'} fill="none" strokeWidth={big ? 6 : 4} stroke={color} strokeLinecap="round" />
      <ellipse cx={-cx} cy={-3} rx={rx} ry={ry} transform={`rotate(-18 ${-cx} -3)`} />
      <ellipse cx={cx} cy={-3} rx={rx} ry={ry} transform={`rotate(18 ${cx} -3)`} />
      <circle r={big ? 8 : 6} />
    </g>
  )
}

function Ribbon({ w, color }: { w: Wrapping; color: string }) {
  const edge = mix(color, INK, 0.3)
  return (
    <g>
      <rect x={106} y={336} width={188} height={16} rx={8} fill={color} fillOpacity={w.ribbon === 'organza' ? 0.55 : 1} stroke={edge} strokeOpacity={0.6} strokeWidth={1} />
      {w.ribbon === 'saten' && <rect x={112} y={339} width={176} height={3} rx={1.5} fill="#fff" fillOpacity={0.4} />}
      {w.ribbon === 'algodon' && <line x1={112} y1={344} x2={288} y2={344} stroke="#fff" strokeOpacity={0.6} strokeWidth={1.4} strokeDasharray="5 4" />}
    </g>
  )
}

type SvgProps = { config: BouquetConfig; /** Sin animaciones ni transformaciones CSS: el dibujo final, apto para convertir a imagen. */ still?: boolean }

/**
 * El dibujo del ramo (SVG por capas: tallos → flores → papel → cinta → lazo → caja).
 * Se usa en la vista previa animada y, con `still`, como imagen del PDF de la solicitud.
 */
export function BouquetSvg({ config, still = false }: SvgProps) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const model = useMemo(() => buildPreviewModel(config), [config])
  const w = config.wrapping
  const paperHex = PAPER_COLORS.find((p) => p.id === w.paperColor)?.hex ?? '#F1E8D8'
  const ribbonHex = RIBBON_COLORS.find((r) => r.id === w.ribbonColor)?.hex ?? '#B98272'
  const shape = config.shape ?? 'redondo'
  const leaves = shape === 'silvestre' ? [...LEAVES, ...WILD_LEAVES] : LEAVES
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 120, damping: 17, mass: 0.8 }
  const label = model.total === 0
    ? 'Vista ilustrativa de tu ramo: todavía sin flores'
    : `Vista ilustrativa de tu ramo: ${model.total} flores, forma ${shapeById(shape).name.toLowerCase()}`

  return (
    <svg viewBox="0 0 400 500" role="img" aria-label={label} focusable="false">
      <defs>
        <pattern id={`${uid}-dots`} width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1" fill={INK} fillOpacity={0.22} />
        </pattern>
      </defs>
      <circle cx={200} cy={220} r={170} fill="#FDFBF8" opacity={0.55} />
      <ellipse cx={200} cy={488} rx={96} ry={7} fill={INK} opacity={0.12} />

      {/* Tallos y hojas */}
      <g>
        {leaves.map(([x, y, a], i) => (
          <ellipse key={i} cx={x} cy={y} rx={11} ry={30} fill={SAGE} opacity={0.9} transform={`rotate(${a} ${x} ${y})`} />
        ))}
        {model.flowers.map((f) => (
          <path key={f.key} d={`M${f.x.toFixed(1)} ${(f.y + f.r * 0.5).toFixed(1)} Q${((f.x + 200) / 2).toFixed(1)} 340 200 450`} stroke={SAGE} strokeWidth={4} fill="none" strokeLinecap="round" />
        ))}
      </g>

      {/* Marcadores cuando aún no hay flores */}
      {model.total === 0 && (
        <g fill="none" stroke="#B98272" strokeOpacity={0.4} strokeDasharray="3 5" strokeWidth={1.4}>
          {model.ghost.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={g.r} />)}
        </g>
      )}

      {/* Flores */}
      {still ? (
        model.flowers.map((f) => (
          <g key={f.key} transform={`translate(${f.x} ${f.y}) rotate(${f.rot})`}>
            <FlowerGlyph t={f.id} r={f.r} c={f.fill} />
          </g>
        ))
      ) : (
        <AnimatePresence initial={false}>
          {model.flowers.map((f) => (
            <motion.g
              key={f.key}
              initial={{ scale: 0, opacity: 0, x: f.x, y: f.y, rotate: f.rot }}
              animate={{ scale: 1, opacity: 1, x: f.x, y: f.y, rotate: f.rot }}
              exit={{ scale: 0, opacity: 0, transition: { duration: reduce ? 0 : 0.2 } }}
              transition={spring}
            >
              <FlowerGlyph t={f.id} r={f.r} c={f.fill} />
            </motion.g>
          ))}
        </AnimatePresence>
      )}

      {/* Envoltorio */}
      {Array.from({ length: w.layers }, (_, i) => w.layers - 1 - i).map((k) => (
        <Cone key={k} k={k} paper={w.paper} color={paperHex} uid={uid} />
      ))}
      <Ribbon w={w} color={ribbonHex} />
      <Bow w={w} color={ribbonHex} />

      {w.box && (
        <g>
          <rect x={92} y={376} width={216} height={110} rx={10} fill={mix(paperHex, INK, 0.38)} stroke={INK} strokeOpacity={0.3} />
          <rect x={86} y={366} width={228} height={24} rx={8} fill={mix(paperHex, INK, 0.2)} stroke={INK} strokeOpacity={0.3} />
          <rect x={190} y={366} width={20} height={120} fill={ribbonHex} fillOpacity={0.9} />
        </g>
      )}
    </svg>
  )
}

type Props = { config: BouquetConfig; className?: string; caption?: boolean }

/**
 * Vista previa ilustrativa del ramo. Responde a flores, cantidades, forma, colores y envoltorio.
 * NO es fotorrealista y se rotula así.
 */
export default function BouquetPreview({ config, className = '', caption = true }: Props) {
  const model = useMemo(() => buildPreviewModel(config), [config])
  return (
    <figure className={`cz-pv ${className}`.trim()}>
      <BouquetSvg config={config} />
      {caption && (
        <figcaption>
          <strong>Vista ilustrativa</strong> · no es una fotografía de tu ramo final.
          {model.truncated && <> Se dibujan {MAX_RENDERED} de tus {model.total} flores.</>}
        </figcaption>
      )}
    </figure>
  )
}
