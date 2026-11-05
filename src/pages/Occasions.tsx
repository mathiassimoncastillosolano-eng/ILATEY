import { useNavigate } from 'react-router-dom'
import { MOODS } from '../data/products'
import { useStore } from '../store/useStore'
import Reveal from '../components/Reveal'

export default function Occasions() {
  const navigate = useNavigate()
  const { reset, setMood } = useStore()
  const see = (id?: string) => {
    reset()
    if (id) setMood(id)
    navigate('/catalogo')
  }

  return (
    <section style={{ paddingTop: 0 }}>
      <div className="w">
        <div className="ph2">
          <span className="eb">El momento es tuyo</span>
          <h1>Cada momento merece <em>su propio detalle.</em></h1>
          <p>Ideas, mensajes y colores para acertar según lo que quieres decir.</p>
        </div>
        <div className="mt-8">
          {MOODS.map((m) => (
            <Reveal as="article" className="or" key={m.id}>
              <div className="ol">
                <div className="gl bd">{m.glyph}</div>
                <h3>{m.name}</h3>
                <p>{m.desc}</p>
                <button className="btn ghost" onClick={() => see(m.id)}>Ver ramos para esta ocasión</button>
              </div>
              <div className="od">
                <div><h5>Mensaje sugerido</h5><q>{m.message}</q></div>
                <div><h5>Qué comunicar</h5><p>{m.tip}</p></div>
                <div><h5>Paleta que acompaña</h5><div className="sw">{m.palette.map((c) => <i key={c} style={{ background: c }} />)}</div></div>
                <div><h5>Detalle que lo completa</h5><p>{m.detail}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="cta"><button className="btn" onClick={() => see()}>Ver todos los ramos</button></div>
      </div>
    </section>
  )
}
