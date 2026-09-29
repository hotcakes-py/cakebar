import { useState } from 'react'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'

declare global { interface Window { cakebar?: { guardarArchivo: (o: any) => Promise<string | null> } } }

async function guardar(nombre: string, dataUrl: string, ext: string) {
  const filtros = ext === 'png' ? [{ name: 'PNG', extensions: ['png'] }] : ext === 'svg' ? [{ name: 'SVG', extensions: ['svg'] }] : [{ name: 'PDF', extensions: ['pdf'] }]
  if (window.cakebar) {
    await window.cakebar.guardarArchivo({ nombre, filtros, datosBase64: dataUrl })
  } else {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = nombre
    a.click()
  }
}

export async function exportarPNG(tipo: string, valor: string) {
  if (tipo === 'QR') {
    const url = await QRCode.toDataURL(valor, { width: 600, margin: 2 })
    await guardar(`cakebar-${valor}.png`, url, 'png')
    return
  }
  const c = document.createElement('canvas')
  const formatos: Record<string, string> = { CODE128: 'CODE128', CODE39: 'CODE39', EAN13: 'EAN13', EAN8: 'EAN8', UPCA: 'UPC', UPCE: 'UPCE', ITF14: 'ITF14', MSI: 'MSI', CODABAR: 'codabar' }
  JsBarcode(c, valor, { format: formatos[tipo] || 'CODE128', width: 2, height: 120, displayValue: true })
  await guardar(`cakebar-${valor}.png`, c.toDataURL('image/png'), 'png')
}

export async function exportarSVG(tipo: string, valor: string) {
  if (tipo === 'QR') {
    const s = await QRCode.toString(valor, { type: 'svg' })
    await guardar(`cakebar-${valor}.svg`, 'data:image/svg+xml;base64,' + btoa(s), 'svg')
    return
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const formatos: Record<string, string> = { CODE128: 'CODE128', CODE39: 'CODE39', EAN13: 'EAN13', EAN8: 'EAN8', UPCA: 'UPC', UPCE: 'UPCE', ITF14: 'ITF14', MSI: 'MSI', CODABAR: 'codabar' }
  JsBarcode(svg as any, valor, { format: formatos[tipo] || 'CODE128' })
  const s = new XMLSerializer().serializeToString(svg)
  await guardar(`cakebar-${valor}.svg`, 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s))), 'svg')
}

export async function exportarPDF(tipo: string, valor: string) {
  const pdf = new jsPDF()
  pdf.setFontSize(16)
  pdf.text('CakeBar', 10, 15)
  pdf.setFontSize(11)
  pdf.text(`${tipo}: ${valor}`, 10, 24)
  if (tipo === 'QR') {
    const url = await QRCode.toDataURL(valor, { width: 400 })
    pdf.addImage(url, 'PNG', 10, 30, 80, 80)
  } else {
    const c = document.createElement('canvas')
    const formatos: Record<string, string> = { CODE128: 'CODE128', CODE39: 'CODE39', EAN13: 'EAN13', EAN8: 'EAN8', UPCA: 'UPC', UPCE: 'UPCE', ITF14: 'ITF14', MSI: 'MSI', CODABAR: 'codabar' }
    JsBarcode(c, valor, { format: formatos[tipo] || 'CODE128' })
    pdf.addImage(c.toDataURL('image/png'), 'PNG', 10, 30, 120, 50)
    const qr = await QRCode.toDataURL(valor, { width: 200 })
    pdf.addImage(qr, 'PNG', 140, 30, 40, 40)
    pdf.text('QR mismo valor', 140, 75)
  }
  const out = pdf.output('datauristring')
  await guardar(`cakebar-${valor}.pdf`, out, 'pdf')
}

export function useExportar() {
  const [msg, setMsg] = useState('')
  const run = async (fn: () => Promise<void>) => {
    try { await fn(); setMsg('Guardado OK') } catch (e: any) { setMsg('Error: ' + e.message) }
    setTimeout(() => setMsg(''), 2500)
  }
  return { msg, run }
}
