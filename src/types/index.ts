export type TabId = string

export interface BrowserTab {
  id: TabId
  title: string
  url: string
  favicon?: string
  isActive: boolean
  isPinned?: boolean
  canGoBack?: boolean
  canGoForward?: boolean
  isLoading?: boolean
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

export interface GuestNavUpdate {
  tabId: TabId
  url: string
  title: string
  favicon?: string
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
}

export interface HistoryEntry {
  id: string
  title: string
  url: string
  visitedAt: number
}

export interface BookmarkEntry {
  id: string
  title: string
  url: string
  createdAt: number
}

export type GxLimits = {
  cpu: number
  ram: number
  network: number
}

export type DownloadState = 'progressing' | 'completed' | 'cancelled' | 'interrupted'

export interface DownloadEntry {
  id: string
  filename: string
  url: string
  savePath: string
  receivedBytes: number
  totalBytes: number
  state: DownloadState
  startedAt: number
  endedAt?: number
}

export interface BrowserState {
  tabs: BrowserTab[]
  sidebarPinned: boolean
  sidebarHovered: boolean
  addressDraft: string
  addressFocused: boolean
  history: HistoryEntry[]
  bookmarks: BookmarkEntry[]
  downloads: DownloadEntry[]
  gxLimits: GxLimits
  hydrated: boolean

  getActiveTab: () => BrowserTab | undefined
  hydrate: () => void
  setGxLimits: (limits: Partial<GxLimits>) => void
  setActiveTab: (id: TabId) => void
  addTab: (url?: string) => void
  closeTab: (id: TabId) => void
  closeActiveTab: () => void
  cycleTab: (direction: 1 | -1) => void
  navigateActiveTab: (url: string) => void
  openInternalPage: (url: string) => void
  setAddressDraft: (value: string) => void
  setAddressFocused: (focused: boolean) => void
  submitAddress: () => void
  focusAddressBar: () => void
  setSidebarPinned: (pinned: boolean) => void
  setSidebarHovered: (hovered: boolean) => void
  toggleSidebarPinned: () => void
  applyGuestNavigation: (update: GuestNavUpdate) => void
  goBack: () => void
  goForward: () => void
  reload: (ignoreCache?: boolean) => void
  stopLoading: () => void
  addBookmark: (input?: { title?: string; url?: string }) => void
  removeBookmark: (url: string) => void
  toggleBookmarkForActiveTab: () => void
  isBookmarked: (url: string) => boolean
  clearHistory: () => void
  removeHistoryEntry: (id: string) => void
  upsertDownload: (entry: DownloadEntry) => void
  removeDownload: (id: string) => void
  clearDownloads: () => void
  cancelDownload: (id: string) => void
  openDownload: (id: string) => void
  showDownloadInFolder: (id: string) => void
}
