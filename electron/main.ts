import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  attachGuest,
  destroyGuest,
  guestGoBack,
  guestGoForward,
  guestReload,
  guestStop,
  hideGuest,
  navigateGuest,
  onGuestNavigation,
  onGuestOpenUrl,
  setGuestBounds,
  setGuestHostWindow,
  showGuest,
} from './guest'
import {
  cancelDownload,
  getDownloadsPath,
  openDownload,
  registerDownloadHandlers,
  showDownloadInFolder,
} from './downloads'

const __dirname = dirname(fileURLToPath(import.meta.url))

process.env.DIST = join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(__dirname, '../public')

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const isMac = process.platform === 'darwin'

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'NovaBrowser',
    backgroundColor: '#0B0D12',
    show: false,
    ...(isMac
      ? {
          titleBarStyle: 'hiddenInset' as const,
          trafficLightPosition: { x: 16, y: 16 },
        }
      : {
          frame: true,
        }),
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  setGuestHostWindow(mainWindow)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    setGuestHostWindow(null)
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(process.env.DIST!, 'index.html'))
  }
}

function registerGuestIpc(): void {
  ipcMain.handle('guest:attach', (_event, tabId: string, url: string) => {
    attachGuest(tabId, url)
  })

  ipcMain.handle('guest:destroy', (_event, tabId: string) => {
    destroyGuest(tabId)
  })

  ipcMain.handle('guest:show', (_event, tabId: string) => {
    showGuest(tabId)
  })

  ipcMain.handle('guest:hide', () => {
    hideGuest()
  })

  ipcMain.handle('guest:navigate', (_event, tabId: string, url: string) => {
    navigateGuest(tabId, url)
  })

  ipcMain.handle('guest:go-back', (_event, tabId: string) => {
    guestGoBack(tabId)
  })

  ipcMain.handle('guest:go-forward', (_event, tabId: string) => {
    guestGoForward(tabId)
  })

  ipcMain.handle('guest:reload', (_event, tabId: string, ignoreCache?: boolean) => {
    guestReload(tabId, Boolean(ignoreCache))
  })

  ipcMain.handle('guest:stop', (_event, tabId: string) => {
    guestStop(tabId)
  })

  ipcMain.handle(
    'guest:set-bounds',
    (
      _event,
      bounds: { x: number; y: number; width: number; height: number },
    ) => {
      setGuestBounds({
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
      })
    },
  )

  onGuestNavigation((state) => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send('guest:navigation', state)
    }
  })

  onGuestOpenUrl((request) => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send('guest:open-url', request)
    }
  })
}

function registerDownloadIpc(): void {
  registerDownloadHandlers()

  ipcMain.handle('download:cancel', (_event, id: string) => cancelDownload(id))
  ipcMain.handle('download:open', async (_event, id: string, savePath: string) =>
    openDownload(id, savePath),
  )
  ipcMain.handle('download:show-in-folder', (_event, id: string, savePath: string) =>
    showDownloadInFolder(id, savePath),
  )
  ipcMain.handle('download:get-path', () => getDownloadsPath())
}

app.whenReady().then(() => {
  registerGuestIpc()
  registerDownloadIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
