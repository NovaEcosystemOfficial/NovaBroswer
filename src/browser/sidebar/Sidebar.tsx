import type { LucideIcon } from 'lucide-react'
import {
  Bookmark,
  Clock,
  Download,
  Home,
  LayoutGrid,
  Settings,
} from 'lucide-react'
import { useBrowserStore } from '@/store/browserStore'
import { toNovaUrl, type NovaPageId } from '@/services/protocol'
import { cn } from '@/utils/cn'

interface NavItem {
  page: NovaPageId
  label: string
  icon: LucideIcon
}

/** Browser features only — Nova services live on New Tab / nova:// tabs. */
const NAV_ITEMS: NavItem[] = [
  { page: 'newtab', label: 'New Tab', icon: Home },
  { page: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { page: 'history', label: 'History', icon: Clock },
  { page: 'downloads', label: 'Downloads', icon: Download },
  { page: 'workspace', label: 'Workspace', icon: LayoutGrid },
  { page: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pinned = useBrowserStore((s) => s.sidebarPinned)
  const hovered = useBrowserStore((s) => s.sidebarHovered)
  const setHovered = useBrowserStore((s) => s.setSidebarHovered)
  const openInternalPage = useBrowserStore((s) => s.openInternalPage)
  const activeUrl = useBrowserStore((s) => s.tabs.find((t) => t.isActive)?.url ?? '')

  const expanded = pinned || hovered

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'no-drag relative z-30 flex h-full shrink-0 flex-col',
        'border-r border-white/[0.06] bg-[#0c0e13]',
        'transition-[width] duration-200 ease-out',
        expanded ? 'w-20' : 'w-11',
      )}
    >
      <nav className="flex flex-1 flex-col gap-0.5 px-1 pt-2 pb-2">
        {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
          const href = toNovaUrl(page)
          const isActive =
            activeUrl === href ||
            (page === 'newtab' &&
              (activeUrl === toNovaUrl('home') || activeUrl === toNovaUrl('newtab')))

          return (
            <button
              key={page}
              type="button"
              title={label}
              onClick={() => openInternalPage(href)}
              className={cn(
                'flex h-7 items-center gap-2 rounded-md px-1.5 text-left transition-colors',
                isActive
                  ? 'bg-white/[0.08] text-nova-text'
                  : 'text-nova-faint hover:bg-white/[0.04] hover:text-nova-muted',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
              {expanded && <span className="truncate text-[11px]">{label}</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
