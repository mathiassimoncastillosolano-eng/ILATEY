import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Copy, Download, Loader2, MessageCircle, Pencil, RefreshCw } from 'lucide-react'
import { STEPS, stepIndex } from '../../../data/customizationOptions'
import type { RequestFormat, StepId } from '../../../types/customization'
import { computeQuote } from '../../../data/pricingRules'
import { firstInvalidStep } from '../../../lib/customizerValidation'
import { NOT_SPECIFIED, NOT_SPECIFIED_OPTIONAL, buildRequestDocument } from '../../../lib/requestDocument'
import type { RequestDocument } from '../../../lib/requestDocument'
import { triggerDownload } from '../../../lib/download'
import { createRequestFile } from '../../../lib/requestExport'
import type { RequestFile } from '../../../lib/requestExport'
import { attachInstructions, buildWhatsAppMessage } from '../../../lib/whatsapp'
import { useCustomizerStore } from '../../../store/useCustomizerStore'
import { useStore } from '../../../store/useStore'
import { FullBreakdown } from '../PriceSummary'
import Msg from '../ui/Msg'
import ContactTransition from '../summary/ContactTransition'
import FormatSelector from '../summary/FormatSelector'

const none = (text = NOT_SPECIFIED) => <span className="cz-none">{text}</span>

function Block({ title, step, onGo, children }: { title: string; step: StepId; onGo: (i: number) => void; children: ReactNode }) {
  return (
    <section className="cz-sb">
      <header>
        <h3>{title}</h3>
        <button type="button" className="cz-link" onClick={() => onGo(stepIndex(step))} aria-label={`Modificar ${title.toLowerCase()}`}>
          <Pencil size={13} strokeWidth={1.8} aria-hidden="true" /> Modificar
        </button>
      </header>
      <dl className="cz-sd">{children}</dl>
    </section>
  )
}

const Item = ({ k, children }: { k: string; children: ReactNode }) => <div><dt>{k}</dt><dd>{children}</dd></div>
const Dot = ({ hex }: { hex: string }) => <i className="cz-dotc cz-dotc-s" style={{ background: hex }} aria-hidden="true" />

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

type Build =
  | { status: 'idle' }
  | { status: 'building' }
  | { status: 'ready'; key: string; file: RequestFile }
  | { status: 'error'; message: string }

const originText = (d: RequestDocument) =>
  d.origin.kind === 'catalog-custom' && d.origin.baseName ? `${d.origin.label} · ${d.origin.baseName}` : d.origin.label

