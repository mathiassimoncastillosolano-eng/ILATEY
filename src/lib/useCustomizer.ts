import { useNavigate } from 'react-router-dom'
import type { Product } from '../data/products'
import { useCustomizerStore } from '../store/useCustomizerStore'
import { seedFromProduct } from './productSeed'

/** Accesos al configurador desde cualquier parte de la app. */
export function useOpenCustomizer() {
  const navigate = useNavigate()
  const begin = useCustomizerStore((s) => s.begin)
  const setCard = useCustomizerStore((s) => s.setCard)
  return {
    /** «Crear mi ramo»: abre el configurador y conserva el diseño en curso, si lo hay. */
    create: () => navigate('/personalizar'),
    /** «Personalizar este ramo»: parte de un ramo del catálogo (y de una frase elegida, si la hay). */
    fromProduct: (p: Product, message?: string) => {
      if (p.flowers > 0) begin(seedFromProduct(p, message))
      else if (message) setCard({ message }) // «Ramo a tu Medida»: se continúa el diseño en curso
      navigate('/personalizar')
    },
  }
}
