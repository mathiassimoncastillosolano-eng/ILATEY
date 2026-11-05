import { LOGO_PATHS, LOGO_VIEWBOX } from './logoPaths'

export type LogoTone = 'copper' | 'light'

type Props = { size?: number; tone?: LogoTone; strokeWidth?: number; className?: string; title?: string }

/** Símbolo estático, vectorial y con fondo transparente. El color sale de --logo (cobre por defecto). */
export default function LogoSymbol({ size = 48, tone = 'copper', strokeWidth = 1.7, className = '', title }: Props) {
  return (
    <svg
      className={`logo-sym logo-${tone} ${className}`.trim()}
      viewBox={LOGO_VIEWBOX}
      width={size}
      height={(size * 120) / 100}
      fill="none"
      stroke="var(--logo)"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={LOGO_PATHS.arch} />
      <path d={LOGO_PATHS.left} />
      <path d={LOGO_PATHS.right} />
    </svg>
  )
}
