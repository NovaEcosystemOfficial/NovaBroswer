import { X } from 'lucide-react'
import { useBrowserStore } from '@/store/browserStore'
import { cn } from '@/utils/cn'

export function TabBar() {
  const tabs = useBrowserStore((s) => s.tabs)
  const setActiveTab = useBrowserStore((s) => s.setActiveTab)
  const closeTab = useBrowserStore((s) => s.closeTab)
  const addTab = useBrowserStore((s) => s.addTab)

  return (
    <div className="drag-region flex h-8 shrink-0 items-stretch bg-[#0a0c10] px-1 pt-0.5">
      <div className="no-drag flex min-w-0 flex-1 items-stretch gap-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'group relative flex max-w-[160px] min-w-[90px] flex-1 items-center gap-1.5 rounded-t px-2.5 text-left text-[11.5px]',
              tab.isActive
                ? 'bg-[#10131a] text-nova-text'
                : 'text-nova-faint hover:bg-white/[0.03] hover:text-nova-muted',
            )}
          >
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
              className="rounded p-0.5 opacity-0 hover:bg-white/10 group-hover:opacity-100"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addTab()}
        className="no-drag flex w-7 shrink-0 items-center justify-center text-nova-faint hover:text-nova-muted"
        aria-label="Open new tab"
      >
        +
      </button>
    </div>
  )
}
