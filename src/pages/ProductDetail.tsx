import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react'
import { GALLERY_VIEWS, OCCASIONS, PHRASES, products } from '../data/products'
import { useStore } from '../store/useStore'
import Bouquet from '../components/Bouquet'
import Reveal from '../components/Reveal'
export default function ProductDetail(){const {slug}=useParams();const p=products.find(x=>x.slug===slug)
 const [i,setI]=useState(0),[zoom,setZoom]=useState(false),[gift,setGift]=useState(false),[phrase,setPhrase]=useState(0)
 const {favorites,toggleFav,notify}=useStore()
 useEffect(()=>{window.scrollTo(0,0);setI(0);setPhrase(0)},[slug])
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='ArrowRight')setI(v=>(v+1)%5);if(e.key==='ArrowLeft')setI(v=>(v+4)%5);if(e.key==='Escape'){setZoom(false);setGift(false)}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[])
 if(!p)return <div className="p-20 text-center"><h1 className="text-4xl">Este ramo no existe</h1><Link to="/" className="btn mt-6">Volver al catálogo</Link></div>
 const phrases=[p.phrase,...PHRASES.filter(x=>x!==p.phrase)].slice(0,4);const on=favorites.includes(p.id)
 return <div className="mx-auto max-w-6xl px-5 pb-20"><Link to="/" className="my-6 inline-block text-sm text-brown">← Volver al catálogo</Link>
 <div className="grid items-start gap-10 md:grid-cols-[1.1fr_.9fr]"><div><div className="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-nude" onClick={()=>setZoom(true)}><AnimatePresence mode="wait"><motion.div key={i} className="h-full" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.25}}><Bouquet p={p} view={i}/></motion.div></AnimatePresence>
 {[-1,1].map(d=><button key={d} aria-label={d<0?'Anterior':'Siguiente'} onClick={e=>{e.stopPropagation();setI((i+d+5)%5)}} className={`absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ivory text-brown ${d<0?'left-3':'right-3'}`}>{d<0?<ChevronLeft/>:<ChevronRight/>}</button>)}
 <span className="absolute bottom-3 left-3 rounded-full bg-ivory px-3 py-1 text-xs text-brown">{GALLERY_VIEWS[i]}</span></div>
 <div className="mt-3 grid grid-cols-5 gap-2">{GALLERY_VIEWS.map((v,j)=><button key={v} aria-label={v} onClick={()=>setI(j)} className={`aspect-square overflow-hidden rounded-xl border-2 transition ${i===j?'border-copper':'border-transparent opacity-60'}`}><Bouquet p={p} view={j}/></button>)}</div>
 <p className="mt-2 text-xs text-brown/70">Imágenes referenciales; se sustituirán por fotografías reales.</p></div>
 <div><span className="eyebrow">{p.cat}{p.edition&&` · ${p.edition}`}</span><h1 className="my-3 text-5xl md:text-6xl">{p.name}</h1><p className="text-brown">{p.short} {p.emotional}</p><p className="mt-4 font-serif text-3xl text-copper">S/ {p.price} <small className="font-sans text-xs text-brown">precio referencial</small></p>
 <div className="my-4 flex items-center gap-2 text-sm text-brown">Colores: {p.colors.map(c=><i key={c} className="h-5 w-5 rounded-full border border-nude" style={{background:c}}/>)}</div>
 <ul className="mb-6 text-sm">{[['Flores',p.flowers?`${p.flowers} flores`:'A tu elección'],['Elaboración',p.time],...p.features.map(f=>['Detalle',f])].map(([a,b],k)=><li key={k} className="flex justify-between border-b border-nude py-2"><span className="text-brown">{a}</span>{b}</li>)}</ul>
 <div className="flex flex-wrap gap-3"><button className="btn" onClick={()=>setGift(true)}>Quiero regalar este ramo</button><button className="btn btn-o inline-flex items-center gap-2" onClick={()=>toggleFav(p.id)}><Heart size={16} fill={on?'currentColor':'none'}/>{on?'En favoritos':'Guardar'}</button></div></div></div>
 <Reveal className="mt-16 rounded-3xl bg-nude p-8 text-center md:p-12"><span className="eyebrow">El significado detrás del ramo</span><h2 className="my-3 text-4xl md:text-5xl">{p.emotional}</h2><p className="mx-auto max-w-xl font-serif text-2xl text-brown">{p.meaning}</p></Reveal>
 <Reveal className="mt-14"><h2 className="text-3xl md:text-4xl">¿Para qué ocasión es perfecto?</h2><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{Object.entries(OCCASIONS).map(([k,v])=><div key={k} className={`rounded-2xl border bg-warm p-4 ${p.occasions.includes(k)?'border-copper':'border-nude opacity-50'}`}><h4 className="text-sm font-semibold">{k}</h4><p className="mt-1 font-serif italic leading-tight text-brown">{v}</p></div>)}</div></Reveal>
 <Reveal className="mt-14"><h2 className="text-3xl md:text-4xl">Una frase para regalar</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{phrases.map((f,k)=><button key={f} onClick={()=>setPhrase(k)} className={`rounded-2xl border border-blush p-5 text-left font-serif text-2xl italic leading-tight transition ${phrase===k?'bg-copper text-white':'text-brown hover:bg-nude'}`}>“{f}”</button>)}</div></Reveal>
 {(zoom||gift)&&<div className="fixed inset-0 z-50 grid place-items-center bg-graphite/70 p-5" onClick={()=>{setZoom(false);setGift(false)}}><div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-ivory" style={zoom?{maxWidth:'min(90vw,80vh)'}:{padding:32,textAlign:'center'}} onClick={e=>e.stopPropagation()}>
 {zoom?<><button aria-label="Cerrar" className="absolute right-3 top-3 z-10 rounded-full bg-ivory p-2" onClick={()=>setZoom(false)}><X size={18}/></button><Bouquet p={p} view={i}/></>:<><span className="eyebrow">Tu intención de regalo</span><h2 className="my-2 text-4xl">{p.name}</h2><p className="mb-4 font-serif text-2xl italic text-brown">“{phrases[phrase]}”</p><p className="mb-5 text-sm opacity-80">Demostración del MVP: pronto podrás coordinar tu pedido con ILATEY.</p><button className="btn" onClick={()=>{setGift(false);notify('¡Gracias! Tu detalle quedó anotado ♡')}}>Entendido</button></>}</div></div>}</div>}
