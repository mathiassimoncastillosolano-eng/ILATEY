import { useMemo, useState } from 'react'
import type { BouquetConfig, Quote, QuoteLine } from '../../types/customization'
import { PRICING, computeQuote, formatMoney, totalHeadline } from '../../data/pricingRules'

const lineAmount = (l: QuoteLine) => (l.amount === null ? 'Por cotizar' : l.amount === 0 ? 'Incluido' : formatMoney(l.amount))

export function QuoteNotes({ quote }: { quote: Quote }) {
  return (
    <>
      {quote.pending.length > 0 && quote.totalFlowers > 0 && (
        <p className="cz-fine cz-fine-warn">
          El total no es definitivo: {quote.pending.length === 1 ? 'hay 1 elemento' : `hay ${quote.pending.length} elementos`} sin precio definido
          ({quote.pending.map((p) => p.label.replace(/^\d+ × /, '')).join(', ')}). ILATEY te confirmará su valor.
        </p>
      )}
      {quote.provisional && <p className="cz-fine">Precios provisionales y referenciales. {PRICING.source}</p>}
    </>
  )
}

/** Precio en tiempo real con desglose: flores, suplementos, presentación y accesorios. */
export default function PriceSummary({ config }: { config: BouquetConfig }) {
  const quote = useMemo(() => computeQuote(config), [config])
  const head = totalHeadline(quote)
  const [open, setOpen] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(min-width: 981px)').matches)

  return (
    <div className="cz-price">
      <div className="cz-ph">
        <span className="cz-lab">{head.label}</span>
        <strong className="cz-pval" aria-live="polite">{head.value}</strong>
        {!quote.isComplete && quote.totalFlowers > 0 && <span className="cz-plus">+ por cotizar</span>}
      </div>
      <details className="cz-bd" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>Desglose</summary>
        {quote.totalFlowers === 0 ? (
          <p className="cz-fine">Elige tus flores y verás aquí el precio.</p>
        ) : (
          <dl>
            {quote.groups.filter((g) => g.lines.length > 0).map((g) => (
              <div className="cz-prow" key={g.id}>
                <dt>{g.label}</dt>
                <dd>{g.hasPending ? (g.total > 0 ? `${formatMoney(g.total)} + por cotizar` : 'Por cotizar') : g.total === 0 ? 'Incluido' : formatMoney(g.total)}</dd>
              </div>
            ))}
            <div className="cz-prow cz-ptotal">
              <dt>{head.label === 'Desde' ? 'Desde' : 'Total estimado'}</dt>
              <dd>{head.value}</dd>
            </div>
          </dl>
        )}
        <QuoteNotes quote={quote} />
      </details>
    </div>
  )
}

/** Desglose completo línea por línea (para la pantalla de resumen). */
export function FullBreakdown({ quote }: { quote: Quote }) {
  const head = totalHeadline(quote)
  return (
    <div className="cz-full">
      {quote.groups.filter((g) => g.lines.length > 0).map((g) => (
        <div key={g.id} className="cz-fg">
          <h4>{g.label}</h4>
          <ul>
            {g.lines.map((l) => (
              <li key={l.id}><span>{l.label}{l.detail && <small> · {l.detail}</small>}</span><b>{lineAmount(l)}</b></li>
            ))}
          </ul>
        </div>
      ))}
      <div className="cz-prow cz-ptotal"><span>{head.label}</span><strong>{head.value}{!quote.isComplete && quote.totalFlowers > 0 ? ' + por cotizar' : ''}</strong></div>
      <QuoteNotes quote={quote} />
    </div>
  )
}
