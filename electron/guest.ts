import { BrowserView, type BrowserWindow, type Rectangle } from 'electron'

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

export type GuestGxLimits = {
  cpu: number
  ram: number
  network: number
}

type GuestListener = (state: GuestNavigationState) => void
type OpenUrlListener = (request: GuestOpenUrlRequest) => void

const guests = new Map<string, BrowserView>()
const favicons = new Map<string, string>()
const debuggerAttached = new Set<string>()
let activeTabId: string | null = null
let lastBounds: Rectangle = { x: 0, y: 0, width: 0, height: 0 }
let hostWindow: BrowserWindow | null = null
let gxLimits: GuestGxLimits = { cpu: 100, ram: 100, network: 100 }
const listeners = new Set<GuestListener>()
const openUrlListeners = new Set<OpenUrlListener>()

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 100
  return Math.min(100, Math.max(0, Math.round(value)))
}

function networkConditionsFromLimit(network: number): {
  offline: boolean
  latency: number
  downloadThroughput: number
  uploadThroughput: number
} {
  const value = clampPercent(network)
  if (value <= 0) {
    return { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 }
  }
  if (value >= 100) {
    return { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }
  }
  const factor = value / 100
  return {
    offline: false,
    latency: Math.round((100 - value) * 3),
    downloadThroughput: Math.max(8_000, Math.round(10_000_000 * factor ** 2)),
    uploadThroughput: Math.max(4_000, Math.round(2_000_000 * factor ** 2)),
  }
}

function shouldPruneInactiveGuests(): boolean {
  return gxLimits.cpu < 100 || gxLimits.ram < 100
}

function pruneInactiveGuests(): void {
  if (!shouldPruneInactiveGuests()) return
  for (const tabId of [...guests.keys()]) {
    if (tabId === activeTabId) continue
    destroyGuest(tabId)
  }
}

async function applyNetworkToView(tabId: string, view: BrowserView): Promise<void> {
  const wc = view.webContents
  if (wc.isDestroyed()) return

  try {
    if (!debuggerAttached.has(tabId)) {
      try {
        wc.debugger.attach('1.3')
      } catch {
        // already attached
      }
      debuggerAttached.add(tabId)
      await wc.debugger.sendCommand('Network.enable')
    }

    const conditions = networkConditionsFromLimit(gxLimits.network)
    await wc.debugger.sendCommand('Network.emulateNetworkConditions', {
      offline: conditions.offline,
      latency: conditions.latency,
      downloadThroughput: conditions.downloadThroughput,
      uploadThroughput: conditions.uploadThroughput,
      connectionType: conditions.offline ? 'none' : 'cellular4g',
    })
  } catch {
    // CDP unavailable for this guest — ignore
  }
}

function detachDebugger(tabId: string, view: BrowserView): void {
  if (!debuggerAttached.has(tabId)) return
  debuggerAttached.delete(tabId)
  try {
    if (!view.webContents.isDestroyed() && view.webContents.debugger.isAttached()) {
      view.webContents.debugger.detach()
    }
  } catch {
    // already detached
  }
}

export function setGuestGxLimits(limits: GuestGxLimits): GuestGxLimits {
  gxLimits = {
    cpu: clampPercent(limits.cpu),
    ram: clampPercent(limits.ram),
    network: clampPercent(limits.network),
  }
  pruneInactiveGuests()
  if (activeTabId) {
    const view = guests.get(activeTabId)
    if (view) void applyNetworkToView(activeTabId, view)
  }
  return gxLimits
}

export function getGuestGxLimits(): GuestGxLimits {
  return { ...gxLimits }
}
function emit(tabId: string): void {
  const view = guests.get(tabId)
  if (!view || view.webContents.isDestroyed()) return

  const wc = view.webContents
  const state: GuestNavigationState = {
    tabId,
    url: wc.getURL() || 'about:blank',
    title: wc.getTitle() || 'New Tab',
    favicon: favicons.get(tabId),
    canGoBack: wc.navigationHistory.canGoBack(),
    canGoForward: wc.navigationHistory.canGoForward(),
    isLoading: wc.isLoading(),
  }

  for (const listener of listeners) {
    listener(state)
  }
}

function detachAllExcept(tabId: string | null): void {
  if (!hostWindow) return
  for (const [id, view] of guests) {
    if (id === tabId) continue
    try {
      hostWindow.removeBrowserView(view)
    } catch {
      // already detached
    }
  }
}

