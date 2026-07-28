export type NovaPageId =
  | 'home'
  | 'newtab'
  | 'settings'
  | 'downloads'
  | 'history'
  | 'bookmarks'
  | 'workspace'
  | 'cloud'
  | 'docs'
  | 'ai'

export interface NovaPageDefinition {
  id: NovaPageId
  title: string
  /** Path segment after nova:// */
  path: string
}

export const NOVA_PROTOCOL = 'nova:' as const

export const NOVA_PAGES: Record<NovaPageId, NovaPageDefinition> = {
  home: { id: 'home', title: 'New Tab', path: 'home' },
  newtab: { id: 'newtab', title: 'New Tab', path: 'newtab' },
  settings: { id: 'settings', title: 'Settings', path: 'settings' },
  downloads: { id: 'downloads', title: 'Downloads', path: 'downloads' },
  history: { id: 'history', title: 'History', path: 'history' },
  bookmarks: { id: 'bookmarks', title: 'Bookmarks', path: 'bookmarks' },
  workspace: { id: 'workspace', title: 'Workspace', path: 'workspace' },
  cloud: { id: 'cloud', title: 'NovaCloud', path: 'cloud' },
  docs: { id: 'docs', title: 'NovaDocs', path: 'docs' },
  ai: { id: 'ai', title: 'Ryuk AI', path: 'ai' },
}

export type ParsedUrl =
  | { kind: 'nova'; page: NovaPageId; href: string }
  | { kind: 'web'; href: string }
  | { kind: 'invalid'; href: string }

export function toNovaUrl(page: NovaPageId): string {
  return `nova://${NOVA_PAGES[page].path}`
}

export function isNovaUrl(url: string): boolean {
  return /^nova:\/\//i.test(url.trim())
}

export function normalizeInputUrl(input: string): string {
  const value = input.trim()
  if (!value) return toNovaUrl('newtab')
  if (isNovaUrl(value)) return value.toLowerCase()
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value
  if (value.includes(' ') || !value.includes('.')) {
    return `https://www.google.com/search?q=${encodeURIComponent(value)}`
  }
  return `https://${value}`
}

export function parseUrl(url: string): ParsedUrl {
  const href = url.trim()
  if (!href) return { kind: 'invalid', href }

  if (isNovaUrl(href)) {
    const path = href.replace(/^nova:\/\//i, '').split(/[/?#]/)[0]?.toLowerCase() ?? ''
    const page = (Object.values(NOVA_PAGES).find((entry) => entry.path === path)?.id ??
      null) as NovaPageId | null

    if (!page) return { kind: 'invalid', href }
    return { kind: 'nova', page, href: toNovaUrl(page) }
  }

  try {
    const parsed = new URL(href.includes('://') ? href : `https://${href}`)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return { kind: 'web', href: parsed.toString() }
    }
  } catch {
    return { kind: 'invalid', href }
  }

  return { kind: 'invalid', href }
}

export function getTitleForUrl(url: string): string {
  const parsed = parseUrl(url)
  if (parsed.kind === 'nova') return NOVA_PAGES[parsed.page].title
  if (parsed.kind === 'web') {
    try {
      return new URL(parsed.href).hostname.replace(/^www\./, '')
    } catch {
      return 'Tab'
    }
  }
  return 'Tab'
}

/** Resolve which React page to render for a nova:// URL. */
export function resolveNovaPage(url: string): NovaPageId | null {
  const parsed = parseUrl(url)
  if (parsed.kind !== 'nova') return null
  if (parsed.page === 'home' || parsed.page === 'newtab') return 'newtab'
  return parsed.page
}
