import { useBrowserStore } from '@/store/browserStore'
import { formatVisitedAt } from '@/services/storage'

export function HistoryPage() {
  const history = useBrowserStore((s) => s.history)
  const navigateActiveTab = useBrowserStore((s) => s.navigateActiveTab)
  const removeHistoryEntry = useBrowserStore((s) => s.removeHistoryEntry)
  const clearHistory = useBrowserStore((s) => s.clearHistory)

  return (
    <div className="flex h-full flex-col bg-[#0b0d12] px-6 pt-14">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-nova-faint">nova://history</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">History</h1>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="text-[12px] text-nova-faint transition-colors hover:text-nova-muted"
          >
            Clear all
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-[13px] text-nova-muted">No browsing history yet.</p>
        ) : (
          <ul className="space-y-1">
            {history.map((item) => (
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
                  <span className="shrink-0 text-[11px] text-nova-faint">
                    {formatVisitedAt(item.visitedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Remove from history"
                  onClick={() => removeHistoryEntry(item.id)}
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
