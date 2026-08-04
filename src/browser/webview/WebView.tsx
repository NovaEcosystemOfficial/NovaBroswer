import { useBrowserStore } from '@/store/browserStore'
import { resolveNovaPage, parseUrl } from '@/services/protocol'
import { InternalPageHost } from '@/pages/internal/InternalPageHost'
import { WebContentFrame } from '@/browser/webview/WebContentFrame'
import { useGuestBounds } from '@/hooks/useGuestBounds'
import { guestApi } from '@/services/guestBridge'

/** Primary content surface — Chromium guest owns web tabs; React owns nova:// tabs. */
export function WebView() {
  const activeTab = useBrowserStore((s) => s.tabs.find((t) => t.isActive))
  const isWeb = activeTab ? parseUrl(activeTab.url).kind === 'web' : false
  const surfaceRef = useGuestBounds(isWeb)

  if (!activeTab) return null

  const novaPage = resolveNovaPage(activeTab.url)

  return (
    <div
      ref={surfaceRef}
      className="relative h-full min-h-0 w-full flex-1 overflow-hidden bg-nova-bg"
    >
      {novaPage ? (
        <InternalPageHost page={novaPage} />
      ) : (
        <WebContentFrame
          url={activeTab.url}
          title={activeTab.title}
          isLoading={Boolean(activeTab.isLoading)}
          electronAttached={guestApi.available}
        />
      )}
    </div>
  )
}
