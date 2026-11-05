import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { STEPS } from '../../data/customizationOptions'
import { EASE, products } from '../../data/products'
import { firstInvalidStep, validateStep } from '../../lib/customizerValidation'
import { usePageTitle } from '../../lib/usePageTitle'
import { useCustomizerStore } from '../../store/useCustomizerStore'
import BouquetPreview from './BouquetPreview'
import CustomizerNavigation from './CustomizerNavigation'
import CustomizerProgress from './CustomizerProgress'
import PriceSummary from './PriceSummary'
import SelectionChips from './SelectionChips'
import AdditionalDetails from './steps/AdditionalDetails'
import BouquetShapeSelection from './steps/BouquetShapeSelection'
import ColorSelection from './steps/ColorSelection'
import CustomizationSummary from './steps/CustomizationSummary'
import DedicationForm from './steps/DedicationForm'
import FlowerSelection from './steps/FlowerSelection'
import QuantitySelection from './steps/QuantitySelection'
import WrappingSelection from './steps/WrappingSelection'

function renderStep(index: number, onGo: (i: number) => void) {
  switch (STEPS[index].id) {
    case 'flores': return <FlowerSelection />
    case 'cantidad': return <QuantitySelection onGo={onGo} />
    case 'forma': return <BouquetShapeSelection />
    case 'colores': return <ColorSelection />
    case 'envoltorio': return <WrappingSelection />
    case 'tarjeta': return <DedicationForm />
    case 'detalles': return <AdditionalDetails />
    case 'resumen': return <CustomizationSummary onGo={onGo} />
  }
}

/** Configurador por pasos. Orquesta el estado y el diseño; cada paso vive en su propio componente. */
export default function BouquetCustomizer() {
  usePageTitle('Personaliza tu ramo')
  const reduce = useReducedMotion()
  const config = useCustomizerStore((s) => s.config)
  const storedStep = useCustomizerStore((s) => s.step)
  const previous = useCustomizerStore((s) => s.previous)
  const setStep = useCustomizerStore((s) => s.setStep)
  const reset = useCustomizerStore((s) => s.reset)
  const restorePrevious = useCustomizerStore((s) => s.restorePrevious)
  const dismissPrevious = useCustomizerStore((s) => s.dismissPrevious)

  const [dir, setDir] = useState(1)
  const [errorStep, setErrorStep] = useState<number | null>(null)
  const panel = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)

  const last = STEPS.length - 1
  const maxStep = firstInvalidStep(config)
  const step = Math.min(storedStep, maxStep)
  const errors = validateStep(STEPS[step].id, config)
  const missing = STEPS.slice(0, last).filter((s) => validateStep(s.id, config).length > 0).map((s) => s.label)
  const baseName = previous && config.baseProductId ? products.find((p) => p.id === config.baseProductId)?.name : null

  const go = (n: number) => {
    const target = Math.max(0, Math.min(n, maxStep))
    setDir(target >= step ? 1 : -1)
    moved.current = true
    setStep(target)
  }
  const next = () => (errors.length > 0 ? setErrorStep(step) : go(step + 1))

  // Al cambiar de paso (no al cargar): llevar la vista al panel y el foco al título.
  useEffect(() => {
    if (!moved.current) return
    panel.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    heading.current?.focus({ preventScroll: true })
  }, [step, reduce])

  return (
    <div className="cz">
      <div className="w">
        <header className="cz-top">
          <span className="eb">Personaliza tu ramo</span>
          <h1>Crea un ramo que cuente <em>tu historia.</em></h1>
          <p>Elige cada detalle y mira cómo toma forma. Tu diseño se guarda solo.</p>
        </header>

        {previous && (
          <div className="cz-banner" role="status">
            <span>{baseName ? <>Partimos de <b>{baseName}</b>. </> : null}Tu diseño anterior sigue guardado.</span>
            <span>
              <button type="button" className="cz-link strong" onClick={restorePrevious}>Recuperarlo</button>
              {' · '}
              <button type="button" className="cz-link" onClick={dismissPrevious}>Descartarlo</button>
            </span>
          </div>
        )}

        <div className="cz-grid">
          <div className="cz-main">
            <CustomizerProgress step={step} maxStep={maxStep} onGo={go} />
            <p className={`cz-status ${missing.length === 0 ? 'ok' : ''}`} aria-live="polite">
              {missing.length === 0 ? 'Diseño completo. Revísalo en el resumen.' : <>Te falta completar: <b>{missing.join(' · ')}</b></>}
            </p>

            <div className="cz-panel" ref={panel}>
              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 28 }),
                    center: { opacity: 1, x: 0 },
                    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -28 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
                >
                  <header className="cz-sh">
                    <p className="cz-kicker">Paso {step + 1} de {STEPS.length}</p>
                    <h2 ref={heading} tabIndex={-1}>{STEPS[step].title}</h2>
                    <p>{STEPS[step].lead}</p>
                  </header>
                  {renderStep(step, go)}
                </motion.div>
              </AnimatePresence>
            </div>

            <CustomizerNavigation
              step={step}
              last={last}
              errors={errors}
              showErrors={errorStep === step}
              onBack={() => go(step - 1)}
              onNext={next}
              onReset={reset}
            />
          </div>

          <aside className="cz-aside" aria-label="Vista previa y precio">
            <div className="cz-aside-card">
              <BouquetPreview config={config} />
              <SelectionChips config={config} />
            </div>
            <PriceSummary config={config} />
          </aside>
        </div>
      </div>
    </div>
  )
}
