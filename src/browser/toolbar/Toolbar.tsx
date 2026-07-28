import { useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { IconButton } from '@/components/IconButton'
import { useBrowserStore } from '@/store/browserStore'
import { cn } from '@/utils/cn'

export function Toolbar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const addressDraft = useBrowserStore((s) => s.addressDraft)
  const setAddressDraft = useBrowserStore((s) => s.setAddressDraft)
  const submitAddress = useBrowserStore((s) => s.submitAddress)
  const addTab = useBrowserStore((s) => s.addTab)
  const navigateActiveTab = useBrowserStore((s) => s.navigateActiveTab)
  const activeUrl = useBrowserStore((s) => s.tabs.find((t) => t.isActive)?.url ?? '')

  return (
    <div className="no-drag flex h-9 shrink-0 items-center gap-0.5 border-b border-white/[0.06] bg-[#10131a] px-1.5">
      <IconButton label="Back" disabled>
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>
      <IconButton label="Forward" disabled>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>
      <IconButton label="Refresh" onClick={() => navigateActiveTab(activeUrl)}>
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>

      <form
        className="mx-1 min-w-0 flex-1"
        onSubmit={(event) => {
          event.preventDefault()
          submitAddress()
          inputRef.current?.blur()
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={addressDraft}
          onChange={(event) => setAddressDraft(event.target.value)}
          onFocus={(event) => event.target.select()}
          className={cn(
            'h-7 w-full rounded-full bg-[#1a1f2a] px-3.5 text-[12.5px] text-nova-text outline-none',
            'ring-1 ring-white/[0.06] placeholder:text-nova-faint',
            'focus:ring-white/15',
          )}
          placeholder="Search or enter address"
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      <IconButton label="New tab" onClick={() => addTab()}>
        <Plus className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>
      <IconButton label="Profile">
        <UserRound className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>
      {/* Ryuk accompanies navigation — present, not a destination landing page */}
      <IconButton label="Ryuk">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>
    </div>
  )
}
