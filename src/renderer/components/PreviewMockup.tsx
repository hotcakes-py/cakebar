import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import type { TipoCodigo } from '../lib/barcodes'

export type Producto = 'botella' | 'caja' | 'lata' | 'frasco'
export const PRODUCTOS: Producto[] = ['botella', 'caja', 'lata', 'frasco']

function Silueta({ p }: { p: Producto }) {
  const fill = '#101010'
  const stroke = '#4a4a4a'
  const common = { fill, stroke, strokeWidth: 2 }
  if (p === 'botella') return (
    <svg width="220" height="320" viewBox="0 0 220 320">
      <rect x="92" y="8" width="36" height="22" rx="3" {...common} />
      <path d="M92 30 L86 60 L86 90 Q86 100 96 100 L124 100 Q134 100 134 90 L134 60 L128 30 Z" {...common} />
      <rect x="60" y="100" width="100" height="200" rx="18" {...common} />
    </svg>
  )
  if (p === 'caja') return (
    <svg width="240" height="260" viewBox="0 0 240 260">
      <rect x="30" y="60" width="180" height="170" rx="6" {...common} />
      <line x1="30" y1="95" x2="210" y2="95" stroke="#4a4a4a" strokeWidth={2} />
      <line x1="120" y1="60" x2="120" y2="230" stroke="#4a4a4a" strokeWidth={2} />
      <rect x="70" y="20" width="100" height="40" rx="4" {...common} />
    </svg>
  )
  if (p === 'lata') return (
    <svg width="180" height="300" viewBox="0 0 180 300">
      <ellipse cx="90" cy="30" rx="55" ry="16" {...common} />
      <rect x="35" y="30" width="110" height="230" {...common} />
      <ellipse cx="90" cy="260" rx="55" ry="16" {...common} />
    </svg>
  )
  return (
    <svg width="200" height="280" viewBox="0 0 200 280">
      <rect x="70" y="14" width="60" height="26" rx="6" {...common} />
      <path d="M70 40 L60 70 L60 90 L140 90 L140 70 L130 40 Z" {...common} />
      <rect x="40" y="90" width="120" height="170" rx="20" {...common} />
    </svg>
  )
}

interface Props {
  tipo: TipoCodigo
  valor: string
  producto: Producto
  alto: number
  anchoBarra: number
  mostrarTexto: boolean
  zoom: number
}

export default function PreviewMockup({ tipo, valor, producto, alto, anchoBarra, mostrarTexto, zoom }: Props) {
  const barRef = useRef<SVGSVGElement>(null)
  const qrRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (tipo === 'QR' && qrRef.current) {
      QRCode.toDataURL(valor, { width: 220, margin: 1 }).then((u) => { if (qrRef.current) qrRef.current.src = u }).catch(() => {})
    }
  }, [tipo, valor])

  useEffect(() => {
    if (tipo === 'QR' || !barRef.current || !valor) return
    try {
      const formatos: Record<string, string> = { CODE128: 'CODE128', CODE39: 'CODE39', EAN13: 'EAN13', EAN8: 'EAN8', UPCA: 'UPC', UPCE: 'UPCE', ITF14: 'ITF14', MSI: 'MSI', CODABAR: 'codabar' }
      JsBarcode(barRef.current, valor, {
        format: formatos[tipo] || 'CODE128',
        width: 1,
        height: 52,
        displayValue: false,
        margin: 4,
        background: '#ffffff',
        lineColor: '#000000'
      })
    } catch { /* se muestra error arriba */ }
  }, [tipo, valor, alto, anchoBarra])

  return (
    <div style={{ position: 'relative', transform: `scale(${zoom})`, transformOrigin: 'center' }}>
      <Silueta p={producto} />
      {/* Etiqueta incrustada dentro del cuerpo, con curva cilindrica */}
      <div style={{
        position: 'absolute', left: '50%',
        top: producto === 'lata' ? '50%' : producto === 'caja' ? '60%' : '59%',
        transform: 'translate(-50%,-50%)',
        width: producto === 'caja' ? 148 : producto === 'frasco' ? 102 : producto === 'lata' ? 94 : 86,
        perspective: '260px'
      }}>
        <div className="etiqueta etiqueta-pegada">
          {tipo === 'QR'
            ? <><img ref={qrRef} alt="QR" style={{ width: '100%', display: 'block' }} /><div style={{ color: '#000', fontSize: 10, wordBreak: 'break-all', marginTop: 4 }}>{valor}</div></>
            : <><svg ref={barRef} style={{ width: '100%', display: 'block' }}></svg>{mostrarTexto && <div style={{ color: '#000', letterSpacing: 1, fontSize: 11, marginTop: 2 }}>{valor}</div>}</>}
          <div className="curva" />
        </div>
      </div>
    </div>
  )
}
