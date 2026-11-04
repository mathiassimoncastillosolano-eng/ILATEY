import Bouquet from '../components/Bouquet'
import Catalog from '../components/Catalog'
import Occasions from '../components/Occasions'
import Reveal from '../components/Reveal'
import { useGoTo } from '../lib/nav'
import { products } from '../data/products'
export default function Home(){const go=useGoTo()
 return <><section id="inicio" className="px-5 pb-16 pt-10"><div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_.95fr]">
 <Reveal className="order-2 md:order-1"><span className="eyebrow">Flores artesanales · Hechas con amor</span><h1 className="my-4 text-5xl md:text-7xl">Hay sentimientos que merecen <em className="text-copper">florecer.</em></h1><p className="max-w-lg text-brown">Ramos artesanales creados pétalo a pétalo, para convertir pequeños detalles en recuerdos inolvidables.</p><div className="mt-7 flex flex-wrap gap-3"><button className="btn" onClick={()=>go('catalogo')}>Descubrir nuestros ramos</button><button className="btn btn-o" onClick={()=>go('esencia')}>Conocer nuestra esencia</button></div></Reveal>
 <Reveal className="order-1 md:order-2"><div className="mx-auto aspect-square max-h-[440px] overflow-hidden rounded-t-[200px] rounded-b-3xl shadow-xl md:aspect-[4/5] md:max-h-none"><Bouquet p={products[0]}/></div></Reveal></div></section>
 <section id="esencia" className="bg-warm px-5 py-16 md:py-24"><div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[.9fr_1.1fr]"><Reveal><div className="aspect-square overflow-hidden rounded-3xl border border-nude"><Bouquet p={products[1]} view={2}/></div></Reveal>
 <Reveal><span className="eyebrow">Nuestra esencia</span><h2 className="my-3 text-4xl md:text-5xl">No son solo flores. Son emociones hechas a mano.</h2><p className="text-brown">En ILATEY creemos que los pequeños detalles tienen el poder de convertirse en grandes recuerdos. Cada ramo es elaborado artesanalmente, cuidando cada forma, cada color y cada pequeño detalle.</p>
 <div className="mt-8 grid gap-4 md:grid-cols-3">{[['Hecho artesanalmente','Cada pétalo se dobla y se une a mano.'],['Diseñado para emocionar','Pensado para quien lo recibe.'],['Un detalle que permanece','No se marchita, se recuerda.']].map(([t,d])=><div key={t} className="border-t border-blush pt-3"><h3 className="text-xl text-brown">{t}</h3><p className="mt-1 text-xs">{d}</p></div>)}</div></Reveal></div></section>
 <Catalog/><Occasions/>
 <section className="bg-brown px-5 py-20 text-center text-ivory"><Reveal><span className="eyebrow !text-blush">Regalar es recordar</span><h2 className="mx-auto my-4 max-w-3xl text-4xl md:text-6xl">Hay regalos que se olvidan. Y hay <em className="text-blush">detalles que se quedan para siempre.</em></h2><p className="mx-auto max-w-xl font-serif text-2xl opacity-90">Una flor puede durar un instante en la memoria, pero el sentimiento con el que fue entregada puede quedarse para toda la vida.</p></Reveal></section></>}
