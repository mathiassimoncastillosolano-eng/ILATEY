import { AnimatePresence } from 'framer-motion'
import { MOODS, products } from '../data/products'
import { useStore } from '../store/useStore'
import ProductCard from './ProductCard'
import Reveal from './Reveal'
const cats=['Todos',...new Set(products.map(p=>p.cat))]
export default function Catalog(){const {cat,mood,onlyFav,favorites,setCat,setMood,reset}=useStore()
 const list=products.filter(p=>(cat==='Todos'||p.cat===cat)&&(mood==='Todos'||p.moods.includes(mood))&&(!onlyFav||favorites.includes(p.id)))
 const Chips=({items,cur,set}:{items:{id:string;n:string}[];cur:string;set:(v:string)=>void})=><div className="mt-2 flex flex-wrap gap-2">{items.map(i=><button key={i.id} onClick={()=>set(i.id)} className={`chip ${cur===i.id?'chip-on':''}`}>{i.n}</button>)}</div>
 return <section id="catalogo" className="py-16 md:py-24"><div className="mx-auto max-w-6xl px-5"><Reveal><span className="eyebrow">Nuestra colección</span><h2 className="my-3 text-4xl md:text-5xl">Encuentra una forma de decirlo.</h2><p className="max-w-xl text-brown">Cada ramo tiene una historia. Descubre el detalle perfecto para hacer especial cualquier momento.</p></Reveal>
 <Chips items={cats.map(c=>({id:c,n:c}))} cur={cat} set={setCat}/><Chips items={[{id:'Todos',n:'Todos los sentimientos'},...MOODS.map(m=>({id:m.id,n:m.name}))]} cur={mood} set={setMood}/>
 <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6"><AnimatePresence mode="popLayout">{list.map((p,i)=><ProductCard key={p.id} p={p} i={i}/>)}</AnimatePresence>
 {!list.length&&<div className="col-span-full rounded-2xl border border-dashed border-blush p-12 text-center text-brown"><h3 className="text-2xl">{onlyFav?'Aún no tienes favoritos':'No encontramos ramos con esta combinación'}</h3><p className="mt-1">{onlyFav?'Toca el corazón en los ramos que te enamoren.':'Prueba con otro sentimiento o flor.'}</p><button className="btn btn-o mt-4" onClick={reset}>Ver todo el catálogo</button></div>}</div></div></section>}
