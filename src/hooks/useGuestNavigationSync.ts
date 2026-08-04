import { useEffect } from 'react'
import { guestApi } from '@/services/guestBridge'
import { useBrowserStore } from '@/store/browserStore'

/** Sync Zustand with Chromium guest events (navigation + target=_blank). */
export function useGuestNavigationSync(): void {
  const applyGuestNavigation = useBrowserStore((s) => s.applyGuestNavigation)
  const addTab = useBrowserStore((s) => s.addTab)

  useEffect(() => {
    const offNav = guestApi.onNavigation((state) => {
      applyGuestNavigation(state)
    })
    const offOpen = guestApi.onOpenUrl(({ url }) => {
      addTab(url)
    })
    return () => {
      offNav()
      offOpen()
    }
  }, [applyGuestNavigation, addTab])
}
