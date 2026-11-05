import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useGoSection } from '../lib/useGoSection'

export default function Navbar() {
  const [menu, setMenu] = useState(false)
  const [solid, setSolid] = useState(false)
  const navigate = useNavigate()
  const go = useGoSection()
  const { favorites, onlyFav, setOnlyFav, reset } = useStore()
  const { scrollY, scrollYProgress } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setSolid(y > 20))

  const link = ({ isActive }: { isActive: boolean }) => (isActive ? 'on' : '')
  const section = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setMenu(false)
    go(id)
  }
  const openFavs = () => {
    const was = onlyFav
    reset()
    setOnlyFav(!was)
    navigate('/catalogo')
  }

  return (
    <>
      <motion.div id="bar" style={{ scaleX: scrollYProgress }} />
      <nav id="nv" className={solid ? 's' : ''}>
        <div className={`w nb ${menu ? 'm' : ''}`} id="nb">
          <img src="/logo.jpg" alt="ILATEY" onClick={() => navigate('/')} />
          <div className="lk" onClick={() => setMenu(false)}>
            <NavLink to="/" end className={link}>Inicio</NavLink>
            <a href="/#esencia" onClick={section('esencia')}>Esencia</a>
            <NavLink to="/catalogo" className={link}>Catálogo</NavLink>
            <NavLink to="/ocasiones" className={link}>Ocasiones</NavLink>
            <a href="/#contacto" onClick={section('contacto')}>Contacto</a>
          </div>
          <button className={`ic ${onlyFav ? 'on' : ''}`} id="fv" aria-label="Favoritos" onClick={openFavs}>
            <Heart size={18} strokeWidth={1.6} />
            {favorites.length > 0 && <b>{favorites.length}</b>}
          </button>
          <NavLink className="btn" to="/catalogo">Explorar</NavLink>
          <button className="ic" id="bm" aria-label="Menú" onClick={() => setMenu(!menu)}>
            {menu ? <X size={18} strokeWidth={1.6} /> : <Menu size={18} strokeWidth={1.6} />}
          </button>
        </div>
      </nav>
    </>
  )
}
