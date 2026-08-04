import { useEffect } from 'react'
import { BrowserShell } from '@/layouts/BrowserShell'
import { useGuestNavigationSync } from '@/hooks/useGuestNavigationSync'
import { useDownloadSync } from '@/hooks/useDownloadSync'
import { useBrowserShortcuts } from '@/hooks/useBrowserShortcuts'
import { useBrowserStore } from '@/store/browserStore'

export function App() {
  const hydrate = useBrowserStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useGuestNavigationSync()
  useDownloadSync()
  useBrowserShortcuts()

  return <BrowserShell />
}
