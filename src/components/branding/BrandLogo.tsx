import LogoSymbol from './LogoSymbol'
import AnimatedLogo from './AnimatedLogo'
import type { LogoTone } from './LogoSymbol'

export type BrandVariant = 'full' | 'symbol' | 'navbar' | 'footer'

type Props = {
  variant?: BrandVariant
  tone?: LogoTone
  /** Solo aplica al símbolo de las variantes «full» y «symbol». */
  animated?: boolean
  className?: string
}

const SIZE: Record<BrandVariant, number> = { full: 120, symbol: 64, navbar: 30, footer: 58 }

/** Wordmark editorial: ILATEY con protagonismo, FLOWER STUDIO debajo, muy espaciado y pequeño. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`brand-word ${className}`.trim()}>
      <span className="brand-name">ILATEY</span>
      <span className="brand-sub">FLOWER STUDIO</span>
    </span>
  )
}

/** Logo completo, símbolo aislado y variantes para navbar y footer. Todas con fondo transparente. */
export default function BrandLogo({ variant = 'full', tone = 'copper', animated = false, className = '' }: Props) {
  const size = SIZE[variant]
  const symbol = animated && (variant === 'full' || variant === 'symbol')
    ? <AnimatedLogo size={size} tone={tone} />
    : <LogoSymbol size={size} tone={tone} strokeWidth={variant === 'navbar' ? 3.4 : 1.7} />

  if (variant === 'symbol') return <span className={`brand brand-symbol logo-${tone} ${className}`.trim()}>{symbol}</span>
  return (
    <span className={`brand brand-${variant} logo-${tone} ${className}`.trim()}>
      {symbol}
      <Wordmark />
    </span>
  )
}
