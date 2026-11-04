import { create } from 'zustand'
import { persist } from 'zustand/middleware'
interface S { favorites:number[]; cat:string; mood:string; onlyFav:boolean; toast:string; toggleFav:(id:number)=>void; setCat:(c:string)=>void; setMood:(m:string)=>void; setOnlyFav:(v:boolean)=>void; reset:()=>void; notify:(m:string)=>void }
export const useStore=create<S>()(persist((set,get)=>({favorites:[],cat:'Todos',mood:'Todos',onlyFav:false,toast:'',
toggleFav:id=>{const has=get().favorites.includes(id);set({favorites:has?get().favorites.filter(f=>f!==id):[...get().favorites,id]});get().notify(has?'Quitado de favoritos':'Guardado en tus favoritos ♡')},
setCat:cat=>set({cat}),setMood:mood=>set({mood}),setOnlyFav:onlyFav=>set({onlyFav}),reset:()=>set({cat:'Todos',mood:'Todos',onlyFav:false}),
notify:m=>{set({toast:m});setTimeout(()=>get().toast===m&&set({toast:''}),2000)}}),{name:'ilatey-store',partialize:s=>({favorites:s.favorites})}))
