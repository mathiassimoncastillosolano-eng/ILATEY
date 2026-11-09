import type { RequestFormat } from '../types/customization'
import type { RequestDocument } from './requestDocument'
import { renderRequestText } from './requestText'

/** Contacto comercial de ILATEY. */
export const WHATSAPP_PHONE = '51949265514' // +51 949265514, normalizado para wa.me
export const WHATSAPP_PHONE_LABEL = '+51 949265514'
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_PHONE}`

/** El mensaje SIEMPRE empieza con esta frase exacta. */
export const WHATSAPP_GREETING = 'Hola, estoy interesado en este ramo.'

/**
 * Longitud máxima (ya codificada para la URL) del texto precargado. Por encima, el mensaje se resume y el cliente
 * adjunta el TXT: las URL muy largas no son fiables entre navegadores y apps.
 */
export const WHATSAPP_MAX_ENCODED = 2500

export interface WhatsAppMessage {
  text: string
  url: string
  /** El detalle completo de la solicitud va dentro del mensaje (solo TXT corto). */
  includesDetail: boolean
}

const typeLine = (d: RequestDocument) =>
  d.origin.kind === 'catalog' ? `Tipo de ramo: ${d.origin.label}: ${d.bouquetName}.`
    : d.origin.kind === 'catalog-custom' ? `Tipo de ramo: Diseño personalizado a partir de ${d.origin.baseName}.`
      : 'Tipo de ramo: Diseño personalizado.'

export const whatsappUrl = (text: string) => `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(text)}`

/**
 * Mensaje precargado. Un enlace wa.me NO puede adjuntar archivos: con PDF el mensaje avisa que se adjuntará el documento
 * descargado; con TXT se incluye el detalle (versión compacta: mismos datos, precio resumido) si cabe, y si no, se resume y se remite al archivo.
 */
export function buildWhatsAppMessage(d: RequestDocument, format: RequestFormat, fileName: string): WhatsAppMessage {
  const head = [
    WHATSAPP_GREETING,
    'He preparado una solicitud en ILATEY Flower Studio.',
    `Referencia: ${d.reference}`,
    typeLine(d),
    d.delivery.dateShort ? `Fecha deseada de entrega: ${d.delivery.dateShort}.` : 'Fecha deseada de entrega: por coordinar.',
    `Formato de solicitud: ${format === 'pdf' ? 'PDF' : 'TXT'}.`,
  ]
  const closing = 'Quedo atento para coordinar los detalles y continuar con el proceso.'

  if (format === 'pdf') {
    const text = [...head, `Adjuntaré en esta conversación el documento ${fileName}.`, closing].join('\n')
    return { text, url: whatsappUrl(text), includesDetail: false }
  }

  const withDetail = [...head, '', 'Detalle de la solicitud:', renderRequestText(d, { compact: true }), '', closing].join('\n')
  if (encodeURIComponent(withDetail).length <= WHATSAPP_MAX_ENCODED) {
    return { text: withDetail, url: whatsappUrl(withDetail), includesDetail: true }
  }
  const summary = [...head, `El detalle completo está en el archivo ${fileName}, que adjuntaré en esta conversación.`, closing].join('\n')
  return { text: summary, url: whatsappUrl(summary), includesDetail: false }
}

/** Lo que el cliente debe hacer a mano después de abrir WhatsApp (WhatsApp no permite adjuntar desde un enlace). */
export function attachInstructions(format: RequestFormat, includesDetail: boolean, fileName: string): string {
  if (format === 'pdf') return `Tu PDF ya se descargó (${fileName}). Adjúntalo tú mismo en la conversación: WhatsApp no permite hacerlo automáticamente.`
  if (includesDetail) return `El detalle de tu solicitud ya va en el mensaje. Si quieres, adjunta también el TXT descargado (${fileName}).`
  return `Tu TXT ya se descargó (${fileName}). Adjúntalo tú mismo en la conversación: el detalle es muy extenso para ir en el mensaje.`
}
