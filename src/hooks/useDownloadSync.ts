import { useEffect } from 'react'
import { downloadApi } from '@/services/downloadBridge'
import { useBrowserStore } from '@/store/browserStore'

/** Sync Zustand with Chromium download events. */
export function useDownloadSync(): void {
  const upsertDownload = useBrowserStore((s) => s.upsertDownload)

  useEffect(() => {
    return downloadApi.onUpdate((item) => {
      upsertDownload(item)
    })
  }, [upsertDownload])
}
