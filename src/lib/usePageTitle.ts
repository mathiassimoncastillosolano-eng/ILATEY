import { useEffect } from 'react'

const BASE = 'ILATEY Flower Studio'

/** Título de la pestaña por página: «Catálogo · ILATEY Flower Studio». */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} · Ramos artesanales y personalizados`
  }, [title])
}
