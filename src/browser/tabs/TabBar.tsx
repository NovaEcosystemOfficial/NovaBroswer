import { X } from 'lucide-react'
import { useBrowserStore } from '@/store/browserStore'
import { cn } from '@/utils/cn'

export function TabBar() {
  const tabs = useBrowserStore((s) => s.tabs)
  const setActiveTab = useBrowserStore((s) => s.setActiveTab)
  const closeTab = useBrowserStore((s) => s.closeTab)
  const addTab = useBrowserStore((s) => s.addTab)

  return (
    <div className="drag-region flex h-7 shrink-0 items-stretch bg-[#0a0c10] px-1 pt-0.5">
      <div className="no-drag flex min-w-0 flex-1 items-stretch gap-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'group relative flex max-w-[160px] min-w-[90px] flex-1 items-center gap-1.5 rounded-t px-2 text-left text-[11px]',
              tab.isActive
                ? 'text-nova-text bg-[#10131a] shadow-[inset_0_-1px_0_0_rgb(255_45_120_/0.55)]'
                : 'text-nova-faint hover:text-nova-muted hover:bg-white/[0.03]',
            )}
          >
            {tab.favicon ? (
              <img
                src={tab.favicon}
                alt=""
                className="h-3.5 w-3.5 shrink-0 rounded-sm"
                draggable={false}
              />
            ) : (
              <span
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  tab.isLoading ? 'bg-nova-gx animate-pulse' : 'bg-nova-faint/50',
                )}
              />
            )}
            <span className="min-w-0 flex-1 truncate">{tab.title}</span>
            <span
              role="button"
              tabIndex={0}
              aria-label={`Close ${tab.title}`}
              onClick={(event) => {
                event.stopPropagation()
                closeTab(tab.id)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation()
                  closeTab(tab.id)
                }
              }}
              className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/10"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addTab()}
        className="no-drag text-nova-faint hover:text-nova-muted flex w-7 shrink-0 items-center justify-center"
        aria-label="Open new tab"
      >
        +
      </button>
    </div>
  )
}
