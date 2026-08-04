import { useBrowserStore } from '@/store/browserStore'
import { formatVisitedAt } from '@/services/storage'
import type { DownloadEntry } from '@/types'

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exp
  return `${value >= 10 || exp === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exp]}`
}

function progressLabel(item: DownloadEntry): string {
  if (item.state === 'completed') {
    return item.endedAt ? formatVisitedAt(item.endedAt) : 'Done'
  }
  if (item.state === 'cancelled') return 'Cancelled'
  if (item.state === 'interrupted') return 'Interrupted'
  if (item.totalBytes > 0) {
    const pct = Math.min(100, Math.round((item.receivedBytes / item.totalBytes) * 100))
    return `${pct}% · ${formatBytes(item.receivedBytes)} / ${formatBytes(item.totalBytes)}`
  }
  return `${formatBytes(item.receivedBytes)}`
}

export function DownloadsPage() {
  const downloads = useBrowserStore((s) => s.downloads)
  const cancelDownload = useBrowserStore((s) => s.cancelDownload)
  const openDownload = useBrowserStore((s) => s.openDownload)
  const showDownloadInFolder = useBrowserStore((s) => s.showDownloadInFolder)
  const removeDownload = useBrowserStore((s) => s.removeDownload)
  const clearDownloads = useBrowserStore((s) => s.clearDownloads)

  return (
    <div className="flex h-full flex-col bg-[#0b0d12] px-6 pt-14">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-nova-faint">nova://downloads</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Downloads</h1>
        </div>
        {downloads.length > 0 && (
          <button
            type="button"
            onClick={clearDownloads}
            className="text-[12px] text-nova-faint transition-colors hover:text-nova-muted"
          >
            Clear all
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {downloads.length === 0 ? (
          <p className="text-[13px] text-nova-muted">
            No downloads yet. Files you save from the web appear here.
          </p>
        ) : (
          <ul className="space-y-1">
            {downloads.map((item) => {
              const pct =
                item.state === 'progressing' && item.totalBytes > 0
                  ? Math.min(100, Math.round((item.receivedBytes / item.totalBytes) * 100))
                  : item.state === 'completed'
                    ? 100
                    : 0

              return (
                <li
                  key={item.id}
                  className="group rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-nova-text">{item.filename}</p>
                      <p className="truncate font-mono text-[11px] text-nova-faint">{item.url}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-nova-faint">
                      {progressLabel(item)}
                    </span>
                  </div>

                  {item.state === 'progressing' && (
                    <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-nova-accent/80 transition-[width] duration-150"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {item.state === 'progressing' ? (
                      <button
                        type="button"
                        onClick={() => cancelDownload(item.id)}
                        className="text-[11px] text-nova-faint hover:text-nova-muted"
                      >
                        Cancel
                      </button>
                    ) : (
                      <>
                        {item.state === 'completed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => openDownload(item.id)}
                              className="text-[11px] text-nova-faint hover:text-nova-muted"
                            >
                              Open
                            </button>
                            <button
                              type="button"
                              onClick={() => showDownloadInFolder(item.id)}
                              className="text-[11px] text-nova-faint hover:text-nova-muted"
                            >
                              Show in folder
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => removeDownload(item.id)}
                          className="text-[11px] text-nova-faint hover:text-nova-muted"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
