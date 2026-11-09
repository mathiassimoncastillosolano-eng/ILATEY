import { useNavigate } from 'react-router-dom'
import type { Product } from '../data/products'
import { stepIndex } from '../data/customizationOptions'
import { useCustomizerStore } from '../store/useCustomizerStore'
import { canChooseDirectly, seedDirectFromProduct, seedFromProduct } from './productSeed'

/** Accesos al configurador desde cualquier parte de la app. */
export function useOpenCustomizer() {
  const navigate = useNavigate()
  const begin = useCustomizerStore((s) => s.begin)
  const setCard = useCustomizerStore((s) => s.setCard)
  return {
    /** «Crear mi ramo»: abre el configurador y conserva el diseño en curso, si lo hay. */
    create: () => navigate('/personalizar'),
    /** «Personalizar este ramo»: parte de un ramo del catálogo (y de una frase elegida, si la hay). Empieza en Flores. */
    fromProduct: (p: Product, message?: string) => {
      if (p.flowers > 0) begin(seedFromProduct(p, message), { startStep: 0, entry: 'catalog-custom' })
      else if (message) setCard({ message }) // «Ramo a tu Medida»: se continúa el diseño en curso
      navigate('/personalizar')
    },
    /**
     * «Quiero este ramo»: el ramo tal como está en el catálogo. Empieza en Envoltorio (paso 5).
     * Si el producto no tiene composición propia («Ramo a tu Medida») no hay nada que elegir tal cual:
     * se cae al flujo normal de personalización.
     */
    chooseProduct: (p: Product, message?: string) => {
      if (canChooseDirectly(p)) {
        // El store limita el paso inicial al primer paso inválido; para un ramo de catálogo todo es válido hasta Envoltorio.
        begin(seedDirectFromProduct(p, message), { startStep: stepIndex('envoltorio'), entry: 'catalog-direct' })
      } else if (message) {
        setCard({ message })
      }
      navigate('/personalizar')
    },
  }
}
