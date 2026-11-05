import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useGoSection } from '../lib/useGoSection'
import { useCustomizerStore } from '../store/useCustomizerStore'
import { isPristine } from '../store/customizerDefaults'
import BrandLogo from './branding/BrandLogo'

export default function Navbar() {
  const [menu, setMenu] = useState(false)
  const [solid, setSolid] = useState(false)
  const navigate = useNavigate()
  const go = useGoSection()
  const hasDraft = useCustomizerStore((s) => !isPristine(s.config))
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
          <Link to="/" className="brand-link" aria-label="ILATEY Flower Studio, ir al inicio" onClick={() => setMenu(false)}>
            <BrandLogo variant="navbar" />
          </Link>
          <div className="lk" onClick={() => setMenu(false)}>
            <NavLink to="/" end className={link}>Inicio</NavLink>
            <a href="/#esencia" onClick={section('esencia')}>Esencia</a>
            <NavLink to="/catalogo" className={link}>Catálogo</NavLink>
            <NavLink to="/ocasiones" className={link}>Ocasiones</NavLink>
            <NavLink to="/personalizar" className={link}>
              Personalizar
              {hasDraft && <><i className="nv-dot" aria-hidden="true" /><span className="sr-only"> (tienes un diseño guardado)</span></>}
            </NavLink>
            <a href="/#contacto" onClick={section('contacto')}>Contacto</a>
          </div>
          <button className={`ic ${onlyFav ? 'on' : ''}`} id="fv" aria-label="Favoritos" onClick={openFavs}>
            <Heart size={18} strokeWidth={1.6} />
            {favorites.length > 0 && <b>{favorites.length}</b>}
          </button>
          <NavLink className="btn" to="/personalizar">Crear mi ramo</NavLink>
          <button className="ic" id="bm" aria-label="Menú" onClick={() => setMenu(!menu)}>
            {menu ? <X size={18} strokeWidth={1.6} /> : <Menu size={18} strokeWidth={1.6} />}
          </button>
        </div>
      </nav>
    </>
  )
}
