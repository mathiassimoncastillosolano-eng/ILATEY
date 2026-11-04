import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import type { Product } from '../data/products'
import { useStore } from '../store/useStore'
import Bouquet from './Bouquet'
export default function ProductCard({p,i}:{p:Product;i:number}){const nav=useNavigate();const {favorites,toggleFav}=useStore();const on=favorites.includes(p.id)
 return <motion.article layout initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} whileHover={{y:-6}} onClick={()=>nav(`/ramo/${p.slug}`)} className={`group cursor-pointer overflow-hidden rounded-[20px] border border-nude shadow-[0_10px_30px_-18px_rgba(114,86,77,.5)] ${i%3===1?'bg-nude':'bg-warm'}`}>
 <div className="relative aspect-[4/5] overflow-hidden"><div className="h-full transition duration-700 group-hover:scale-[1.07]"><Bouquet p={p}/></div>
 <span className="absolute left-3 top-3 rounded-full bg-ivory px-3 py-1 text-[.65rem] uppercase tracking-widest text-brown">{p.cat}</span>
 {p.edition&&<span className="absolute bottom-3 left-3 rounded-full bg-copper px-3 py-1 text-[.62rem] uppercase tracking-widest text-white">{p.edition}</span>}
 <button aria-label="Favorito" onClick={e=>{e.stopPropagation();toggleFav(p.id)}} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-ivory text-copper transition active:scale-125"><Heart size={19} fill={on?'currentColor':'none'}/></button>
 <span className="absolute bottom-3 right-3 hidden rounded-full bg-ivory px-3 py-1.5 text-xs text-brown opacity-0 transition group-hover:opacity-100 md:block">Explorar →</span></div>
 <div className="p-3 md:p-5"><h3 className="text-xl md:text-2xl">{p.name}</h3><p className="my-1 hidden text-sm text-brown md:block">{p.emotional}</p><span className="text-sm font-semibold text-copper">S/ {p.price} ref.</span></div></motion.article>}
