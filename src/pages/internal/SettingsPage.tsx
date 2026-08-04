import { useBrowserStore } from '@/store/browserStore'

export function SettingsPage() {
  const historyCount = useBrowserStore((s) => s.history.length)
  const bookmarkCount = useBrowserStore((s) => s.bookmarks.length)
  const clearHistory = useBrowserStore((s) => s.clearHistory)

  return (
    <div className="flex h-full flex-col bg-[#0b0d12] px-6 pt-14">
      <header className="mb-4">
        <p className="font-mono text-[11px] text-nova-faint">nova://settings</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <section className="max-w-md space-y-3">
          <div className="rounded-lg bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.06]">
            <p className="text-[13px] font-medium text-nova-text">Privacy</p>
            <p className="mt-1 text-[12px] text-nova-faint">
              History entries stored locally: {historyCount}
            </p>
            <button
              type="button"
              onClick={clearHistory}
              className="mt-3 text-[12px] text-nova-muted transition-colors hover:text-nova-text"
            >
              Clear browsing history
            </button>
          </div>

          <div className="rounded-lg bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.06]">
            <p className="text-[13px] font-medium text-nova-text">Bookmarks</p>
            <p className="mt-1 text-[12px] text-nova-faint">
              Saved locally: {bookmarkCount}. Use Ctrl+D to bookmark the current page.
            </p>
          </div>

          <div className="rounded-lg bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.06]">
            <p className="text-[13px] font-medium text-nova-text">Session</p>
            <p className="mt-1 text-[12px] text-nova-faint">
              Open tabs are restored automatically when you relaunch NovaBrowser.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
