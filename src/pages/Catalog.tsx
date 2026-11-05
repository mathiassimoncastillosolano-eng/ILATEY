import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Heart, Search, SlidersHorizontal, X } from 'lucide-react'
import { EASE, MOODS, products } from '../data/products'
import { useStore } from '../store/useStore'
import Bouquet from '../components/Bouquet'
import { useOpenCustomizer } from '../lib/useCustomizer'
import { usePageTitle } from '../lib/usePageTitle'

const cats = [...new Set(products.map((p) => p.cat))]
const variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.06, ease: EASE } }),
  gone: { opacity: 0, scale: 0.96, transition: { duration: 0.25 } },
}

export default function Catalog() {
  usePageTitle('Catálogo')
  const customizer = useOpenCustomizer()
  const { cat, mood, q, onlyFav, favorites, setCat, setMood, setQ, setOnlyFav, reset, open, toggleFav } = useStore()
  const [panel, setPanel] = useState(false)
  const active = (cat !== 'Todos' ? 1 : 0) + (mood !== 'Todos' ? 1 : 0) + (onlyFav ? 1 : 0)

  const list = useMemo(() => products.filter((p) =>
    (cat === 'Todos' || p.cat === cat) &&
    (mood === 'Todos' || p.moods.includes(mood)) &&
    (!onlyFav || favorites.includes(p.id)) &&
    (!q || `${p.name} ${p.emotional} ${p.cat}`.toLowerCase().includes(q.toLowerCase())),
  ), [cat, mood, q, onlyFav, favorites])

  const moodName = MOODS.find((m) => m.id === mood)?.name

  return (
    <section style={{ paddingTop: 0 }}>
      <div className="w">
        <div className="ph2">
          <span className="eb">El universo ILATEY</span>
          <h1>Flores para cada <em>forma de sentir.</em></h1>
          <p>Cada ramo tiene una historia. Busca, filtra y encuentra el detalle perfecto.</p>
        </div>

        <div className="tb">
          <label className="sr">
            <Search size={18} strokeWidth={1.6} />
            <input value={q} onChange={(e) => setQ(e.target.value.trim() === '' ? '' : e.target.value)} placeholder="Buscar un ramo…" aria-label="Buscar" />
          </label>
          <button className={`pill ${panel ? 'on' : ''}`} onClick={() => setPanel(!panel)}>
            <SlidersHorizontal size={18} strokeWidth={1.6} />
            Filtros
            {active > 0 && <b>{active}</b>}
            <ChevronDown className="cv2" size={18} strokeWidth={1.6} />
          </button>
        </div>

        <div className={`fp ${panel ? 'on' : ''}`}>
          <div>
            <div className="fi">
              <div>
                <h4>Tipo de flor</h4>
                <div className="fl">
                  <button className={`ch ${cat === 'Todos' ? 'on' : ''}`} onClick={() => setCat('Todos')}>Todas<small>{products.length}</small></button>
                  {cats.map((c) => (
                    <button key={c} className={`ch ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}<small>{products.filter((p) => p.cat === c).length}</small></button>
                  ))}
                </div>
              </div>
              <div>
                <h4>Sentimiento</h4>
                <div className="fl">
                  <button className={`ch ${mood === 'Todos' ? 'on' : ''}`} onClick={() => setMood('Todos')}>Todos</button>
                  {MOODS.map((m) => (
                    <button key={m.id} className={`ch ${mood === m.id ? 'on' : ''}`} onClick={() => setMood(m.id)}>{m.name}</button>
                  ))}
                  <button className={`ch ${onlyFav ? 'on' : ''}`} onClick={() => setOnlyFav(!onlyFav)}>♡ Solo mis favoritos</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ac">
          {cat !== 'Todos' && <button onClick={() => setCat('Todos')}>{cat}<X /></button>}
          {mood !== 'Todos' && <button onClick={() => setMood('Todos')}>{moodName}<X /></button>}
          {onlyFav && <button onClick={() => setOnlyFav(false)}>Favoritos<X /></button>}
          {q && <button onClick={() => setQ('')}>“{q}”<X /></button>}
          {(active > 0 || q) && <button className="cl" onClick={reset}>Limpiar todo</button>}
        </div>
        <p className="mt-1.5 text-[13px]" style={{ color: 'var(--mut)' }}>{list.length} {list.length === 1 ? 'ramo encontrado' : 'ramos encontrados'}</p>

        <div className="gr">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.article key={p.id} layout className="cd" custom={i} variants={variants} initial="hidden" animate="show" exit="gone" whileHover={{ y: -8 }} onClick={() => open(p)}>
                <div className="cv">
                  <Bouquet p={p} />
                  <span className="tg">{p.edition ?? p.cat}</span>
                  <button className={`hr ${favorites.includes(p.id) ? 'on' : ''}`} aria-label="Favorito" onClick={(e) => { e.stopPropagation(); toggleFav(p.id) }}>
                    <Heart size={18} strokeWidth={1.6} />
                  </button>
                </div>
                <div className="cb">
                  <h3>{p.name}</h3>
                  <p>{p.emotional}</p>
                  <b>S/ {p.price} · ref.</b>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          {list.length === 0 && (
            <div className="emp">
              <h3 style={{ fontSize: 28 }}>{onlyFav && favorites.length === 0 ? 'Aún no tienes favoritos' : 'No encontramos ramos con esta combinación'}</h3>
              <p>Prueba con otro sentimiento o flor, o crea el ramo a tu manera.</p>
              <div className="flex flex-wrap justify-center gap-2.5 mt-4">
                <button className="btn" onClick={reset}>Limpiar filtros</button>
                <button className="btn ghost" onClick={customizer.create}>Crear mi ramo</button>
              </div>
            </div>
          )}
          {list.length > 0 && !onlyFav && (
            <aside className="cz-band">
              <div>
                <span className="eb">Hecho a tu medida</span>
                <h3>¿No es exactamente lo que imaginas? <em>Crea el tuyo.</em></h3>
                <p>Elige flores, colores, envoltorio y dedicatoria, y mira cómo toma forma.</p>
              </div>
              <button className="btn" onClick={customizer.create}>Crear mi ramo</button>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}
