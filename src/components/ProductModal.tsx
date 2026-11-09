import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Flower2, Heart, X } from 'lucide-react'
import { EASE, GALLERY_VIEWS, MOODS, PHRASES, products } from '../data/products'
import type { Product } from '../data/products'
import { useStore } from '../store/useStore'
import { useOpenCustomizer } from '../lib/useCustomizer'
import { canChooseDirectly } from '../lib/productSeed'
import Bouquet from './Bouquet'

function FavButton({ fav, onClick }: { fav: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`pm-fav ${fav ? 'on' : ''}`} aria-pressed={fav} onClick={onClick}>
      <Heart size={16} strokeWidth={1.7} aria-hidden="true" /> {fav ? 'En favoritos' : 'Guardar'}
    </button>
  )
}

function Modal({ p }: { p: Product }) {
  const { close, favorites, toggleFav, open } = useStore()
  const customizer = useOpenCustomizer()
  const [vw, setVw] = useState(0)
  const [ph, setPh] = useState<number | null>(null)
  const ps = useRef<HTMLDivElement>(null)
  const fav = favorites.includes(p.id)
  const n = GALLERY_VIEWS.length
  const direct = canChooseDirectly(p)
  const message = ph === null ? undefined : PHRASES[ph]

  useEffect(() => {
    setVw(0); setPh(null)
    ps.current?.scrollTo({ top: 0 })
  }, [p.id])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setVw((v) => (v + 1) % n)
      if (e.key === 'ArrowLeft') setVw((v) => (v + n - 1) % n)
    }
    addEventListener('keydown', key)
    return () => { document.body.style.overflow = ''; removeEventListener('keydown', key) }
  }, [close, n])

  const shared = (x: Product) => x.moods.filter((m) => p.moods.includes(m)).length
  const related = products.filter((x) => x.id !== p.id).sort((a, b) => shared(b) - shared(a)).slice(0, 3)
  const occasions = MOODS.filter((m) => p.moods.includes(m.id))

  return (
    <motion.div id="md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={close}>
      <motion.div className="pn" initial={{ y: 40, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 30, scale: 0.98, opacity: 0 }} transition={{ duration: 0.55, ease: EASE }} onClick={(e) => e.stopPropagation()}>
        <button className="ic x" aria-label="Cerrar" onClick={close}><X size={18} strokeWidth={1.6} /></button>
        <div className="ps" ref={ps}>
          <div className="pg">
            <div className="pl">
              <div className="gm">
                <AnimatePresence mode="wait">
                  <motion.div key={vw} className="gi" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                    <Bouquet p={p} view={vw} />
                  </motion.div>
                </AnimatePresence>
                <button className="ic ga l" aria-label="Anterior" onClick={() => setVw((vw + n - 1) % n)}><ChevronLeft size={18} strokeWidth={1.6} /></button>
                <button className="ic ga r" aria-label="Siguiente" onClick={() => setVw((vw + 1) % n)}><ChevronRight size={18} strokeWidth={1.6} /></button>
                <span className="tg">{GALLERY_VIEWS[vw]}</span>
              </div>
              <div className="th">
                {GALLERY_VIEWS.map((v, j) => (
                  <button key={v} className={j === vw ? 'on' : ''} aria-label={v} onClick={() => setVw(j)}><Bouquet p={p} view={j} /></button>
                ))}
              </div>
              <p className="nt">Imágenes referenciales; se sustituirán por fotografías reales.</p>
            </div>
            <div className="pt">
              <span className="eb">{p.cat}{p.edition ? ` · ${p.edition}` : ''}</span>
              <h2>{p.name}</h2>
              <p style={{ color: 'var(--mut)' }}>{p.emotional}</p>
              <div className="pr">S/ {p.price} <small style={{ font: '12px var(--sans)', color: 'var(--mut)' }}>precio referencial</small></div>
              <h5>Colores</h5>
              <div className="sw" style={{ margin: 0 }}>{p.colors.map((c) => <i key={c} style={{ background: c }} />)}</div>
              <h5>Detalles</h5>
              <ul>
                {[['Flores', p.flowers ? `${p.flowers} flores` : 'A tu elección'], ['Elaboración', p.time], ...p.features.map((f) => ['Incluye', f])].map(([a, b]) => (
                  <li key={a + b}><span>{a}</span>{b}</li>
                ))}
              </ul>
              <h5>Una frase para tu tarjeta</h5>
              <div className="ph">
                {PHRASES.map((f, i) => (
                  <button key={f} className={i === ph ? 'on' : ''} aria-pressed={i === ph} onClick={() => setPh(i === ph ? null : i)}>“{f}”</button>
                ))}
              </div>
              <p className="nt" style={{ marginTop: 0, marginBottom: 14 }}>
                {ph === null ? 'Elige una y la usaremos como dedicatoria al personalizar.' : 'Se usará como dedicatoria al personalizar tu ramo.'}
                {p.flowers === 0 && ' El configurador calcula tu precio estimado según lo que elijas.'}
              </p>
              <div className="pm-actions">
                {direct ? (
                  <>
                    <button type="button" className="btn pm-main" onClick={() => { close(); customizer.chooseProduct(p, message) }}>
                      <Flower2 size={18} strokeWidth={1.7} aria-hidden="true" />
                      <span>Quiero este ramo</span>
                      <ArrowRight size={18} strokeWidth={1.7} className="pm-go" aria-hidden="true" />
                    </button>
                    <div className="pm-sub">
                      <button type="button" className="btn ghost pm-second" onClick={() => { close(); customizer.fromProduct(p, message) }}>Personalizar este ramo</button>
                      <FavButton fav={fav} onClick={() => toggleFav(p.id)} />
                    </div>
                    <p className="nt pm-hint">Con «Quiero este ramo» conservas sus flores tal como están y eliges envoltorio, tarjeta y fecha.</p>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn pm-main" onClick={() => { close(); customizer.fromProduct(p, message) }}>
                      <Flower2 size={18} strokeWidth={1.7} aria-hidden="true" />
                      <span>Crear mi ramo</span>
                      <ArrowRight size={18} strokeWidth={1.7} className="pm-go" aria-hidden="true" />
                    </button>
                    <div className="pm-sub"><FavButton fav={fav} onClick={() => toggleFav(p.id)} /></div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mn">
            <span className="eb">El significado detrás del ramo</span>
            <h2>{p.emotional}</h2>
            <p>{p.meaning}</p>
          </div>
          <div className="w2">
            <h3 className="h3">¿Para qué ocasión es perfecto?</h3>
            <div className="oo">
              {occasions.map((m) => (
                <div className="o2" key={m.id}><i>{m.glyph}</i><h4>{m.name}</h4><p>{m.message}</p></div>
              ))}
            </div>
          </div>
          <div className="w2">
            <h3 className="h3">Otros ramos que podrían gustarte</h3>
            <div className="rl">
              {related.map((r) => (
                <button key={r.id} onClick={() => open(r)}>
                  <div><Bouquet p={r} /></div>
                  <span><b>{r.name}</b><small>S/ {r.price} · ref.</small></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ProductModal() {
  const selected = useStore((s) => s.selected)
  return <AnimatePresence>{selected && <Modal key="modal" p={selected} />}</AnimatePresence>
}
