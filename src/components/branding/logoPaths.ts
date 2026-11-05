/** Geometría del símbolo ILATEY (tulipán de trazos finos). viewBox 0 0 100 120. Una sola fuente para logo, favicon y animación. */
export const LOGO_VIEWBOX = '0 0 100 120'

export const LOGO_PATHS = {
  /** Pétalo central: el arco que asoma entre los dos pétalos frontales. */
  arch: 'M40.5 45 C41 31 45 20 50 12 C55 20 59 31 59.5 45',
  /** Pétalos frontales: se cruzan en el centro y forman la copa del tulipán. */
  left: 'M50 106 C22 104 10 82 12 52 C12 42 13 36 14 30 C30 36 52 50 64 72 C68 80 66 92 50 106 Z',
  right: 'M50 106 C78 104 90 82 88 52 C88 42 87 36 86 30 C70 36 48 50 36 72 C32 80 34 92 50 106 Z',
} as const
