import { create } from 'zustand'
import type { BrowserState, BrowserTab } from '@/types'
import { createId } from '@/utils/cn'
import {
  getTitleForUrl,
  isNovaUrl,
  normalizeInputUrl,
  parseUrl,
  toNovaUrl,
} from '@/services/protocol'
import { guestApi } from '@/services/guestBridge'
import { downloadApi } from '@/services/downloadBridge'
import {
  appendHistory,
  loadBookmarks,
  loadDownloads,
  loadHistory,
  loadSession,
  saveBookmarks,
  saveDownloads,
  saveHistory,
  saveSession,
  type BookmarkEntry,
} from '@/services/storage'
import {
  DEFAULT_GX_LIMITS,
  loadGxLimits,
  normalizeGxLimits,
  saveGxLimits,
} from '@/services/gxLimits'

function createTab(url: string, isActive = true): BrowserTab {
  return {
    id: createId('tab'),
    title: getTitleForUrl(url),
    url,
    isActive,
    canGoBack: false,
    canGoForward: false,
    isLoading: false,
  }
}

async function syncGuestForTab(tab: BrowserTab | undefined): Promise<void> {
  if (!tab) {
    await guestApi.hide()
    return
  }

  const parsed = parseUrl(tab.url)
  if (parsed.kind === 'web') {
    await guestApi.attach(tab.id, parsed.href)
    return
  }

  await guestApi.hide()
}

function persistSession(tabs: BrowserTab[]): void {
  const active = tabs.find((tab) => tab.isActive)
  saveSession({
    activeTabId: active?.id ?? null,
    tabs: tabs.map((tab) => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favicon: tab.favicon,
      isPinned: tab.isPinned,
    })),
  })
}

function recordWebHistory(
  history: ReturnType<typeof loadHistory>,
  url: string,
  title: string,
): ReturnType<typeof loadHistory> {
  if (isNovaUrl(url) || url === 'about:blank') return history
  const parsed = parseUrl(url)
  if (parsed.kind !== 'web') return history
  return appendHistory(history, { url: parsed.href, title: title || getTitleForUrl(parsed.href) })
}

const initialUrl = toNovaUrl('newtab')

