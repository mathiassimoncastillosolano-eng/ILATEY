import type { ReactNode } from 'react'
import {
  FINISHES, PAPERS, PAPER_COLORS, RIBBONS, RIBBON_COLORS,
} from '../../../data/customizationOptions'
import {
  BOX_SUPPLEMENT, FINISH_SUPPLEMENT, LAYER_SUPPLEMENT, PAPER_SUPPLEMENT, RIBBON_SUPPLEMENT, supplementLabel,
} from '../../../data/pricingRules'
import type { LayerCount } from '../../../types/customization'
import { useCustomizerStore } from '../../../store/useCustomizerStore'
import OptionCard from '../ui/OptionCard'

function Group({ legend, children, wide }: { legend: string; children: ReactNode; wide?: boolean }) {
  return (
    <fieldset className="cz-fs cz-group">
      <legend>{legend}</legend>
      <div className={wide ? 'cz-grid-opts' : 'cz-inline'}>{children}</div>
    </fieldset>
  )
}

export default function WrappingSelection() {
  const w = useCustomizerStore((s) => s.config.wrapping)
  const set = useCustomizerStore((s) => s.setWrapping)
  const paperHex = PAPER_COLORS.find((c) => c.id === w.paperColor)?.hex
  const ribbonHex = RIBBON_COLORS.find((c) => c.id === w.ribbonColor)?.hex

  return (
    <div className="cz-wrap-step">
      <Group legend="Tipo de papel" wide>
        {PAPERS.map((p) => (
          <OptionCard key={p.id} type="radio" name="papel" checked={w.paper === p.id} onChange={() => set({ paper: p.id })}>
            <span className={`cz-paper cz-paper-${p.id}`} style={{ backgroundColor: paperHex }} aria-hidden="true" />
            <span className="cz-ot"><strong>{p.name}</strong><span>{p.desc}</span><span className="cz-meta"><b>{supplementLabel(PAPER_SUPPLEMENT[p.id])}</b></span></span>
          </OptionCard>
        ))}
      </Group>

      <Group legend="Color del papel">
        {PAPER_COLORS.map((c) => (
          <OptionCard key={c.id} type="radio" name="papel-color" checked={w.paperColor === c.id} onChange={() => set({ paperColor: c.id })} className="cz-swatch">
            <i className="cz-dotc" style={{ background: c.hex }} aria-hidden="true" />
            <span>{c.name}</span>
          </OptionCard>
        ))}
      </Group>

      <Group legend="Capas de papel">
        {([1, 2, 3] as LayerCount[]).map((n) => (
          <OptionCard key={n} type="radio" name="capas" checked={w.layers === n} onChange={() => set({ layers: n })} className="cz-swatch">
            <span className="cz-layers" aria-hidden="true">{Array.from({ length: n }, (_, i) => <i key={i} />)}</span>
            <span>{n} {n === 1 ? 'capa' : 'capas'} <small>{supplementLabel(LAYER_SUPPLEMENT[n])}</small></span>
          </OptionCard>
        ))}
      </Group>

      <Group legend="Tipo de cinta" wide>
        {RIBBONS.map((r) => (
          <OptionCard key={r.id} type="radio" name="cinta" checked={w.ribbon === r.id} onChange={() => set({ ribbon: r.id })}>
            <span className={`cz-rib cz-rib-${r.id}`} style={{ backgroundColor: ribbonHex }} aria-hidden="true" />
            <span className="cz-ot"><strong>{r.name}</strong><span>{r.desc}</span><span className="cz-meta"><b>{supplementLabel(RIBBON_SUPPLEMENT[r.id])}</b></span></span>
          </OptionCard>
        ))}
      </Group>

      <Group legend="Color de la cinta">
        {RIBBON_COLORS.map((c) => (
          <OptionCard key={c.id} type="radio" name="cinta-color" checked={w.ribbonColor === c.id} onChange={() => set({ ribbonColor: c.id })} className="cz-swatch">
            <i className="cz-dotc" style={{ background: c.hex }} aria-hidden="true" />
            <span>{c.name}</span>
          </OptionCard>
        ))}
      </Group>

      <Group legend="Lazo o moño" wide>
        {FINISHES.map((f) => (
          <OptionCard key={f.id} type="radio" name="acabado" checked={w.finish === f.id} onChange={() => set({ finish: f.id })}>
            <span className="cz-ot"><strong>{f.name}</strong><span>{f.desc}</span><span className="cz-meta"><b>{supplementLabel(FINISH_SUPPLEMENT[f.id])}</b></span></span>
          </OptionCard>
        ))}
      </Group>

      <Group legend="Presentación especial" wide>
        <OptionCard type="checkbox" name="caja" checked={w.box} onChange={() => set({ box: !w.box })}>
          <span className="cz-ot">
            <strong>Caja de regalo</strong>
            <span>Tu ramo dentro de una caja. Se confirma con el taller.</span>
            <span className="cz-meta"><b>{supplementLabel(BOX_SUPPLEMENT)}</b></span>
          </span>
        </OptionCard>
      </Group>
    </div>
  )
}
