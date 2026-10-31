import { useBrowserStore } from '@/store/browserStore'
import { toNovaUrl } from '@/services/protocol'
import { NOVA_BRAND } from '@/utils/constants'
import { formatVisitedAt } from '@/services/storage'

const FALLBACK_SHORTCUTS = [
  { id: 'f1', title: 'Google', url: 'https://www.google.com' },
  { id: 'f2', title: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { id: 'f3', title: 'GitHub', url: 'https://github.com' },
]

const NOVA_LINKS = [
  { label: 'GX Control', url: toNovaUrl('gx') },
  { label: 'NovaCloud', url: toNovaUrl('cloud') },
  { label: 'NovaDocs', url: toNovaUrl('docs') },
  { label: 'Ryuk', url: toNovaUrl('ai') },
  { label: 'Workspace', url: toNovaUrl('workspace') },
] as const

/** Chrome-style New Tab — quiet, content-first, not a dashboard. */
export function NewTabPage() {
  const navigateActiveTab = useBrowserStore((s) => s.navigateActiveTab)
  const openInternalPage = useBrowserStore((s) => s.openInternalPage)
  const setAddressDraft = useBrowserStore((s) => s.setAddressDraft)
  const bookmarks = useBrowserStore((s) => s.bookmarks)
  const history = useBrowserStore((s) => s.history)

  const shortcuts =
    bookmarks.length > 0
      ? bookmarks.slice(0, 5).map((item) => ({
          id: item.id,
          title: item.title,
          url: item.url,
        }))
      : FALLBACK_SHORTCUTS

  const recents = history.slice(0, 5)

  return (
    <div className="flex h-full overflow-y-auto bg-[#0b0d12]">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-6 pt-[18vh] pb-16">
        <p className="text-nova-text/90 mb-6 text-[22px] font-medium tracking-tight">
          {NOVA_BRAND.name}
        </p>

        <form
          className="w-full"
          onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            const query = String(data.get('q') ?? '').trim()
            if (!query) return
            setAddressDraft(query)
            navigateActiveTab(query)
          }}
        >
          <input
            name="q"
            type="search"
            placeholder="Search or type a URL"
            className="text-nova-text placeholder:text-nova-faint h-10 w-full rounded-full bg-[#161a24] px-5 text-[13px] ring-1 ring-white/[0.07] outline-none focus:ring-white/20"
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </form>

        <div className="mt-9 flex flex-wrap justify-center gap-5">
          {shortcuts.map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => {
                if (site.url.startsWith('nova://')) openInternalPage(site.url)
                else navigateActiveTab(site.url)
              }}
              className="group flex w-14 flex-col items-center gap-2"
            >
              <span className="text-nova-muted group-hover:text-nova-text flex h-11 w-11 items-center justify-center rounded-full bg-[#161a24] text-[13px] transition-colors group-hover:bg-[#1c2230]">
                {site.title.slice(0, 1)}
              </span>
              <span className="text-nova-faint group-hover:text-nova-muted w-full truncate text-center text-[11px]">
                {site.title}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-12 w-full space-y-8">
          <div>
            <p className="text-nova-faint mb-2 text-[11px]">Workspace</p>
            <button
              type="button"
              onClick={() => openInternalPage(toNovaUrl('workspace'))}
              className="text-nova-muted hover:text-nova-text text-[13px] transition-colors"
            >
              Continue Product →
            </button>
          </div>

          <div>
            <p className="text-nova-faint mb-2 text-[11px]">Recent</p>
            {recents.length === 0 ? (
              <p className="text-nova-faint text-[13px]">Browse the web to fill recent history.</p>
            ) : (
              <ul className="space-y-1">
                {recents.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigateActiveTab(item.url)}
                      className="flex w-full items-baseline justify-between gap-4 py-1 text-left"
                    >
                      <span className="text-nova-muted hover:text-nova-text truncate text-[13px]">
                        {item.title}
                      </span>
                      <span className="text-nova-faint shrink-0 text-[11px]">
                        {formatVisitedAt(item.visitedAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-nova-faint mb-2 text-[11px]">Nova</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {NOVA_LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => openInternalPage(link.url)}
                  className="text-nova-faint hover:text-nova-muted text-[12px] transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
