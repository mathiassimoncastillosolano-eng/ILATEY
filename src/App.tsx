import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toast from './components/Toast'
import ProductModal from './components/ProductModal'
import WelcomeExperience from './components/welcome/WelcomeExperience'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Occasions from './pages/Occasions'
import Customize from './pages/Customize'
import { EASE } from './data/products'
import { useStore } from './store/useStore'

export default function App() {
  const location = useLocation()
  const reduce = useReducedMotion()
  const welcome = useStore((s) => s.welcome)
  const closeWelcome = useStore((s) => s.closeWelcome)

  // Al cambiar de ruta se vuelve arriba una vez que la página anterior terminó de salir.
  useEffect(() => { if (reduce) window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname, reduce])

  return (
    <>
      <Navbar />
      <main>
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
          <motion.div
            key={location.pathname}
            className="view"
            initial={{ opacity: 0, y: reduce ? 0 : 14 }}
            animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.5, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.2 } }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/ocasiones" element={<Occasions />} />
              <Route path="/personalizar" element={<Customize />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ProductModal />
      <Toast />
      <AnimatePresence>{welcome && <WelcomeExperience key="welcome" onDone={closeWelcome} />}</AnimatePresence>
    </>
  )
}
