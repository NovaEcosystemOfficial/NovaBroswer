export type TabId = string

export interface BrowserTab {
  id: TabId
  title: string
  url: string
  favicon?: string
  isActive: boolean
  isPinned?: boolean
  /** Draft text in the address bar while editing */
  addressDraft?: string
}

export interface FavoriteSite {
  id: string
  title: string
  url: string
}

export interface RecentActivity {
  id: string
  title: string
  url: string
  timestamp: string
}

export interface BrowserState {
  tabs: BrowserTab[]
  sidebarPinned: boolean
  sidebarHovered: boolean
  addressDraft: string

  getActiveTab: () => BrowserTab | undefined
  setActiveTab: (id: TabId) => void
  addTab: (url?: string) => void
  closeTab: (id: TabId) => void
  navigateActiveTab: (url: string) => void
  openInternalPage: (url: string) => void
  setAddressDraft: (value: string) => void
  submitAddress: () => void
  setSidebarPinned: (pinned: boolean) => void
  setSidebarHovered: (hovered: boolean) => void
  toggleSidebarPinned: () => void
}
