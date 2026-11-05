import { useMemo, useState } from 'react'
import { Copy, Download, Pencil } from 'lucide-react'
import {
  CARD_STYLES, FINISHES, FLOWERS, PALETTES, PAPERS, PAPER_COLORS, RIBBONS, RIBBON_COLORS, SHAPES, stepIndex,
} from '../../../data/customizationOptions'
import type { StepId } from '../../../types/customization'
import { computeQuote, formatMoney } from '../../../data/pricingRules'
import { formatDate } from '../../../lib/customizerValidation'
import { getActiveChannel } from '../../../lib/requestChannel'
import { products } from '../../../data/products'
import { useCustomizerStore } from '../../../store/useCustomizerStore'
import { useStore } from '../../../store/useStore'
import { FullBreakdown } from '../PriceSummary'

const nameOf = <T extends string>(list: { id: T; name: string }[], id: T) => list.find((x) => x.id === id)?.name ?? id

function Section({ title, step, onGo, children }: { title: string; step: StepId; onGo: (i: number) => void; children: React.ReactNode }) {
  return (
    <section className="cz-sec">
      <header>
        <h3>{title}</h3>
        <button type="button" className="cz-link" onClick={() => onGo(stepIndex(step))} aria-label={`Modificar ${title.toLowerCase()}`}>
          <Pencil size={13} strokeWidth={1.8} /> Modificar
        </button>
      </header>
      {children}
    </section>
  )
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function CustomizationSummary({ onGo }: { onGo: (i: number) => void }) {
  const config = useCustomizerStore((s) => s.config)
  const request = useCustomizerStore((s) => s.request)
  const prepareRequest = useCustomizerStore((s) => s.prepareRequest)
  const markSent = useCustomizerStore((s) => s.markSent)
  const reset = useCustomizerStore((s) => s.reset)
  const notify = useStore((s) => s.notify)
  const quote = useMemo(() => computeQuote(config), [config])
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const channel = getActiveChannel()
  const w = config.wrapping
  const base = config.baseProductId ? products.find((p) => p.id === config.baseProductId) : null
  const x = config.extras

  const confirm = async () => {
    setSendError('')
    const req = prepareRequest()
    if (!channel) return
    setSending(true)
    const res = await channel.send(req)
    setSending(false)
    if (res.ok) markSent()
    else setSendError(res.reason)
  }
  const copy = async () => notify((await copyText(request?.text ?? '')) ? 'Resumen copiado ♡' : 'No se pudo copiar. Usa «Descargar».')

  return (
    <div className="cz-summary">
      {base && <p className="cz-help">Partiste de <b>{base.name}</b> y lo personalizaste.</p>}

      <Section title="Flores y cantidades" step="flores" onGo={onGo}>
        <ul className="cz-list">
          {FLOWERS.filter((f) => config.flowers[f.id]).map((f) => <li key={f.id}>{config.flowers[f.id]} × {f.name}</li>)}
          <li><b>{quote.totalFlowers} flores en total</b></li>
        </ul>
      </Section>
      <Section title="Forma" step="forma" onGo={onGo}><p>{config.shape ? nameOf(SHAPES, config.shape) : '—'}</p></Section>
      <Section title="Colores" step="colores" onGo={onGo}>
        <p className="cz-inline-sw">
          {config.palettes.map((id) => {
            const p = PALETTES.find((q) => q.id === id)!
            return <span key={id}><i style={{ background: p.swatches[0] }} aria-hidden="true" />{p.name}</span>
          })}
        </p>
      </Section>
      <Section title="Envoltorio" step="envoltorio" onGo={onGo}>
        <ul className="cz-list">
          <li>{nameOf(PAPERS, w.paper)} · {nameOf(PAPER_COLORS, w.paperColor).toLowerCase()} · {w.layers} {w.layers === 1 ? 'capa' : 'capas'}</li>
          <li>Cinta de {nameOf(RIBBONS, w.ribbon).toLowerCase()} · {nameOf(RIBBON_COLORS, w.ribbonColor).toLowerCase()}</li>
          <li>{nameOf(FINISHES, w.finish)}{w.box ? ' · en caja de regalo (por cotizar)' : ''}</li>
        </ul>
      </Section>
      <Section title="Tarjeta y dedicatoria" step="tarjeta" onGo={onGo}>
        <ul className="cz-list">
          <li>Estilo {nameOf(CARD_STYLES, config.card.style).toLowerCase()}</li>
          <li>Para: {config.card.recipient || '—'}</li>
          <li>Mensaje: {config.card.message ? `“${config.card.message}”` : '—'}</li>
          <li>De parte de: {config.card.sender || '—'}</li>
        </ul>
      </Section>
      <Section title="Comentarios y entrega" step="detalles" onGo={onGo}>
        <ul className="cz-list">
          <li>Comentarios: {x.notes || '—'}</li>
          {x.preferences && <li>Preferencias: {x.preferences}</li>}
          {x.restrictions && <li>Restricciones: {x.restrictions}</li>}
          <li>Presupuesto aproximado: {x.budget !== null ? formatMoney(x.budget) : '—'}</li>
          <li>Fecha deseada: {x.deliveryDate ? `${formatDate(x.deliveryDate)} (sujeta a confirmación)` : '—'}</li>
        </ul>
      </Section>

      <section className="cz-sec">
        <header><h3>Precio estimado</h3></header>
        <FullBreakdown quote={quote} />
      </section>

      <section className={`cz-req ${request ? 'is-ready' : ''}`} aria-live="polite">
        {!request ? (
          <>
            <h3>Confirmar solicitud</h3>
            <p>
              {channel
                ? `Al confirmar, tu solicitud se enviará por «${channel.label}».`
                : 'Al confirmar, guardamos tu solicitud en este dispositivo para que puedas copiarla o descargarla. Todavía no se envía a nadie: ILATEY aún no tiene un canal de pedidos conectado.'}
            </p>
            <button type="button" className="btn" onClick={confirm} disabled={sending}>{sending ? 'Enviando…' : channel ? 'Confirmar y enviar' : 'Confirmar y preparar solicitud'}</button>
            {sendError && <p className="cz-msg cz-msg-error" role="alert">No se pudo enviar: {sendError}</p>}
          </>
        ) : (
          <>
            <h3>{request.status === 'sent' ? 'Solicitud enviada' : 'Solicitud preparada'}</h3>
            <p className="cz-ref">Referencia <b>{request.id}</b></p>
            <p>
              {request.status === 'sent'
                ? 'Tu solicitud fue enviada. ILATEY te confirmará disponibilidad, precio final y fecha.'
                : 'Tu solicitud quedó guardada en este dispositivo, pero todavía NO ha sido enviada ni es un pedido: ILATEY aún no tiene un canal conectado. Copia o descarga el resumen para compartirlo cuando puedas contactar al taller.'}
            </p>
            <div className="cz-req-actions">
              <button type="button" className="btn" onClick={copy}><Copy size={15} strokeWidth={1.8} /> Copiar resumen</button>
              <button type="button" className="btn ghost" onClick={() => downloadText(`ilatey-solicitud-${request.id}.txt`, request.text)}><Download size={15} strokeWidth={1.8} /> Descargar (.txt)</button>
              {channel && request.status !== 'sent' && (
                <button type="button" className="btn" onClick={confirm} disabled={sending}>{sending ? 'Enviando…' : 'Enviar solicitud'}</button>
              )}
            </div>
            {sendError && <p className="cz-msg cz-msg-error" role="alert">No se pudo enviar: {sendError}</p>}
            <p className="cz-fine">¿Cambias algo? Modifica cualquier sección y volverás a confirmar. <button type="button" className="cz-link" onClick={() => { reset(); onGo(0) }}>Empezar un ramo nuevo</button></p>
          </>
        )}
      </section>
    </div>
  )
}
