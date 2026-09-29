import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('cakebar', {
  guardarArchivo: (opts: any) => ipcRenderer.invoke('guardar-archivo', opts)
})
