export type TipoCodigo = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPCA' | 'UPCE' | 'ITF14' | 'MSI' | 'CODABAR' | 'QR'

export interface TipoInfo {
  id: TipoCodigo
  nombre: string
  ayuda: string
  ejemplo: string
  jsbarcodeFormat?: string
}

export const TIPOS: TipoInfo[] = [
  { id: 'CODE128', nombre: 'Code 128', ayuda: 'Letras y números. Ideal inventario.', ejemplo: 'CAKE-2024-001', jsbarcodeFormat: 'CODE128' },
  { id: 'CODE39', nombre: 'Code 39', ayuda: 'Mayúsculas, números, - . $ / + %.', ejemplo: 'CAKE39', jsbarcodeFormat: 'CODE39' },
  { id: 'EAN13', nombre: 'EAN-13', ayuda: '13 dígitos. Producto comercial.', ejemplo: '7501234567890', jsbarcodeFormat: 'EAN13' },
  { id: 'EAN8', nombre: 'EAN-8', ayuda: '8 dígitos. Envase pequeño.', ejemplo: '12345670', jsbarcodeFormat: 'EAN8' },
  { id: 'UPCA', nombre: 'UPC-A', ayuda: '12 dígitos. USA / Canadá.', ejemplo: '012345678905', jsbarcodeFormat: 'UPC' },
  { id: 'UPCE', nombre: 'UPC-E', ayuda: '8 dígitos comprimido.', ejemplo: '01234565', jsbarcodeFormat: 'UPCE' },
  { id: 'ITF14', nombre: 'ITF-14', ayuda: '14 dígitos. Caja / embalaje.', ejemplo: '17501234567890', jsbarcodeFormat: 'ITF14' },
  { id: 'MSI', nombre: 'MSI', ayuda: 'Solo números. Estantería.', ejemplo: '123456', jsbarcodeFormat: 'MSI' },
  { id: 'CODABAR', nombre: 'Codabar', ayuda: 'Números + A-D. Envíos / banco sangre.', ejemplo: 'A123456B', jsbarcodeFormat: 'codabar' },
  { id: 'QR', nombre: 'QR', ayuda: 'Texto, URL, WiFi. Sin límite estricto.', ejemplo: 'https://cakebar.app/p/001' }
]

export function validar(tipo: TipoCodigo, valor: string): string | null {
  const v = valor.trim()
  if (!v) return 'Escribe un valor.'
  switch (tipo) {
    case 'QR': return v.length > 500 ? 'QR muy largo (máx 500).' : null
    case 'CODE128': return /^[\x20-\x7E]+$/.test(v) ? null : 'Code128: solo ASCII imprimible.'
    case 'CODE39': return /^[A-Z0-9 \-\.\$\/\+\%]+$/i.test(v) ? null : 'Code39: A-Z 0-9 y - . $ / + % espacio.'
    case 'EAN13': return /^\d{12,13}$/.test(v) ? null : 'EAN-13: 12 o 13 dígitos.'
    case 'EAN8': return /^\d{7,8}$/.test(v) ? null : 'EAN-8: 7 u 8 dígitos.'
    case 'UPCA': return /^\d{11,12}$/.test(v) ? null : 'UPC-A: 11 o 12 dígitos.'
    case 'UPCE': return /^\d{6,8}$/.test(v) ? null : 'UPC-E: 6 a 8 dígitos.'
    case 'ITF14': return /^\d{13,14}$/.test(v) ? null : 'ITF-14: 13 o 14 dígitos.'
    case 'MSI': return /^\d+$/.test(v) ? null : 'MSI: solo números.'
    case 'CODABAR': return /^[A-D][0-9\-\$\:\/\.\+]+[A-D]$/i.test(v) ? null : 'Codabar: inicia/termina en A-D. Ej A123B.'
    default: return null
  }
}

export function aleatorio(tipo: TipoCodigo): string {
  const n = (l: number) => Array.from({ length: l }, () => Math.floor(Math.random() * 10)).join('')
  switch (tipo) {
    case 'EAN13': return n(12)
    case 'EAN8': return n(7)
    case 'UPCA': return n(11)
    case 'UPCE': return n(6)
    case 'ITF14': return n(13)
    case 'MSI': return n(6)
    case 'CODABAR': return `A${n(6)}B`
    case 'CODE39': return 'CAKE-' + n(4)
    case 'QR': return 'https://cakebar.app/p/' + n(4)
    default: return 'CAKE-' + n(5)
  }
}
