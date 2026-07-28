import { create } from 'zustand'
import type { BrowserState, BrowserTab } from '@/types'
import { createId } from '@/utils/cn'
import { getTitleForUrl, normalizeInputUrl, toNovaUrl } from '@/services/protocol'

function createTab(url: string, isActive = true): BrowserTab {
  return {
    id: createId('tab'),
    title: getTitleForUrl(url),
    url,
    isActive,
  }
}

const initialUrl = toNovaUrl('newtab')

export const useBrowserStore = create<BrowserState>((set, get) => ({
  tabs: [createTab(initialUrl, true)],
  sidebarPinned: false,
  sidebarHovered: false,
  addressDraft: initialUrl,

  getActiveTab: () => get().tabs.find((tab) => tab.isActive),

  setActiveTab: (id) => {
    const tabs = get().tabs.map((tab) => ({
      ...tab,
      isActive: tab.id === id,
    }))
    const active = tabs.find((tab) => tab.id === id)
    set({
      tabs,
      addressDraft: active?.url ?? get().addressDraft,
    })
  },

  addTab: (url = toNovaUrl('newtab')) => {
    const href = normalizeInputUrl(url)
    const newTab = createTab(href, true)
    set({
      tabs: [...get().tabs.map((tab) => ({ ...tab, isActive: false })), newTab],
      addressDraft: href,
    })
  },

  closeTab: (id) => {
    const remaining = get().tabs.filter((tab) => tab.id !== id)
    if (remaining.length === 0) {
      const fallback = createTab(toNovaUrl('newtab'), true)
      set({ tabs: [fallback], addressDraft: fallback.url })
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
    })
  },

  navigateActiveTab: (url) => {
    const href = normalizeInputUrl(url)
    const tabs = get().tabs.map((tab) =>
      tab.isActive
        ? {
            ...tab,
            url: href,
            title: getTitleForUrl(href),
          }
        : tab,
    )
    set({ tabs, addressDraft: href })
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

  submitAddress: () => {
    get().navigateActiveTab(get().addressDraft)
  },

  setSidebarPinned: (pinned) => set({ sidebarPinned: pinned }),

  setSidebarHovered: (hovered) => set({ sidebarHovered: hovered }),

  toggleSidebarPinned: () => set({ sidebarPinned: !get().sidebarPinned }),
}))
