import { useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import { products } from '../data/products'
import type { Product } from '../data/products'
import { useStore } from '../store/useStore'
import Bouquet from './Bouquet'

function Slide({ p, moved }: { p: Product; moved: React.RefObject<boolean> }) {
  const { open, toggleFav, favorites } = useStore()
  const fav = favorites.includes(p.id)
  return (
    <article className="cc" onClick={() => { if (!moved.current) open(p) }}>
      <div className="cv">
        <Bouquet p={p} />
        <span className="tg">{p.edition ?? p.cat}</span>
        <button className={`hr ${fav ? 'on' : ''}`} aria-label="Favorito" onClick={(e) => { e.stopPropagation(); toggleFav(p.id) }}>
          <Heart size={18} strokeWidth={1.6} />
        </button>
      </div>
      <div className="cb">
        <span className="eb" style={{ fontSize: 10 }}>{p.cat}</span>
        <h3>{p.name}</h3>
        <p>{p.emotional}</p>
        <b>S/ {p.price} · ref.</b>
      </div>
    </article>
  )
}

/** Carrusel infinito y continuo: fluye solo, se arrastra con mouse o dedo y mantiene el impulso al soltar. */
export default function Carousel() {
  const cr = useRef<HTMLDivElement>(null)
  const trk = useRef<HTMLDivElement>(null)
  const moved = useRef(false)

  useEffect(() => {
    const c = cr.current, t = trk.current
    if (!c || !t) return
    const N = products.length
    const base = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.055 // px por ms
    let pos = 0, ext = 0, hs = 1, hv = false, W = 0, cw = 0, act = -1, last = 0, vis = true, raf = 0
    let lefts: number[] = []
    const d = { on: false, x: 0, px: 0, t: 0, v: 0 }
    const cards = () => Array.from(t.children) as HTMLElement[]

    const measure = () => {
      const cs = cards()
      if (!cs[0] || !c.clientWidth) return
      cw = cs[0].offsetWidth
      W = cs[N].offsetLeft - cs[0].offsetLeft
      lefts = cs.map((x) => x.offsetLeft)
    }
    const paint = () => {
      const m = c.clientWidth / 2, x = m - cw / 2 - (W + pos)
      t.style.transform = `translate3d(${x}px,0,0)`
      let b = 0, bd = 1e9
      for (let i = 0; i < lefts.length; i++) {
        const dd = Math.abs(lefts[i] + x + cw / 2 - m)
        if (dd < bd) { bd = dd; b = i }
      }
      if (b !== act) {
        const cs = cards()
        if (act >= 0) cs[act].classList.remove('act')
        cs[b].classList.add('act')
        act = b
      }
    }
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      if (!W) measure()
      if (W && vis && !document.hidden && !useStore.getState().selected) {
        hs += ((hv ? 0.3 : 1) - hs) * Math.min(1, dt / 200)
        if (!d.on) {
          pos += (base * hs + ext) * dt
          ext *= Math.pow(0.94, dt / 16)
          if (Math.abs(ext) < 0.001) ext = 0
        }
        pos = ((pos % W) + W) % W
        paint()
      }
      raf = requestAnimationFrame(tick)
    }

    const down = (e: PointerEvent) => {
      if (e.button > 0) return
      d.on = true; moved.current = false
      d.x = d.px = e.clientX; d.t = performance.now(); d.v = 0; ext = 0
      c.classList.add('dg')
    }
    const move = (e: PointerEvent) => {
      if (!d.on) return
      const dx = e.clientX - d.px
      d.px = e.clientX
      if (Math.abs(e.clientX - d.x) > 5) moved.current = true
      pos -= dx
      const n = performance.now(), dt = Math.max(n - d.t, 1)
      d.t = n
      d.v = 0.75 * d.v + 0.25 * (-dx / dt)
    }
    const up = () => {
      if (!d.on) return
      d.on = false
      c.classList.remove('dg')
      ext = Math.max(-2, Math.min(2, d.v))
      setTimeout(() => { moved.current = false }, 60)
    }
    const enter = () => { hv = true }
    const leave = () => { hv = false }
    const noDrag = (e: Event) => e.preventDefault()

    c.addEventListener('pointerdown', down)
    c.addEventListener('dragstart', noDrag)
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
    addEventListener('pointercancel', up)
    addEventListener('resize', measure)
    if (matchMedia('(hover:hover)').matches) { c.addEventListener('mouseenter', enter); c.addEventListener('mouseleave', leave) }
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting })
    io.observe(c)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      c.removeEventListener('pointerdown', down)
      c.removeEventListener('dragstart', noDrag)
      c.removeEventListener('mouseenter', enter)
      c.removeEventListener('mouseleave', leave)
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
      removeEventListener('pointercancel', up)
      removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div className="cr" ref={cr}>
      <div className="trk" ref={trk}>
        {[0, 1, 2].flatMap((k) => products.map((p) => <Slide key={`${k}-${p.id}`} p={p} moved={moved} />))}
      </div>
    </div>
  )
}
