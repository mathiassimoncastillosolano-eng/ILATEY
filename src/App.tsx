import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toast from './components/Toast'
import ProductModal from './components/ProductModal'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Occasions from './pages/Occasions'

export default function App() {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])

  return (
    <>
      <Navbar />
      <main>
        <div key={location.pathname} className="view ent">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/ocasiones" element={<Occasions />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <ProductModal />
      <Toast />
    </>
  )
}
