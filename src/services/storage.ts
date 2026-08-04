import type { BrowserTab } from '@/types'
import { createId } from '@/utils/cn'

const KEYS = {
  history: 'novabrowser:history',
  bookmarks: 'novabrowser:bookmarks',
  session: 'novabrowser:session',
  downloads: 'novabrowser:downloads',
} as const

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

export interface SessionSnapshot {
  tabs: Array<Pick<BrowserTab, 'id' | 'title' | 'url' | 'favicon' | 'isPinned'>>
  activeTabId: string | null
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

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota / private mode — ignore
  }
}

export function loadHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>(KEYS.history, [])
}

export function saveHistory(entries: HistoryEntry[]): void {
  writeJson(KEYS.history, entries.slice(0, 300))
}

export function appendHistory(
  entries: HistoryEntry[],
  next: { title: string; url: string },
): HistoryEntry[] {
  const last = entries[0]
  if (last && last.url === next.url) {
    const updated = [
      { ...last, title: next.title || last.title, visitedAt: Date.now() },
      ...entries.slice(1),
    ]
    saveHistory(updated)
    return updated
  }

  const entry: HistoryEntry = {
    id: createId('hist'),
    title: next.title || next.url,
    url: next.url,
    visitedAt: Date.now(),
  }
  const updated = [entry, ...entries.filter((item) => item.url !== next.url)].slice(0, 300)
  saveHistory(updated)
  return updated
}

export function loadBookmarks(): BookmarkEntry[] {
  const stored = readJson<BookmarkEntry[] | null>(KEYS.bookmarks, null)
  if (stored) return stored

  const seeded: BookmarkEntry[] = [
    {
      id: createId('bm'),
      title: 'Google',
      url: 'https://www.google.com',
      createdAt: Date.now(),
    },
    {
      id: createId('bm'),
      title: 'Wikipedia',
      url: 'https://www.wikipedia.org',
      createdAt: Date.now(),
    },
    {
      id: createId('bm'),
      title: 'GitHub',
      url: 'https://github.com',
      createdAt: Date.now(),
    },
  ]
  saveBookmarks(seeded)
  return seeded
}

export function saveBookmarks(entries: BookmarkEntry[]): void {
  writeJson(KEYS.bookmarks, entries)
}

export function loadSession(): SessionSnapshot | null {
  return readJson<SessionSnapshot | null>(KEYS.session, null)
}

export function saveSession(snapshot: SessionSnapshot): void {
  writeJson(KEYS.session, snapshot)
}

export function loadDownloads(): DownloadEntry[] {
  return readJson<DownloadEntry[]>(KEYS.downloads, [])
}

export function saveDownloads(entries: DownloadEntry[]): void {
  const persisted = entries
    .filter((item) => item.state !== 'progressing')
    .slice(0, 200)
  writeJson(KEYS.downloads, persisted)
}

export function formatVisitedAt(visitedAt: number): string {
  const delta = Date.now() - visitedAt
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (delta < minute) return 'now'
  if (delta < hour) return `${Math.floor(delta / minute)}m`
  if (delta < day) return `${Math.floor(delta / hour)}h`
  if (delta < 2 * day) return 'Yesterday'
  return new Date(visitedAt).toLocaleDateString()
}
