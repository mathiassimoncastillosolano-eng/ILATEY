import type { ShapeId } from '../types/customization'
import { rng } from './prng'

/** Geometría pura de la vista previa (lienzo 400×500). Sin React: se puede probar de forma aislada. */

export interface Placed { x: number; y: number; r: number; rot: number; z: number }

export const MAX_RENDERED = 40
const CX = 200
const CY = 190
const MAX_Y = 282 // las cabezas de las flores no bajan del papel

/** Radio de cada flor según cuántas se dibujan. */
export const flowerRadius = (n: number) => Math.max(15, Math.min(52, 60 - 5.6 * Math.sqrt(Math.max(n, 1))))

interface RingOpts { spacing: number; sx: number; sy: number; rot?: number; dx?: number; scale?: number; jitter?: number }

function ringLayout(n: number, r: number, o: RingOpts, seed: number): Placed[] {
  const rand = rng(seed)
  const out: Placed[] = []
  const rot = ((o.rot ?? 0) * Math.PI) / 180
  const push = (px: number, py: number, ring: number) => {
    let x = px * o.sx
    let y = py * o.sy
    const cos = Math.cos(rot), sin = Math.sin(rot)
    const rx = x * cos - y * sin
    const ry = x * sin + y * cos
    x = CX + (o.dx ?? 0) + rx
    y = CY + ry + (px * px + py * py) * 0.0012 // la cúpula baja un poco en los bordes
    const j = (o.jitter ?? 0) * r
    out.push({
      x: x + (rand() - 0.5) * j,
      y: Math.min(MAX_Y, y + (rand() - 0.5) * j),
      r: r * (o.scale ?? 1),
      rot: (rand() - 0.5) * 24,
      z: -ring,
    })
  }
  if (n > 0) push(0, 0, 0)
  let ring = 1
  while (out.length < n) {
    const rad = ring * o.spacing
    const slots = Math.max(6, Math.floor((2 * Math.PI * rad) / o.spacing))
    const count = Math.min(slots, n - out.length)
    const start = rand() * Math.PI
    for (let i = 0; i < count; i++) {
      const a = start + (i * 2 * Math.PI) / count
      push(Math.cos(a) * rad, Math.sin(a) * rad, ring)
    }
    ring++
  }
  return out
}

function cascadeLayout(n: number, r: number, seed: number): Placed[] {
  const rand = rng(seed)
  const rr = r * 0.9
  const P0 = [262, 104], P1 = [160, 100], P2 = [112, 290]
  const rows = n > 14 ? [-1.1, 0, 1.1] : [-0.6, 0.6]
  const out: Placed[] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.35 : (i + 0.5) / n
    const u = 1 - t
    const x = u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0]
    const y = u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]
    const dx = 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0])
    const dy = 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1])
    const len = Math.hypot(dx, dy) || 1
    const off = rows[i % rows.length] * rr * (1 - 0.35 * t) + (rand() - 0.5) * rr * 0.3
    out.push({
      x: x + (-dy / len) * off,
      y: Math.min(MAX_Y + 20, y + (dx / len) * off),
      r: rr * (1.1 - 0.4 * t),
      rot: (rand() - 0.5) * 30,
      z: y + (i % rows.length) * 2 + rand(),
    })
  }
  return out
}

function wildLayout(n: number, r: number, seed: number): Placed[] {
  const rand = rng(seed)
  const out: Placed[] = []
  const minD = r * 1.05
  for (let i = 0; i < n; i++) {
    let best: Placed | null = null
    let bestScore = -1
    for (let k = 0; k < 40; k++) {
      const a = rand() * Math.PI * 2
      const d = Math.sqrt(rand())
      const x = CX + Math.cos(a) * d * 135
      const y = Math.min(MAX_Y, CY - 8 + Math.sin(a) * d * 100)
      const size = r * (0.78 + rand() * 0.42)
      const nearest = out.reduce((m, p) => Math.min(m, Math.hypot(p.x - x, p.y - y)), 1e9)
      if (nearest > minD) { best = { x, y, r: size, rot: (rand() - 0.5) * 50, z: y }; break }
      if (nearest > bestScore) { bestScore = nearest; best = { x, y, r: size, rot: (rand() - 0.5) * 50, z: y } }
    }
    if (best) out.push(best)
  }
  return out
}

/** Mantiene la composición dentro del lienzo: la reduce si no cabe y la desplaza si se sale (margen de 6 px). */
function fit(ps: Placed[]): Placed[] {
  if (ps.length === 0) return ps
  const M = 6
  const W = 400
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of ps) {
    minX = Math.min(minX, p.x - p.r); maxX = Math.max(maxX, p.x + p.r)
    minY = Math.min(minY, p.y - p.r * 1.3); maxY = Math.max(maxY, p.y)
  }
  const kx = Math.min(1, (W - 2 * M) / (maxX - minX))
  const ky = Math.min(1, (maxY - M) / (maxY - minY)) // solo se limita arriba; abajo está el papel
  const cx = (minX + maxX) / 2
  let out = kx === 1 && ky === 1 ? ps : ps.map((p) => ({ ...p, x: cx + (p.x - cx) * kx, y: maxY + (p.y - maxY) * ky }))
  const shiftL = Math.max(0, M - (cx + (minX - cx) * kx))
  const shiftR = Math.max(0, cx + (maxX - cx) * kx - (W - M))
  if (shiftL || shiftR) out = out.map((p) => ({ ...p, x: p.x + shiftL - shiftR }))
  return out
}

/** Posiciones de n flores para una forma. El primero es el más central (recibe el tipo principal). */
export function layoutFlowers(shape: ShapeId, n: number, r = flowerRadius(n)): Placed[] {
  return fit(rawLayout(shape, n, r))
}

function rawLayout(shape: ShapeId, n: number, r: number): Placed[] {
  const seed = 1000 + n * 7 + shape.length
  switch (shape) {
    case 'redondo': return ringLayout(n, r, { spacing: r * 1.7, sx: 1, sy: 0.86 }, seed)
    case 'compacto': return ringLayout(n, r * 1.08, { spacing: r * 1.32, sx: 1, sy: 0.88 }, seed)
    case 'abierto': return ringLayout(n, r * 0.96, { spacing: r * 2.25, sx: 1.05, sy: 0.84 }, seed)
    case 'asimetrico': return ringLayout(n, r, { spacing: r * 1.7, sx: 1.4, sy: 0.74, rot: -22, dx: 14 }, seed)
    case 'personalizado': return ringLayout(n, r, { spacing: r * 1.75, sx: 1, sy: 0.86, jitter: 0.7 }, seed)
    case 'cascada': return cascadeLayout(n, r, seed)
    case 'silvestre': return wildLayout(n, r, seed)
  }
}
