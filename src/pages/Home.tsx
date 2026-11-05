import { useNavigate } from 'react-router-dom'
import { MOODS, products } from '../data/products'
import { useStore } from '../store/useStore'
import { useGoSection } from '../lib/useGoSection'
import Bouquet from '../components/Bouquet'
import Carousel from '../components/Carousel'
import Reveal from '../components/Reveal'

const RIBBON = 'Flores que no necesitan agua para seguir contando una historia'
const RIBBON2 = 'Pequeños detalles, grandes sentimientos'

export default function Home() {
  const navigate = useNavigate()
  const go = useGoSection()
  const reset = useStore((s) => s.reset)
  const ribbon = [RIBBON, RIBBON2, RIBBON, RIBBON2]

  return (
    <>
      <section className="hero">
        <div className="w hg">
          <div>
            <Reveal as="span" className="eb">Flores artesanales · Hechas con amor</Reveal>
            <Reveal as="h1" delay={100}>Hay sentimientos que merecen <em>florecer.</em></Reveal>
            <Reveal as="p" className="l" delay={200}>Ramos creados pétalo a pétalo, para convertir pequeños detalles en recuerdos inolvidables.</Reveal>
            <Reveal className="hb" delay={300}>
              <button className="btn" onClick={() => { reset(); navigate('/catalogo') }}>Descubrir nuestros ramos</button>
              <button className="btn ghost" onClick={() => go('esencia')}>Nuestra esencia</button>
            </Reveal>
          </div>
          <Reveal className="art" delay={200}>
            <div className="ring" />
            <div className="arch"><Bouquet p={products[0]} /></div>
            <div className="stamp">HECHO<br />A MANO ✳</div>
          </Reveal>
        </div>
      </section>

      <div className="rb">
        <div style={{ gap: 0 }}>
          {ribbon.map((t, i) => (
            <span key={i} style={{ color: 'inherit', display: 'inline-flex', gap: 48, paddingRight: 48 }}>
              {t}<span>✳</span>
            </span>
          ))}
        </div>
      </div>

      <section className="ess" id="esencia">
        <div className="w eg">
          <Reveal className="ep"><Bouquet p={products[1]} view={2} /></Reveal>
          <Reveal delay={150}>
            <span className="eb">El corazón de ILATEY</span>
            <h2>No son solo flores. Son emociones <em>hechas a mano.</em></h2>
            <p style={{ color: 'var(--mut)' }}>Creemos que los pequeños detalles tienen el poder de convertirse en grandes recuerdos. Cada ramo se elabora artesanalmente, cuidando cada forma, cada color y cada detalle.</p>
            <div className="vals">
              <div><h3>Hecho artesanalmente</h3><p>Cada pétalo se moldea y se une a mano.</p></div>
              <div><h3>Diseñado para emocionar</h3><p>Pensado para quien lo recibe.</p></div>
              <div><h3>Un detalle que permanece</h3><p>No se marchita, se recuerda.</p></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ paddingBottom: 70 }}>
        <div className="w">
          <Reveal className="sh">
            <div>
              <span className="eb">Nuestra colección</span>
              <h2>Una flor para <em>cada forma de sentir.</em></h2>
            </div>
            <button className="ul" onClick={() => { reset(); navigate('/catalogo') }}>Ver todo el catálogo →</button>
          </Reveal>
        </div>
        <Reveal delay={150}><Carousel /></Reveal>
      </section>

      <section className="ess">
        <div className="w">
          <Reveal className="sh">
            <div>
              <span className="eb">Ocasiones</span>
              <h2>Cada momento merece <em>su propio detalle.</em></h2>
            </div>
            <button className="ul" onClick={() => navigate('/ocasiones')}>Explorar ocasiones →</button>
          </Reveal>
          <div className="oc">
            {MOODS.slice(0, 3).map((m, i) => (
              <Reveal as="button" className="o" delay={i * 80} key={m.id} onClick={() => navigate('/ocasiones')}>
                <i className="bd">{m.glyph}</i>
                <h3>{m.name}</h3>
                <p>{m.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="qt">
        <div className="w">
          <Reveal as="span" className="eb" style={{ color: 'var(--blush)' }}>Regalar es recordar</Reveal>
          <Reveal as="h2">Hay regalos que se olvidan. Y hay <em>detalles que se quedan para siempre.</em></Reveal>
          <Reveal as="p">Una flor puede durar un instante en la memoria, pero el sentimiento con el que fue entregada puede quedarse toda la vida.</Reveal>
        </div>
      </section>
    </>
  )
}
