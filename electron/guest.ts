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

type GuestListener = (state: GuestNavigationState) => void
type OpenUrlListener = (request: GuestOpenUrlRequest) => void

const guests = new Map<string, BrowserView>()
const favicons = new Map<string, string>()
let activeTabId: string | null = null
let lastBounds: Rectangle = { x: 0, y: 0, width: 0, height: 0 }
let hostWindow: BrowserWindow | null = null
const listeners = new Set<GuestListener>()
const openUrlListeners = new Set<OpenUrlListener>()

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
