import { useEffect } from 'react'
import { useBrowserStore } from '@/store/browserStore'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

/** Chrome-like shortcuts for tab and navigation chrome. */
export function useBrowserShortcuts(): void {
  const addTab = useBrowserStore((s) => s.addTab)
  const closeActiveTab = useBrowserStore((s) => s.closeActiveTab)
  const cycleTab = useBrowserStore((s) => s.cycleTab)
  const focusAddressBar = useBrowserStore((s) => s.focusAddressBar)
  const goBack = useBrowserStore((s) => s.goBack)
  const goForward = useBrowserStore((s) => s.goForward)
  const reload = useBrowserStore((s) => s.reload)
  const stopLoading = useBrowserStore((s) => s.stopLoading)
  const toggleBookmarkForActiveTab = useBrowserStore((s) => s.toggleBookmarkForActiveTab)
  const isLoading = useBrowserStore((s) => s.tabs.find((t) => t.isActive)?.isLoading)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (mod && key === 't') {
        event.preventDefault()
        addTab()
        return
      }

      if (mod && key === 'w') {
        event.preventDefault()
        closeActiveTab()
        return
      }

      if (mod && key === 'l') {
        event.preventDefault()
        focusAddressBar()
        return
      }

      if (mod && key === 'r') {
        event.preventDefault()
        if (isLoading) stopLoading()
        else reload(event.shiftKey)
        return
      }

      if (mod && key === 'd') {
        event.preventDefault()
        toggleBookmarkForActiveTab()
        return
      }

      if (mod && key === 'tab') {
        event.preventDefault()
        cycleTab(event.shiftKey ? -1 : 1)
        return
      }

      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault()
        goBack()
        return
      }

      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault()
        goForward()
        return
      }

      // Avoid stealing keys while typing in page inputs (renderer-only; guest has own focus)
      if (!mod && isTypingTarget(event.target)) return
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    addTab,
    closeActiveTab,
    cycleTab,
    focusAddressBar,
    goBack,
    goForward,
    reload,
    stopLoading,
    toggleBookmarkForActiveTab,
    isLoading,
  ])
}
