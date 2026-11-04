import { useGoTo } from '../lib/nav'
import { useStore } from '../store/useStore'
export default function Footer(){const go=useGoTo();const n=useStore(s=>s.notify)
 return <footer id="contacto" className="border-t border-nude bg-warm px-5 pb-8 pt-14"><div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3"><div><img src="/logo.jpg" alt="ILATEY" className="h-28 w-28 rounded-full mix-blend-multiply"/><p className="font-serif text-xl text-brown">Flores &amp; Detalles</p><p className="text-sm">Pequeños detalles, grandes sentimientos.</p></div>
 <div className="flex flex-col items-start gap-2 text-sm text-brown"><span className="eyebrow">Navegar</span>{[['inicio','Inicio'],['esencia','Nuestra esencia'],['catalogo','Catálogo'],['ocasiones','Ocasiones']].map(([i,l])=><button key={i} onClick={()=>go(i)}>{l}</button>)}</div>
 <div className="flex flex-col items-start gap-2 text-sm text-brown"><span className="eyebrow">Contacto</span><button onClick={()=>n('Muy pronto: WhatsApp')}>WhatsApp</button><button onClick={()=>n('Muy pronto: Instagram')}>Instagram</button></div></div>
 <p className="mt-10 text-center font-serif text-2xl italic text-copper">Hecho a mano, pensado para el corazón.</p><p className="mt-2 text-center text-xs opacity-60">© 2026 ILATEY. Todos los derechos reservados.</p></footer>}