export default function CustomizationSummary({ onGo }: { onGo: (i: number) => void }) {
  const config = useCustomizerStore((s) => s.config)
  const request = useCustomizerStore((s) => s.request)
  const prepareRequest = useCustomizerStore((s) => s.prepareRequest)
  const markContacted = useCustomizerStore((s) => s.markContacted)
  const reset = useCustomizerStore((s) => s.reset)
  const notify = useStore((s) => s.notify)

  const quote = useMemo(() => computeQuote(config), [config])
  const [stamp] = useState(() => new Date().toISOString())
  const [format, setFormat] = useState<RequestFormat | null>(null)
  const [build, setBuild] = useState<Build>({ status: 'idle' })
  const [attempt, setAttempt] = useState(0)
  const [contact, setContact] = useState<{ url: string; note: string } | null>(null)
  const [problem, setProblem] = useState('')

  const complete = firstInvalidStep(config) === STEPS.length - 1 && quote.totalFlowers > 0

  // Lo que se ve aquí sale del mismo modelo que el TXT, el PDF y el mensaje de WhatsApp.
  const doc = useMemo(
    () => buildRequestDocument(config, quote, request?.id ?? '', request?.createdAt ?? stamp),
    [config, quote, request?.id, request?.createdAt, stamp],
  )

  // La solicitud (referencia + foto de la configuración) se prepara al llegar al resumen y se invalida con cualquier cambio.
  useEffect(() => {
    if (complete && !useCustomizerStore.getState().request) prepareRequest()
  }, [complete, request, prepareRequest])

  // El documento se genera en cuanto se elige el formato, ANTES de pulsar «Continuar»: así la descarga y la apertura
  // de WhatsApp ocurren dentro del gesto del clic y los bloqueadores de ventanas no intervienen.
  const reqId = request?.id
  useEffect(() => {
    const req = useCustomizerStore.getState().request
    if (!req || !format) { setBuild({ status: 'idle' }); return }
    let cancelled = false
    setBuild({ status: 'building' })
    createRequestFile(req, format)
      .then((file) => { if (!cancelled) setBuild({ status: 'ready', key: `${req.id}:${format}`, file }) })
      .catch((e: unknown) => { if (!cancelled) setBuild({ status: 'error', message: e instanceof Error ? e.message : 'Error desconocido.' }) })
    return () => { cancelled = true }
  }, [reqId, format, attempt])

  const ready = build.status === 'ready' && request && format && build.key === `${request.id}:${format}` ? build.file : null

  const message = (file: RequestFile) => buildWhatsAppMessage(doc, file.format, file.filename)

  const proceed = () => {
    setProblem('')
    const req = useCustomizerStore.getState().request
    if (!req || !ready || !format) return
    // Se valida la foto guardada: debe ser completa.
    if (firstInvalidStep(req.config) !== STEPS.length - 1 || req.quote.totalFlowers === 0) {
      setProblem('Tu solicitud está incompleta. Revisa los pasos pendientes.')
      return
    }
    const msg = message(ready)
    try {
      triggerDownload(ready.blob, ready.filename) // síncrono, dentro del clic
    } catch {
      setProblem('No se pudo descargar el documento. Inténtalo de nuevo.')
      return // sin descarga no hay despedida ni falsa confirmación
    }
    markContacted(format)
    setContact({ url: msg.url, note: attachInstructions(format, msg.includesDetail, ready.filename) })
  }

  const copy = async () => notify((await copyText(request?.text ?? '')) ? 'Resumen copiado ♡' : 'No se pudo copiar. Usa el archivo TXT.')

  const x = doc.delivery
  const w = doc.wrapping
  // Solo si el contacto se inició con el formato que está seleccionado ahora (si no, el aviso hablaría de otro archivo).
  const contacted = request?.status === 'contacted' && request.format === format && ready ? { format: ready.format, msg: message(ready) } : null
  const busy = build.status === 'building'
  const canGo = !!ready && !busy && complete

  return (
    <div className="cz-summary cz-sum2">
      <header className="cz-sum-head">
        <span className="cz-kicker">{originText(doc)}</span>
        <h3>{doc.bouquetName}</h3>
        {doc.summary && <p>{doc.summary}</p>}
        {request && <p className="cz-ref">Referencia <b>{request.id}</b></p>}
      </header>

      <div className="cz-sum-doc">
        <Block title="Composición" step="flores" onGo={onGo}>
          <Item k="Flores">
            <ul className="cz-list">
              {doc.flowers.map((f) => <li key={f.name}>{f.qty} × {f.name}</li>)}
              <li><b>{doc.totalFlowers} {doc.totalFlowers === 1 ? 'flor' : 'flores'} en total</b></li>
            </ul>
          </Item>
          <Item k="Forma">{doc.shape}</Item>
          <Item k="Colores">
            {doc.palettes.length ? (
              <span className="cz-inline-sw">{doc.palettes.map((p) => <span key={p.name}><Dot hex={p.hex} />{p.name}</span>)}</span>
            ) : none()}
          </Item>
        </Block>

        <Block title="Presentación" step="envoltorio" onGo={onGo}>
          <Item k="Papel"><span className="cz-pair"><Dot hex={w.paperColor.hex} /><span>{w.paper} · {w.paperColor.name.toLowerCase()} · {w.layers}</span></span></Item>
          <Item k="Cinta"><span className="cz-pair"><Dot hex={w.ribbonColor.hex} /><span>{w.ribbon} · {w.ribbonColor.name.toLowerCase()}</span></span></Item>
          <Item k="Lazo o moño">{w.finish}</Item>
          <Item k="Caja de regalo">{w.box}</Item>
        </Block>

        <Block title="Dedicatoria" step="tarjeta" onGo={onGo}>
          <Item k="Diseño de tarjeta">{doc.card.style}</Item>
          <Item k="Para">{doc.card.recipient || none()}</Item>
          <Item k="Mensaje">{doc.card.message ? <q className="cz-quote">{doc.card.message}</q> : none()}</Item>
          <Item k="De parte de">{doc.card.sender || none()}</Item>
        </Block>

        <Block title="Entrega y observaciones" step="detalles" onGo={onGo}>
          <Item k="Fecha deseada">{x.date ? <>{x.date} <small className="cz-soft">sujeta a confirmación</small></> : none(NOT_SPECIFIED_OPTIONAL)}</Item>
          <Item k="Presupuesto aproximado">{x.budget ?? none(NOT_SPECIFIED_OPTIONAL)}</Item>
          <Item k="Comentarios"><span className="cz-long">{x.notes || none(NOT_SPECIFIED_OPTIONAL)}</span></Item>
          <Item k="Preferencias"><span className="cz-long">{x.preferences || none(NOT_SPECIFIED_OPTIONAL)}</span></Item>
          <Item k="Restricciones"><span className="cz-long">{x.restrictions || none(NOT_SPECIFIED_OPTIONAL)}</span></Item>
        </Block>
      </div>

      <details className="cz-sec cz-sum-price" open>
        <summary><h3>Precio estimado</h3></summary>
        <FullBreakdown quote={quote} />
      </details>

      <section className={`cz-req cz-send ${contacted ? 'is-ready' : ''}`} aria-labelledby="cz-send-title">
        <h3 id="cz-send-title">¿Cómo quieres presentar tu solicitud?</h3>
        <p>Elige el formato del documento con los detalles de tu ramo. Lo descargarás y continuarás la conversación con ILATEY por WhatsApp.</p>

        <FormatSelector value={format} onChange={(f) => { setFormat(f); setProblem('') }} />

        {format && (
          <p className="cz-fmt-note" aria-live="polite">
            {format === 'pdf'
              ? 'Se descargará tu PDF y se abrirá WhatsApp con tu mensaje. Adjunta el documento tú mismo en la conversación: WhatsApp no permite hacerlo automáticamente.'
              : 'Se descargará tu TXT y se abrirá WhatsApp con tu mensaje. Si el detalle cabe, irá dentro del mensaje; si es muy extenso, adjunta el archivo tú mismo.'}
          </p>
        )}

        {build.status === 'error' && (
          <div className="cz-fmt-err">
            <Msg kind="error">No se pudo preparar tu {format === 'pdf' ? 'PDF' : 'TXT'}: {build.message} Inténtalo de nuevo o elige el otro formato.</Msg>
            <button type="button" className="cz-link strong" onClick={() => setAttempt((n) => n + 1)}><RefreshCw size={13} strokeWidth={1.8} aria-hidden="true" /> Reintentar</button>
          </div>
        )}
        {problem && <Msg kind="error">{problem}</Msg>}

        <button type="button" className="btn cz-wa" onClick={proceed} disabled={!canGo} aria-busy={busy}>
          {busy ? <Loader2 size={17} strokeWidth={1.8} className="cz-spin" aria-hidden="true" /> : <MessageCircle size={17} strokeWidth={1.8} aria-hidden="true" />}
          CONTINUAR POR WHATSAPP
        </button>
        <p className="cz-fine cz-wa-hint" role="status">
          {!format ? 'Elige un formato para continuar.' : busy ? `Preparando tu ${format === 'pdf' ? 'PDF' : 'TXT'}…` : ''}
        </p>
        <p className="cz-fine">
          Podrás compartir tu solicitud con el equipo de ILATEY para coordinar la atención, confirmar disponibilidad y continuar con el proceso de pago.
          Esto no es un pedido confirmado ni un pago: ILATEY te confirmará disponibilidad, precio final y fecha.
        </p>

        {contacted && (
          <div className="cz-contacted" role="status">
            <p><b>Ya iniciaste el contacto por WhatsApp</b> con la referencia {request?.id}. {attachInstructions(contacted.format, contacted.msg.includesDetail, ready?.filename ?? '')}</p>
            <div className="cz-req-actions">
              <a className="btn ghost" href={contacted.msg.url} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} strokeWidth={1.8} aria-hidden="true" /> Abrir WhatsApp de nuevo</a>
              {ready && <button type="button" className="btn ghost" onClick={() => triggerDownload(ready.blob, ready.filename)}><Download size={15} strokeWidth={1.8} aria-hidden="true" /> Descargar de nuevo</button>}
            </div>
          </div>
        )}

        <p className="cz-fine cz-more">
          <button type="button" className="cz-link" onClick={copy} disabled={!request}><Copy size={13} strokeWidth={1.8} aria-hidden="true" /> Copiar resumen</button>
          {' · '}
          ¿Cambias algo? Modifica cualquier sección y volverás a preparar tu solicitud.{' '}
          <button type="button" className="cz-link" onClick={() => { reset(); onGo(0) }}>Empezar un ramo nuevo</button>
        </p>
      </section>

      <AnimatePresence>
        {contact && <ContactTransition key="contact" url={contact.url} note={contact.note} onClose={() => setContact(null)} />}
      </AnimatePresence>
    </div>
  )
}
