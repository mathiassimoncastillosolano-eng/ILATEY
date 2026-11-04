import { useState } from 'react'
import { Heart, Menu, X } from 'lucide-react'
import { useGoTo } from '../lib/nav'
import { useStore } from '../store/useStore'
const links=[['inicio','Inicio'],['esencia','Nuestra esencia'],['catalogo','Catálogo'],['ocasiones','Ocasiones'],['contacto','Contacto']]
export default function Navbar(){const [open,setOpen]=useState(false);const go=useGoTo();const {favorites,onlyFav,setOnlyFav}=useStore()
 const to=(id:string)=>{go(id);setOpen(false)}
 return <nav className="sticky top-0 z-30 border-b border-nude/60 bg-ivory/90 backdrop-blur" style={{paddingTop:'env(safe-area-inset-top)'}}><div className="mx-auto flex h-[72px] max-w-6xl items-center gap-6 px-5">
 <img src="/logo.jpg" alt="ILATEY Flores & Detalles" className="h-14 w-14 cursor-pointer rounded-full mix-blend-multiply" onClick={()=>to('inicio')}/><div className="flex-1"/>
 <div className="hidden gap-7 md:flex">{links.map(([id,l])=><button key={id} onClick={()=>to(id)} className="text-sm text-brown hover:text-copper">{l}</button>)}</div>
 <button aria-label="Favoritos" onClick={()=>{setOnlyFav(!onlyFav);to('catalogo')}} className={`relative grid h-10 w-10 place-items-center rounded-full border ${onlyFav?'border-copper bg-copper text-white':'border-nude text-brown'}`}><Heart size={18}/>{favorites.length>0&&<b className="absolute -right-1 -top-1 min-w-4 rounded-full bg-copper px-1 text-[.65rem] text-white">{favorites.length}</b>}</button>
 <button className="btn hidden md:block" onClick={()=>to('catalogo')}>Explorar catálogo</button>
 <button aria-label="Menú" className="grid h-10 w-10 place-items-center md:hidden" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div>
 {open&&<div className="flex flex-col gap-4 border-t border-nude bg-ivory px-5 py-5 md:hidden">{links.map(([id,l])=><button key={id} onClick={()=>to(id)} className="text-left font-serif text-xl text-brown">{l}</button>)}</div>}</nav>}
