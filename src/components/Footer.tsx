import { Link } from 'react-router-dom'
import { Instagram } from 'lucide-react'
import { useGoSection } from '../lib/useGoSection'

export default function Footer() {
  const go = useGoSection()
  return (
    <footer id="contacto">
      <div className="w fg">
        <div>
          <img src="/logo.jpg" alt="ILATEY" />
          <p className="font-serif text-[22px] text-brown mt-2.5">Flores &amp; Detalles</p>
          <p className="text-[13px]" style={{ color: 'var(--mut)' }}>Pequeños detalles, grandes sentimientos.</p>
        </div>
        <div>
          <h4>Navegar</h4>
          <a href="/#esencia" onClick={(e) => { e.preventDefault(); go('esencia') }}>Nuestra esencia</a>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/ocasiones">Ocasiones</Link>
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
        <small>© 2026 ILATEY · Todos los derechos reservados</small>
      </p>
    </footer>
  )
}