export const useBrowserStore = create<BrowserState>((set, get) => ({
  tabs: [createTab(initialUrl, true)],
  sidebarPinned: false,
  sidebarHovered: false,
  addressDraft: initialUrl,
  addressFocused: false,
  history: [],
  bookmarks: [],
  downloads: [],
  gxLimits: { ...DEFAULT_GX_LIMITS },
  hydrated: false,

  getActiveTab: () => get().tabs.find((tab) => tab.isActive),

  hydrate: () => {
    if (get().hydrated) return

    const history = loadHistory()
    const bookmarks = loadBookmarks()
    const downloads = loadDownloads()
    const session = loadSession()
    const gxLimits = loadGxLimits()

    let tabs = [createTab(initialUrl, true)]
    let addressDraft = initialUrl

    if (session?.tabs.length) {
      tabs = session.tabs.map((tab, index) => {
        const isActive =
          session.activeTabId != null
            ? tab.id === session.activeTabId
            : index === session.tabs.length - 1
        return {
          ...createTab(tab.url, isActive),
          id: tab.id,
          title: tab.title || getTitleForUrl(tab.url),
          favicon: tab.favicon,
          isPinned: tab.isPinned,
        }
      })

      if (!tabs.some((tab) => tab.isActive) && tabs[0]) {
        tabs = tabs.map((tab, index) => ({ ...tab, isActive: index === 0 }))
      }

      addressDraft = tabs.find((tab) => tab.isActive)?.url ?? initialUrl
    }

    set({
      history,
      bookmarks,
      downloads,
      gxLimits,
      tabs,
      addressDraft,
      hydrated: true,
    })

    void guestApi.setGxLimits(gxLimits)
    void syncGuestForTab(tabs.find((tab) => tab.isActive))
  },

  setGxLimits: (partial) => {
    const gxLimits = saveGxLimits(normalizeGxLimits({ ...get().gxLimits, ...partial }))
    set({ gxLimits })
    void guestApi.setGxLimits(gxLimits)
  },

  setActiveTab: (id) => {
    const tabs = get().tabs.map((tab) => ({
      ...tab,
      isActive: tab.id === id,
    }))
    const active = tabs.find((tab) => tab.id === id)
    set({
      tabs,
      addressDraft: active?.url ?? get().addressDraft,
      addressFocused: false,
    })
    persistSession(tabs)
    void syncGuestForTab(active)
  },

  addTab: (url = toNovaUrl('newtab')) => {
    const href = normalizeInputUrl(url)
    const newTab = createTab(href, true)
    const tabs = [...get().tabs.map((tab) => ({ ...tab, isActive: false })), newTab]
    set({
      tabs,
      addressDraft: href,
      addressFocused: href === toNovaUrl('newtab'),
    })
    persistSession(tabs)
    void syncGuestForTab(newTab)
  },

  closeTab: (id) => {
    void guestApi.destroy(id)

    const remaining = get().tabs.filter((tab) => tab.id !== id)
    if (remaining.length === 0) {
      const fallback = createTab(toNovaUrl('newtab'), true)
      set({ tabs: [fallback], addressDraft: fallback.url, addressFocused: true })
      persistSession([fallback])
      void syncGuestForTab(fallback)
      return
    }

    const closedWasActive = get().tabs.find((tab) => tab.id === id)?.isActive
    const nextTabs = closedWasActive
      ? remaining.map((tab, index) => ({
          ...tab,
          isActive: index === remaining.length - 1,
        }))
      : remaining

    const active = nextTabs.find((tab) => tab.isActive)
    set({
      tabs: nextTabs,
      addressDraft: active?.url ?? toNovaUrl('newtab'),
      addressFocused: false,
    })
    persistSession(nextTabs)
    void syncGuestForTab(active)
  },

  closeActiveTab: () => {
    const active = get().getActiveTab()
    if (active) get().closeTab(active.id)
  },

  cycleTab: (direction) => {
    const { tabs } = get()
    if (tabs.length < 2) return
    const index = tabs.findIndex((tab) => tab.isActive)
    const next = (index + direction + tabs.length) % tabs.length
    const target = tabs[next]
    if (target) get().setActiveTab(target.id)
  },

  navigateActiveTab: (url) => {
    const href = normalizeInputUrl(url)
    const active = get().getActiveTab()
    if (!active) return

    const previousWasWeb = !isNovaUrl(active.url)
    const nextIsWeb = !isNovaUrl(href)

    if (previousWasWeb && !nextIsWeb) {
      void guestApi.destroy(active.id)
    }

    const title = getTitleForUrl(href)
    const history = nextIsWeb ? recordWebHistory(get().history, href, title) : get().history

    const tabs = get().tabs.map((tab) =>
      tab.isActive
        ? {
            ...tab,
            url: href,
            title,
            favicon: nextIsWeb ? tab.favicon : undefined,
            canGoBack: false,
            canGoForward: false,
            isLoading: nextIsWeb,
          }
        : tab,
    )
    set({ tabs, addressDraft: href, addressFocused: false, history })
    persistSession(tabs)

    const nextActive = tabs.find((tab) => tab.isActive)
    if (nextIsWeb && nextActive) {
      void guestApi.navigate(nextActive.id, href)
      return
    }
    void syncGuestForTab(nextActive)
  },

  openInternalPage: (url) => {
    const href = normalizeInputUrl(url)
    const existing = get().tabs.find((tab) => tab.url === href)
    if (existing) {
      get().setActiveTab(existing.id)
      return
    }
    get().addTab(href)
  },

  setAddressDraft: (value) => set({ addressDraft: value }),

  setAddressFocused: (focused) => set({ addressFocused: focused }),

  submitAddress: () => {
    get().navigateActiveTab(get().addressDraft)
  },

  focusAddressBar: () => {
    set({ addressFocused: true })
    window.dispatchEvent(new CustomEvent('nova:focus-address'))
  },

  setSidebarPinned: (pinned) => set({ sidebarPinned: pinned }),

  setSidebarHovered: (hovered) => set({ sidebarHovered: hovered }),

  toggleSidebarPinned: () => set({ sidebarPinned: !get().sidebarPinned }),

  applyGuestNavigation: (update) => {
    const focused = get().addressFocused
    const previous = get().tabs.find((tab) => tab.id === update.tabId)
    const nextUrl = update.url || previous?.url || ''
    const nextTitle = update.title || previous?.title || getTitleForUrl(nextUrl)

    const shouldRecord =
      !update.isLoading && Boolean(nextUrl) && !isNovaUrl(nextUrl) && previous?.url !== nextUrl

    const history = shouldRecord
      ? recordWebHistory(get().history, nextUrl, nextTitle)
      : get().history

    const tabs = get().tabs.map((tab) =>
      tab.id === update.tabId
        ? {
            ...tab,
            url: nextUrl || tab.url,
            title: nextTitle || tab.title,
            favicon: update.favicon ?? tab.favicon,
            canGoBack: update.canGoBack,
            canGoForward: update.canGoForward,
            isLoading: update.isLoading,
          }
        : tab,
    )

    const active = tabs.find((tab) => tab.isActive)
    const shouldSyncAddress = active?.id === update.tabId && !focused

    set({
      tabs,
      history,
      addressDraft: shouldSyncAddress ? nextUrl || active.url : get().addressDraft,
    })
    persistSession(tabs)
  },

  goBack: () => {
    const active = get().getActiveTab()
    if (!active || isNovaUrl(active.url)) return
    void guestApi.goBack(active.id)
  },

  goForward: () => {
    const active = get().getActiveTab()
    if (!active || isNovaUrl(active.url)) return
    void guestApi.goForward(active.id)
  },

  reload: (ignoreCache = false) => {
    const active = get().getActiveTab()
    if (!active) return
    if (isNovaUrl(active.url)) {
      get().navigateActiveTab(active.url)
      return
    }
    void guestApi.reload(active.id, ignoreCache)
  },

  stopLoading: () => {
    const active = get().getActiveTab()
    if (!active || isNovaUrl(active.url)) return
    void guestApi.stop(active.id)
  },

  addBookmark: (input) => {
    const active = get().getActiveTab()
    const url = input?.url ?? active?.url
    if (!url || isNovaUrl(url)) return
    if (get().bookmarks.some((item) => item.url === url)) return

    const entry: BookmarkEntry = {
      id: createId('bm'),
      title: input?.title ?? active?.title ?? getTitleForUrl(url),
      url,
      createdAt: Date.now(),
    }
    const bookmarks = [entry, ...get().bookmarks]
    saveBookmarks(bookmarks)
    set({ bookmarks })
  },

  removeBookmark: (url) => {
    const bookmarks = get().bookmarks.filter((item) => item.url !== url)
    saveBookmarks(bookmarks)
    set({ bookmarks })
  },

  toggleBookmarkForActiveTab: () => {
    const active = get().getActiveTab()
    if (!active || isNovaUrl(active.url)) return
    if (get().isBookmarked(active.url)) {
      get().removeBookmark(active.url)
      return
    }
    get().addBookmark({ title: active.title, url: active.url })
  },

  isBookmarked: (url) => get().bookmarks.some((item) => item.url === url),

  clearHistory: () => {
    saveHistory([])
    set({ history: [] })
  },

  removeHistoryEntry: (id) => {
    const history = get().history.filter((item) => item.id !== id)
    saveHistory(history)
    set({ history })
  },

  upsertDownload: (entry) => {
    const existing = get().downloads
    const index = existing.findIndex((item) => item.id === entry.id)
    const downloads =
      index === -1
        ? [entry, ...existing]
        : existing.map((item, i) => (i === index ? { ...item, ...entry } : item))
    saveDownloads(downloads)
    set({ downloads })
  },

  removeDownload: (id) => {
    const downloads = get().downloads.filter((item) => item.id !== id)
    saveDownloads(downloads)
    set({ downloads })
  },

  clearDownloads: () => {
    saveDownloads([])
    set({ downloads: [] })
  },

  cancelDownload: (id) => {
    void downloadApi.cancel(id)
  },

  openDownload: (id) => {
    const item = get().downloads.find((entry) => entry.id === id)
    if (!item) return
    void downloadApi.open(id, item.savePath)
  },

  showDownloadInFolder: (id) => {
    const item = get().downloads.find((entry) => entry.id === id)
    if (!item) return
    void downloadApi.showInFolder(id, item.savePath)
  },
}))
