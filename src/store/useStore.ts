import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../data/products'
import { hasSeenWelcome, markWelcomeSeen } from '../lib/welcome'

interface State {
  favorites: number[]
  cat: string
  mood: string
  q: string
  onlyFav: boolean
  selected: Product | null
  toast: string
  toastOn: boolean
  /** Bienvenida de primera visita (no se guarda aquí: lo recuerda lib/welcome.ts). */
  welcome: boolean
  toggleFav: (id: number) => void
  setCat: (c: string) => void
  setMood: (m: string) => void
  setQ: (q: string) => void
  setOnlyFav: (v: boolean) => void
  reset: () => void
  notify: (m: string) => void
  open: (p: Product) => void
  close: () => void
  openWelcome: () => void
  closeWelcome: () => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      favorites: [],
      cat: 'Todos',
      mood: 'Todos',
      q: '',
      onlyFav: false,
      selected: null,
      toast: '',
      toastOn: false,
      welcome: !hasSeenWelcome(),
      toggleFav: (id) => {
        const has = get().favorites.includes(id)
        set({ favorites: has ? get().favorites.filter((x) => x !== id) : [...get().favorites, id] })
        get().notify(has ? 'Quitado de favoritos' : 'Guardado en tus favoritos ♡')
      },
      setCat: (cat) => set({ cat }),
      setMood: (mood) => set({ mood }),
      setQ: (q) => set({ q }),
      setOnlyFav: (onlyFav) => set({ onlyFav }),
      reset: () => set({ cat: 'Todos', mood: 'Todos', q: '', onlyFav: false }),
      notify: (toast) => {
        set({ toast, toastOn: true })
        clearTimeout(timer)
        timer = setTimeout(() => set({ toastOn: false }), 2200)
      },
      open: (selected) => set({ selected }),
      close: () => set({ selected: null }),
      openWelcome: () => set({ welcome: true }),
      closeWelcome: () => {
        markWelcomeSeen()
        set({ welcome: false })
      },
    }),
    { name: 'ilatey-fav', partialize: (s) => ({ favorites: s.favorites }) },
  ),
)
