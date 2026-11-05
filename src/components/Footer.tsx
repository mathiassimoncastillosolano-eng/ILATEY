import { Link } from 'react-router-dom'
import { Instagram } from 'lucide-react'
import { useGoSection } from '../lib/useGoSection'
import { useStore } from '../store/useStore'
import BrandLogo from './branding/BrandLogo'

export default function Footer() {
  const go = useGoSection()
  const openWelcome = useStore((s) => s.openWelcome)
  return (
    <footer id="contacto">
      <div className="w fg">
        <div>
          <BrandLogo variant="footer" />
          <p className="text-[13px] mt-3" style={{ color: 'var(--mut)' }}>Cada flor tiene una historia. Crea la tuya.</p>
        </div>
        <div>
          <h4>Navegar</h4>
          <a href="/#esencia" onClick={(e) => { e.preventDefault(); go('esencia') }}>Nuestra esencia</a>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/ocasiones">Ocasiones</Link>
          <Link to="/personalizar">Personaliza tu ramo</Link>
          <button type="button" onClick={openWelcome}>Ver la bienvenida</button>
        </div>
        <div>
          <h4>Síguenos</h4>
          <p className="text-[13px]" style={{ color: 'var(--mut)' }}>Novedades, procesos y nuevos ramos.</p>
          <a className="ig" aria-label="Instagram de ILATEY" href="https://www.instagram.com/_ilatey_" target="_blank" rel="noopener noreferrer">
            <Instagram size={24} strokeWidth={1.6} />
          </a>
        </div>
      </div>
      <p className="cp">
        Hecho a mano, pensado para el corazón.
        <small>© 2026 ILATEY Flower Studio · Todos los derechos reservados</small>
      </p>
    </footer>
  )
}
