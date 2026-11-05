import type { BouquetConfig } from '../../types/customization'
import { FLOWERS, PALETTES, SHAPES } from '../../data/customizationOptions'

/** Lista compacta de lo elegido hasta ahora, junto a la vista previa. */
export default function SelectionChips({ config }: { config: BouquetConfig }) {
  const flowers = FLOWERS.filter((f) => (config.flowers[f.id] ?? 0) > 0).map((f) => `${config.flowers[f.id]} ${f.name.toLowerCase()}`)
  const shape = config.shape ? SHAPES.find((s) => s.id === config.shape)?.name : null
  const palettes = config.palettes.map((id) => PALETTES.find((p) => p.id === id)?.name).filter(Boolean)
  const rows: [string, string | null][] = [
    ['Flores', flowers.length ? flowers.join(' · ') : null],
    ['Forma', shape ?? null],
    ['Colores', palettes.length ? palettes.join(' + ') : null],
  ]
  return (
    <dl className="cz-sel">
      {rows.map(([k, v]) => (
        <div key={k}><dt>{k}</dt><dd className={v ? '' : 'pending'}>{v ?? 'Por elegir'}</dd></div>
      ))}
    </dl>
  )
}
