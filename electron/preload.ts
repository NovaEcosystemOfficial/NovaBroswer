import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

export type GuestNavigationState = {
  tabId: string
  url: string
  title: string
  favicon?: string
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
}

export type GuestOpenUrlRequest = {
  url: string
}

export type GuestBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type DownloadSnapshot = {
  id: string
  filename: string
  url: string
  savePath: string
  receivedBytes: number
  totalBytes: number
  state: 'progressing' | 'completed' | 'cancelled' | 'interrupted'
  startedAt: number
  endedAt?: number
}

export type GxLimitsPayload = {
  cpu: number
  ram: number
  network: number
}

export type NovaBrowserAPI = {
  platform: NodeJS.Platform
  versions: {
    electron: string
    chrome: string
    node: string
  }
  guest: {
    attach: (tabId: string, url: string) => Promise<void>
    destroy: (tabId: string) => Promise<void>
    show: (tabId: string) => Promise<void>
    hide: () => Promise<void>
    navigate: (tabId: string, url: string) => Promise<void>
    goBack: (tabId: string) => Promise<void>
    goForward: (tabId: string) => Promise<void>
    reload: (tabId: string, ignoreCache?: boolean) => Promise<void>
    stop: (tabId: string) => Promise<void>
    setBounds: (bounds: GuestBounds) => Promise<void>
    setGxLimits: (limits: GxLimitsPayload) => Promise<GxLimitsPayload>
    getGxLimits: () => Promise<GxLimitsPayload>
    onNavigation: (callback: (state: GuestNavigationState) => void) => () => void
    onOpenUrl: (callback: (request: GuestOpenUrlRequest) => void) => () => void
  }
  downloads: {
    cancel: (id: string) => Promise<boolean>
    open: (id: string, savePath: string) => Promise<boolean>
    showInFolder: (id: string, savePath: string) => Promise<boolean>
    getPath: () => Promise<string>
    onUpdate: (callback: (item: DownloadSnapshot) => void) => () => void
  }
}

const api: NovaBrowserAPI = {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  guest: {
    attach: (tabId, url) => ipcRenderer.invoke('guest:attach', tabId, url),
    destroy: (tabId) => ipcRenderer.invoke('guest:destroy', tabId),
    show: (tabId) => ipcRenderer.invoke('guest:show', tabId),
    hide: () => ipcRenderer.invoke('guest:hide'),
    navigate: (tabId, url) => ipcRenderer.invoke('guest:navigate', tabId, url),
    goBack: (tabId) => ipcRenderer.invoke('guest:go-back', tabId),
    goForward: (tabId) => ipcRenderer.invoke('guest:go-forward', tabId),
    reload: (tabId, ignoreCache) => ipcRenderer.invoke('guest:reload', tabId, ignoreCache),
    stop: (tabId) => ipcRenderer.invoke('guest:stop', tabId),
    setBounds: (bounds) => ipcRenderer.invoke('guest:set-bounds', bounds),
    setGxLimits: (limits) => ipcRenderer.invoke('guest:set-gx-limits', limits),
    getGxLimits: () => ipcRenderer.invoke('guest:get-gx-limits'),
    onNavigation: (callback) => {
      const listener = (_event: IpcRendererEvent, state: GuestNavigationState) => {
        callback(state)
      }
      ipcRenderer.on('guest:navigation', listener)
      return () => {
        ipcRenderer.removeListener('guest:navigation', listener)
      }
    },
    onOpenUrl: (callback) => {
      const listener = (_event: IpcRendererEvent, request: GuestOpenUrlRequest) => {
        callback(request)
      }
      ipcRenderer.on('guest:open-url', listener)
      return () => {
        ipcRenderer.removeListener('guest:open-url', listener)
      }
    },
  },
  downloads: {
    cancel: (id) => ipcRenderer.invoke('download:cancel', id),
    open: (id, savePath) => ipcRenderer.invoke('download:open', id, savePath),
    showInFolder: (id, savePath) => ipcRenderer.invoke('download:show-in-folder', id, savePath),
    getPath: () => ipcRenderer.invoke('download:get-path'),
    onUpdate: (callback) => {
      const listener = (_event: IpcRendererEvent, item: DownloadSnapshot) => {
        callback(item)
      }
      ipcRenderer.on('download:update', listener)
      return () => {
        ipcRenderer.removeListener('download:update', listener)
      }
    },
  },
}

contextBridge.exposeInMainWorld('nova', api)
