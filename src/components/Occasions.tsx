import { MOODS, products } from '../data/products'
import { useStore } from '../store/useStore'
import { useGoTo } from '../lib/nav'
import Bouquet from './Bouquet'
import Reveal from './Reveal'
export default function Occasions(){const {reset,setMood}=useStore();const go=useGoTo()
 return <section id="ocasiones" className="bg-warm py-16 md:py-24"><div className="mx-auto max-w-6xl px-5"><Reveal><span className="eyebrow">Ocasiones</span><h2 className="my-3 text-4xl md:text-5xl">Cada momento merece su propio detalle.</h2></Reveal>
 <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">{MOODS.map(m=>{const p=products.find(x=>x.moods.includes(m.id)&&x.type===m.art)??products.find(x=>x.moods.includes(m.id))!
 return <Reveal key={m.id}><button onClick={()=>{reset();setMood(m.id);go('catalogo')}} className="w-full overflow-hidden rounded-[20px] border border-nude bg-ivory text-left transition hover:-translate-y-1 hover:shadow-lg"><div className="aspect-[16/10] overflow-hidden"><div className="-mt-6 scale-110"><Bouquet p={p}/></div></div><div className="p-4"><h3 className="text-xl md:text-2xl">{m.name}</h3><p className="hidden text-sm text-brown md:block">{m.desc}</p></div></button></Reveal>})}</div></div></section>}
