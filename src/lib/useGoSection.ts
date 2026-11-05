import { useLocation, useNavigate } from 'react-router-dom'

/** Baja suavemente a una sección; si no estás en el inicio, primero te lleva a él. */
export function useGoSection() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (id: string) => {
    const go = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    if (pathname !== '/') {
      navigate('/')
      setTimeout(go, 450)
    } else go()
  }
}
