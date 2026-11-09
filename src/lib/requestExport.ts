import type { PurchaseRequest, RequestFormat } from '../types/customization'
import { buildRequestDocument } from './requestDocument'

export interface RequestFile {
  format: RequestFormat
  blob: Blob
  filename: string
}

/**
 * Genera el archivo de una solicitud ya preparada. TXT y PDF salen de la MISMA foto (request.config + request.quote)
 * y del mismo RequestDocument, con la misma referencia. El PDF se carga bajo demanda (pdf-lib y tipografías).
 * Si algo falla lanza un Error: quien llama NO debe continuar ni mostrar un éxito.
 */
export async function createRequestFile(request: PurchaseRequest, format: RequestFormat): Promise<RequestFile> {
  const doc = buildRequestDocument(request.config, request.quote, request.id, request.createdAt)

  if (format === 'txt') {
    // BOM para que el Bloc de notas de Windows reconozca UTF-8 (tildes, «», “”).
    const blob = new Blob(['\uFEFF', request.text], { type: 'text/plain;charset=utf-8' })
    return { format, blob, filename: `${doc.fileBase}.txt` }
  }

  const [{ renderRequestPdf }, assets] = await Promise.all([import('./pdf/renderRequestPdf'), import('./pdf/pdfAssets')])
  const [fonts, bouquetPng] = await Promise.all([assets.loadPdfFonts(), assets.rasterizeBouquet(request.config)])
  const bytes = await renderRequestPdf(doc, { fonts, bouquetPng })
  return { format, blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }), filename: `${doc.fileBase}.pdf` }
}