function attachEvents(tabId: string, view: BrowserView): void {
  const wc = view.webContents
  const refresh = () => emit(tabId)

  wc.on('did-navigate', refresh)
  wc.on('did-navigate-in-page', refresh)
  wc.on('page-title-updated', refresh)
  wc.on('did-start-loading', refresh)
  wc.on('did-stop-loading', refresh)
  wc.on('did-fail-load', refresh)
  wc.on('page-favicon-updated', (_event, urls) => {
    const icon = urls[0]
    if (icon) {
      favicons.set(tabId, icon)
      emit(tabId)
    }
  })

  wc.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      for (const listener of openUrlListeners) {
        listener({ url })
      }
    }
    return { action: 'deny' }
  })
}

export function setGuestHostWindow(win: BrowserWindow | null): void {
  hostWindow = win
  if (!win) {
    for (const tabId of [...guests.keys()]) {
      destroyGuest(tabId)
    }
    activeTabId = null
  }
}

export function onGuestNavigation(listener: GuestListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function onGuestOpenUrl(listener: OpenUrlListener): () => void {
  openUrlListeners.add(listener)
  return () => openUrlListeners.delete(listener)
}

export function setGuestBounds(bounds: Rectangle): void {
  lastBounds = bounds
  if (!activeTabId) return
  const view = guests.get(activeTabId)
  if (!view || !hostWindow) return
  if (bounds.width < 1 || bounds.height < 1) return
  view.setBounds(bounds)
}

function ensureGuest(tabId: string): BrowserView | null {
  if (!hostWindow) return null

  let view = guests.get(tabId)
  if (view) return view

  view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      javascript: true,
    },
  })
  guests.set(tabId, view)
  attachEvents(tabId, view)
  void applyNetworkToView(tabId, view)
  return view
}

/** Attach guest for tab: create if needed, load only when URL differs, then show. */
export function attachGuest(tabId: string, url: string): void {
  const view = ensureGuest(tabId)
  if (!view) return

  const current = view.webContents.getURL()
  const needsLoad =
    !current ||
    current === 'about:blank' ||
    normalizeComparable(current) !== normalizeComparable(url)

  if (needsLoad) {
    void view.webContents.loadURL(url)
  }

  showGuest(tabId)
}

export function destroyGuest(tabId: string): void {
  const view = guests.get(tabId)
  if (!view) return

  if (hostWindow) {
    try {
      hostWindow.removeBrowserView(view)
    } catch {
      // already detached
    }
  }

  detachDebugger(tabId, view)

  if (!view.webContents.isDestroyed()) {
    view.webContents.close()
  }
  guests.delete(tabId)
  favicons.delete(tabId)

  if (activeTabId === tabId) {
    activeTabId = null
  }
}

export function showGuest(tabId: string): void {
  if (!hostWindow) return
  const view = guests.get(tabId)
  if (!view) return

  detachAllExcept(tabId)
  hostWindow.setBrowserView(view)
  activeTabId = tabId
  setGuestBounds(lastBounds)
  pruneInactiveGuests()
  void applyNetworkToView(tabId, view)
  emit(tabId)
}

export function hideGuest(): void {
  if (!hostWindow) {
    activeTabId = null
    return
  }

  detachAllExcept(null)
  activeTabId = null
}

export function navigateGuest(tabId: string, url: string): void {
  const view = ensureGuest(tabId)
  if (!view) return
  void view.webContents.loadURL(url)
  showGuest(tabId)
}

export function guestGoBack(tabId: string): void {
  const view = guests.get(tabId)
  if (view?.webContents.navigationHistory.canGoBack()) {
    view.webContents.navigationHistory.goBack()
  }
}

export function guestGoForward(tabId: string): void {
  const view = guests.get(tabId)
  if (view?.webContents.navigationHistory.canGoForward()) {
    view.webContents.navigationHistory.goForward()
  }
}

export function guestReload(tabId: string, ignoreCache = false): void {
  const view = guests.get(tabId)
  if (!view || view.webContents.isDestroyed()) return
  if (ignoreCache) {
    view.webContents.reloadIgnoringCache()
  } else {
    view.webContents.reload()
  }
}

export function guestStop(tabId: string): void {
  const view = guests.get(tabId)
  if (view && !view.webContents.isDestroyed()) {
    view.webContents.stop()
  }
}

function normalizeComparable(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return url
  }
}
