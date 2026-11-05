import type { FlowerType, Product } from '../data/products'

type PetalProps = { a: number; rx: number; ry: number; d: number; c: string }
const Petal = ({ a, rx, ry, d, c }: PetalProps) => (
  <ellipse cy={-d} rx={rx} ry={ry} fill={c} stroke="rgba(114,86,77,.3)" strokeWidth={1.4} transform={`rotate(${a})`} />
)

/** Tipos que el dibujo sabe representar: los del catálogo (sin «mixto») más los del configurador. */
export type GlyphType = Exclude<FlowerType, 'mixto'> | 'peonia' | 'complemento'

type GlyphProps = { t: GlyphType; r: number; c: string }

/** Dibujo de una flor centrado en (0,0). Compartido por el catálogo y la vista previa del configurador. */
export function FlowerGlyph({ t, r, c }: GlyphProps) {
  if (t === 'tulipan') {
    return (
      <>
        <Petal a={-22} rx={r * 0.42} ry={r * 0.8} d={r * 0.35} c={c} />
        <Petal a={22} rx={r * 0.42} ry={r * 0.8} d={r * 0.35} c={c} />
        <Petal a={0} rx={r * 0.46} ry={r * 0.9} d={r * 0.4} c={c} />
      </>
    )
  }
  if (t === 'rosa') {
    return (
      <>
        <circle r={r} fill={c} stroke="rgba(114,86,77,.35)" strokeWidth={1.4} />
        {[1, 2, 3, 4].map((i) => (
          <circle key={i} r={r * (1 - i * 0.2)} fill="none" stroke="rgba(114,86,77,.4)" strokeWidth={3.5 - i * 0.5} strokeDasharray={`${r * 1.4} ${r * 0.5}`} transform={`rotate(${i * 50})`} />
        ))}
      </>
    )
  }
  if (t === 'girasol') {
    return (
      <>
        {Array.from({ length: 14 }, (_, i) => (
          <Petal key={i} a={i * 25.7} rx={r * 0.17} ry={r * 0.5} d={r * 0.62} c={c} />
        ))}
        <circle r={r * 0.5} fill="#72564D" />
      </>
    )
  }
  if (t === 'peonia') {
    return (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <Petal key={`o${i}`} a={i * 45} rx={r * 0.4} ry={r * 0.46} d={r * 0.52} c={c} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <Petal key={`i${i}`} a={i * 60 + 20} rx={r * 0.3} ry={r * 0.36} d={r * 0.3} c={c} />
        ))}
        <circle r={r * 0.2} fill={c} stroke="rgba(114,86,77,.35)" strokeWidth={1.4} />
      </>
    )
  }
  if (t === 'complemento') {
    return (
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 72 - 144})`}>
            <line y2={-r * 0.9} stroke="#8A9677" strokeWidth={1.4} strokeLinecap="round" />
            {[0.55, 0.75, 0.95].map((k) => (
              <circle key={k} cy={-r * k} cx={(k - 0.75) * r * 0.35} r={r * 0.14} fill={c} stroke="rgba(114,86,77,.25)" strokeWidth={0.8} />
            ))}
          </g>
        ))}
      </>
    )
  }
  // margarita
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <Petal key={i} a={i * 36} rx={r * 0.2} ry={r * 0.46} d={r * 0.58} c={c} />
      ))}
      <circle r={r * 0.28} fill="#E0B04A" />
    </>
  )
}

type FlowerProps = { t: GlyphType; x: number; y: number; r: number; c: string }
export function Flower({ t, x, y, r, c }: FlowerProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="fx">
        <FlowerGlyph t={t} r={r} c={c} />
      </g>
    </g>
  )
}

const POS: [number, number, number][] = [[200, 150, 52], [135, 205, 46], [265, 205, 46], [168, 115, 42], [238, 118, 42], [200, 235, 44]]
const KINDS: GlyphType[] = ['tulipan', 'rosa', 'margarita']

type Props = { p: Pick<Product, 'type' | 'colors' | 'name'>; view?: number }

/** Ilustración referencial del ramo. view: 0 frontal · 1 lateral · 2 detalle · 3 envoltorio · 4 regalo */
export default function Bouquet({ p, view = 0 }: Props) {
  const n = view === 2 ? 3 : 6
  const wrap = view === 3 ? '#D9B7AC' : '#E8D4CC'
  const tf = view === 1 ? 'translate(60 0) rotate(14 200 450) scale(.92 1)' : view === 2 ? 'translate(-140 -50) scale(1.7)' : view === 3 ? 'translate(-40 -50) scale(1.2)' : undefined
  const pts = POS.slice(0, n)
  return (
    <svg viewBox="0 0 400 500" role="img" aria-label={`${p.name}, imagen referencial`} preserveAspectRatio="xMidYMid slice">
      <circle cx={200} cy={230} r={165} fill="#FDFBF8" opacity={0.5} />
      <g transform={tf}>
        {pts.map(([x, y, r], i) => (
          <path key={i} d={`M${x} ${y + r * 0.6} Q${(x + 200) / 2} 330 200 440`} stroke="#8A9677" strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        <ellipse cx={150} cy={330} rx={12} ry={32} fill="#8A9677" transform="rotate(-50 150 330)" />
        <ellipse cx={252} cy={335} rx={12} ry={32} fill="#8A9677" transform="rotate(50 252 335)" />
        {pts.map(([x, y, r], i) => (
          <Flower key={i} t={p.type === 'mixto' ? KINDS[i % 3] : p.type} x={x} y={y} r={r} c={p.type === 'girasol' ? '#E0B04A' : p.type === 'margarita' ? '#FDFBF8' : p.colors[i % p.colors.length]} />
        ))}
        <path d="M95 290 L305 290 L232 478 L168 478 Z" fill={wrap} stroke="#B98272" strokeWidth={1.5} />
        <path d="M200 290 L168 478 M200 290 L232 478" stroke="#B98272" opacity={0.5} />
        <rect x={176} y={326} width={48} height={14} rx={7} fill="#B98272" />
      </g>
      {view === 4 && (
        <>
          <rect x={40} y={410} width={320} height={80} rx={8} fill="#72564D" />
          <rect x={190} y={410} width={20} height={80} fill="#B98272" />
          <text x={93} y={175} fontSize={13} fontFamily="Georgia" fill="#72564D" textAnchor="middle" transform="rotate(-8 90 170)">para ti ♡</text>
        </>
      )}
    </svg>
  )
}
