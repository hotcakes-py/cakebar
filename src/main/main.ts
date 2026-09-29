import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { writeFile } from 'fs/promises'

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 1000,
    minHeight: 650,
    title: 'CakeBar',
    backgroundColor: '#1e1e1e',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('guardar-archivo', async (_e, opts: { nombre: string; filtros: any[]; datosBase64: string }) => {
  const win = BrowserWindow.getFocusedWindow()
  const res = await dialog.showSaveDialog(win!, {
    defaultPath: opts.nombre,
    filters: opts.filtros
  })
  if (res.canceled || !res.filePath) return null
  const buf = Buffer.from(opts.datosBase64.split(',').pop()!, 'base64')
  await writeFile(res.filePath, buf)
  shell.showItemInFolder(res.filePath)
  return res.filePath
})
