import { Route, Routes } from 'react-router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import { useStore } from './store/useStore'
export default function App(){const toast=useStore(s=>s.toast)
 return <><Navbar/><main><Routes><Route path="/" element={<Home/>}/><Route path="/ramo/:slug" element={<ProductDetail/>}/><Route path="*" element={<Home/>}/></Routes></main><Footer/>
 <div aria-live="polite" className={`pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-graphite px-6 py-2.5 text-sm text-ivory transition ${toast?'opacity-100':'translate-y-4 opacity-0'}`}>{toast}</div></>}
