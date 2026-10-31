import { useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  RefreshCw,
  Square,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react'
import { IconButton } from '@/components/IconButton'
import { useBrowserStore } from '@/store/browserStore'
import { isNovaUrl, toNovaUrl } from '@/services/protocol'
import { cn } from '@/utils/cn'

export function Toolbar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const addressDraft = useBrowserStore((s) => s.addressDraft)
  const setAddressDraft = useBrowserStore((s) => s.setAddressDraft)
  const setAddressFocused = useBrowserStore((s) => s.setAddressFocused)
  const submitAddress = useBrowserStore((s) => s.submitAddress)
  const addTab = useBrowserStore((s) => s.addTab)
  const goBack = useBrowserStore((s) => s.goBack)
  const goForward = useBrowserStore((s) => s.goForward)
  const reload = useBrowserStore((s) => s.reload)
  const stopLoading = useBrowserStore((s) => s.stopLoading)
  const toggleBookmarkForActiveTab = useBrowserStore((s) => s.toggleBookmarkForActiveTab)
  const isBookmarked = useBrowserStore((s) => s.isBookmarked)
  const openInternalPage = useBrowserStore((s) => s.openInternalPage)
  const activeTab = useBrowserStore((s) => s.tabs.find((t) => t.isActive))
  const isLoading = Boolean(activeTab?.isLoading)
  const canBookmark = Boolean(activeTab && !isNovaUrl(activeTab.url))
  const bookmarked = canBookmark ? isBookmarked(activeTab!.url) : false

  useEffect(() => {
    const focus = () => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('nova:focus-address', focus)
    return () => window.removeEventListener('nova:focus-address', focus)
  }, [])

  return (
    <div className="no-drag relative flex h-8 shrink-0 items-center gap-0.5 border-b border-white/[0.06] bg-[#10131a] px-1.5">
      <IconButton label="Back" disabled={!activeTab?.canGoBack} onClick={goBack}>
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>
      <IconButton label="Forward" disabled={!activeTab?.canGoForward} onClick={goForward}>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>
      {isLoading ? (
        <IconButton label="Stop" onClick={stopLoading}>
          <Square className="h-3 w-3 fill-current" strokeWidth={1.6} />
        </IconButton>
      ) : (
        <IconButton label="Refresh" onClick={() => reload()}>
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.6} />
        </IconButton>
      )}

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
          onFocus={(event) => {
            setAddressFocused(true)
            event.target.select()
          }}
          onBlur={() => setAddressFocused(false)}
          className={cn(
            'text-nova-text h-6 w-full rounded-full bg-[#1a1f2a] px-3.5 text-[12px] outline-none',
            'placeholder:text-nova-faint ring-1 ring-white/[0.06]',
            'focus:ring-white/15',
          )}
          placeholder="Search or enter address"
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      <IconButton
        label={bookmarked ? 'Remove bookmark' : 'Bookmark this page'}
        disabled={!canBookmark}
        onClick={toggleBookmarkForActiveTab}
        className={bookmarked ? 'text-nova-cyan' : undefined}
      >
        <Star className={cn('h-3.5 w-3.5', bookmarked && 'fill-current')} strokeWidth={1.6} />
      </IconButton>
      <IconButton label="New tab" onClick={() => addTab()}>
        <Plus className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>
      <IconButton label="Profile" onClick={() => openInternalPage(toNovaUrl('settings'))}>
        <UserRound className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>
      <IconButton label="Ryuk" onClick={() => openInternalPage(toNovaUrl('ai'))}>
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
      </IconButton>

      {isLoading && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] overflow-hidden">
          <div className="bg-nova-gx/80 h-full w-1/3 animate-[nova-load_1s_ease-in-out_infinite]" />
        </div>
      )}
    </div>
  )
}
