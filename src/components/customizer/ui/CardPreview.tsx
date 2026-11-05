import type { CardDraft } from '../../../types/customization'

/** Vista previa de la tarjeta con el texto escrito. */
export default function CardPreview({ card }: { card: CardDraft }) {
  const empty = !card.recipient && !card.message && !card.sender
  return (
    <div className={`cz-card-pv cz-card-${card.style}`} aria-label="Vista previa de la tarjeta" role="group">
      {empty ? (
        <p className="cz-card-ph">Tu mensaje aparecerá aquí.</p>
      ) : (
        <>
          {card.recipient && <p className="cz-card-to">Para {card.recipient},</p>}
          {card.message && <p className="cz-card-msg">{card.message}</p>}
          {card.sender && <p className="cz-card-from">— {card.sender}</p>}
        </>
      )}
    </div>
  )
}
