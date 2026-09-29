import { useMemo, useState } from 'react'
import './styles.css'
import { TIPOS, validar, aleatorio, type TipoCodigo } from './lib/barcodes'
import { exportarPNG, exportarSVG, exportarPDF, useExportar } from './lib/exportar'
import PreviewMockup, { PRODUCTOS, type Producto } from './components/PreviewMockup'

function IconoImpresora() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

export default function App() {
  const [tema, setTema] = useState<'oscuro' | 'claro'>('oscuro')
  const [tipo, setTipo] = useState<TipoCodigo>('CODE128')
  const [valor, setValor] = useState('')
  const [alto, setAlto] = useState(80)
  const [anchoBarra, setAnchoBarra] = useState(2)
  const [mostrarTexto, setMostrarTexto] = useState(true)
  const [producto, setProducto] = useState<Producto>('botella')
  const [zoom, setZoom] = useState(1)
  const { msg, run } = useExportar()

  const error = useMemo(() => (valor.trim() === '' ? null : validar(tipo, valor)), [tipo, valor])
  const tipoInfo = TIPOS.find((t) => t.id === tipo)!
  const listo = valor.trim() !== '' && !error

  const exportar = (fn: (t: string, v: string) => Promise<void>) => run(async () => {
    if (!listo) throw new Error('Escribe un valor válido primero.')
    await fn(tipo, valor.trim())
  })

  const imprimir = () => {
    if (!listo) return
    window.print()
  }

  const otroProducto = () => {
    const resto = PRODUCTOS.filter((p) => p !== producto)
    setProducto(resto[Math.floor(Math.random() * resto.length)])
  }

  return (
    <div data-tema={tema} style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="topbar">
        <div className="logo">Cake<span>Bar</span></div>
        <div className="tabs">
          <button className="activo">Crear</button>
        </div>
        <div className="top-acciones">
          <button className="btn mini" onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')}>{tema === 'oscuro' ? 'Claro' : 'Oscuro'}</button>
        </div>
      </div>

      <div className="contenido">
        <div className="col-izq">
          <div className="campo">
            <label>Tipo de código</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCodigo)}>
              {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            <div className="ayuda">{tipoInfo.ayuda} Ej: {tipoInfo.ejemplo}</div>
          </div>
          <div className="campo">
            <label>Valor</label>
            <input className="mono" value={valor} onChange={(e) => setValor(e.target.value)} placeholder={tipoInfo.ejemplo} autoFocus />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn mini" onClick={() => setValor(aleatorio(tipo))}>Aleatorio</button>
              <button className="btn mini" onClick={() => setValor('')}>Limpiar</button>
            </div>
            {valor.trim() === '' ? <div className="ayuda">Escribe el valor y aparecerá pegado en el producto.</div>
              : error ? <div className="error">{error}</div>
              : <div className="ayuda" style={{ color: 'var(--ok)' }}>Válido para {tipoInfo.nombre}</div>}
          </div>
          <details open>
            <summary>Apariencia</summary>
            <div className="grid2" style={{ marginTop: 10 }}>
              <div className="campo"><label>Alto {alto}px</label><input type="range" min={40} max={150} value={alto} onChange={(e) => setAlto(+e.target.value)} /></div>
              <div className="campo"><label>Grosor {anchoBarra}</label><input type="range" min={1} max={4} step={1} value={anchoBarra} onChange={(e) => setAnchoBarra(+e.target.value)} /></div>
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><input type="checkbox" style={{ width: 16 }} checked={mostrarTexto} onChange={(e) => setMostrarTexto(e.target.checked)} /> Mostrar texto bajo barras</label>
          </details>
        </div>

        <div className="col-der">
          <div className="mockup-wrap">
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
              <b>Visualización</b>
              <span style={{ flex: 1 }} />
              <button className="btn mini" title="Cambiar producto" onClick={otroProducto}>Cambiar: {producto}</button>
              <button className="btn mini btn-icono" title="Imprimir código" onClick={imprimir} disabled={!listo}>
                <IconoImpresora /> Imprimir
              </button>
            </div>
            <div className="mockup-escena print-area">
              {!listo ? (
                <div style={{ textAlign: 'center', color: '#8a8a8a' }}>
                  <div style={{ opacity: 0.6 }}><PreviewMockup tipo={tipo} valor="0000" producto={producto} alto={alto} anchoBarra={anchoBarra} mostrarTexto={false} zoom={zoom} /></div>
                  <div className="ayuda" style={{ marginTop: 10 }}>{valor.trim() === '' ? 'El código aparecerá pegado aquí cuando escribas el valor.' : error}</div>
                </div>
              ) : (
                <PreviewMockup tipo={tipo} valor={valor.trim()} producto={producto} alto={alto} anchoBarra={anchoBarra} mostrarTexto={mostrarTexto} zoom={zoom} />
              )}
            </div>
            <div className="fila no-print" style={{ marginTop: 12 }}>
              <div className="campo" style={{ margin: 0 }}><label>Zoom {Math.round(zoom * 100)}%</label><input type="range" min={0.5} max={1.6} step={0.1} value={zoom} onChange={(e) => setZoom(+e.target.value)} /></div>
            </div>
            <div className="barra-acciones no-print">
              <button className="btn primario" disabled={!listo} onClick={() => exportar(exportarPNG)}>PNG</button>
              <button className="btn" disabled={!listo} onClick={() => exportar(exportarSVG)}>SVG</button>
              <button className="btn" disabled={!listo} onClick={() => exportar(exportarPDF)}>PDF</button>
            </div>
            {msg && <div className="ayuda no-print" style={{ textAlign: 'center', marginTop: 8 }}>{msg}</div>}
            <div className="ayuda no-print" style={{ textAlign: 'center', marginTop: 4 }}>Etiqueta real: solo el barcode pegado al producto.</div>
          </div>
        </div>
      </div>

      <div className="statusbar no-print"><span>CakeBar listo</span><span>{tipo} {valor.trim() === '' ? '· vacío' : error ? '· error' : '· válido'}</span><span style={{ marginLeft: 'auto' }}>ES</span></div>
    </div>
  )
}
