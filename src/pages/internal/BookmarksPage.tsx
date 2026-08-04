import { useBrowserStore } from '@/store/browserStore'

export function BookmarksPage() {
  const bookmarks = useBrowserStore((s) => s.bookmarks)
  const navigateActiveTab = useBrowserStore((s) => s.navigateActiveTab)
  const removeBookmark = useBrowserStore((s) => s.removeBookmark)

  return (
    <div className="flex h-full flex-col bg-[#0b0d12] px-6 pt-14">
      <header className="mb-4">
        <p className="font-mono text-[11px] text-nova-faint">nova://bookmarks</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Bookmarks</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <p className="text-[13px] text-nova-muted">
            No bookmarks yet. Press Ctrl+D on a page to save one.
          </p>
        ) : (
          <ul className="space-y-1">
            {bookmarks.map((item) => (
              <li key={item.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => navigateActiveTab(item.url)}
                  className="flex min-w-0 flex-1 items-baseline justify-between gap-4 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-nova-text">{item.title}</span>
                    <span className="block truncate font-mono text-[11px] text-nova-faint">
                      {item.url}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-nova-faint">Open</span>
                </button>
                <button
                  type="button"
                  aria-label="Remove bookmark"
                  onClick={() => removeBookmark(item.url)}
                  className="rounded px-2 py-1 text-[11px] text-nova-faint opacity-0 transition-opacity hover:text-nova-muted group-hover:opacity-100"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
