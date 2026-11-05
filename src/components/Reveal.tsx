import { createElement, useRef } from 'react'
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react'
import { useInView } from 'framer-motion'

type Props = {
  as?: 'div' | 'button' | 'article' | 'span' | 'h1' | 'h2' | 'p'
  className?: string
  delay?: number
  style?: CSSProperties
  onClick?: MouseEventHandler
  children: ReactNode
}

/** Aparece suavemente al entrar en pantalla (usa useInView de Framer Motion + las clases .rv/.in del CSS). */
export default function Reveal({ as = 'div', className = '', delay = 0, style, onClick, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.12 })
  return createElement(
    as,
    { ref, onClick, className: `rv ${seen ? 'in' : ''} ${className}`.trim(), style: { '--d': `${delay}ms`, ...style } as CSSProperties },
    children,
  )
}
