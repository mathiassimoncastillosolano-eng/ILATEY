import type { PurchaseRequest } from '../types/customization'

/**
 * Capa de integración para enviar solicitudes al canal comercial de ILATEY.
 *
 * HOY NO HAY NINGÚN CANAL CONECTADO: no existe backend, pasarela de pagos ni contacto verificado,
 * y no se inventan números, correos ni credenciales. Mientras no haya canal, la solicitud solo se
 * PREPARA (queda guardada en este dispositivo y se puede copiar o descargar).
 *
 * Para conectar uno (WhatsApp Business, correo, API, Google Sheets…): implementar RequestChannel
 * y registrarlo una vez al arrancar la app:
 *
 *   registerChannel({ id: 'api', label: 'Enviar a ILATEY', send: async (req) => { ... return { ok: true } } })
 *
 * La interfaz del configurador detecta el canal y habilita automáticamente el botón «Enviar solicitud».
 */

export type SendResult = { ok: true } | { ok: false; reason: string }

export interface RequestChannel {
  id: string
  label: string
  send: (request: PurchaseRequest) => Promise<SendResult>
}

let active: RequestChannel | null = null

export function registerChannel(channel: RequestChannel | null): void {
  active = channel
}

export const getActiveChannel = (): RequestChannel | null => active
