import { SHAPES } from '../../../data/customizationOptions'
import { SHAPE_SUPPLEMENT, supplementLabel } from '../../../data/pricingRules'
import { useCustomizerStore } from '../../../store/useCustomizerStore'
import OptionCard from '../ui/OptionCard'
import ShapeIcon from '../ui/ShapeIcon'

export default function BouquetShapeSelection() {
  const shape = useCustomizerStore((s) => s.config.shape)
  const setShape = useCustomizerStore((s) => s.setShape)
  return (
    <fieldset className="cz-fs">
      <legend className="sr-only">Forma del ramo</legend>
      <div className="cz-grid-opts cz-shapes">
        {SHAPES.map((s) => (
          <OptionCard key={s.id} type="radio" name="forma" checked={shape === s.id} onChange={() => setShape(s.id)} className="cz-vert">
            <ShapeIcon shape={s.id} />
            <span className="cz-ot">
              <strong>{s.name}</strong>
              <span>{s.desc}</span>
              <span className="cz-meta"><b>{supplementLabel(SHAPE_SUPPLEMENT[s.id])}</b></span>
            </span>
          </OptionCard>
        ))}
      </div>
    </fieldset>
  )
}
