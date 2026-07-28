import { useBrowserStore } from '@/store/browserStore'
import { resolveNovaPage } from '@/services/protocol'
import { InternalPageHost } from '@/pages/internal/InternalPageHost'
import { WebContentFrame } from '@/browser/webview/WebContentFrame'

/** Primary content surface — always owns ~95% of the window. */
export function WebView() {
  const activeTab = useBrowserStore((s) => s.tabs.find((t) => t.isActive))

  if (!activeTab) return null

  const novaPage = resolveNovaPage(activeTab.url)

  return (
    <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden bg-nova-bg">
      {novaPage ? (
        <InternalPageHost page={novaPage} />
      ) : (
        <WebContentFrame url={activeTab.url} title={activeTab.title} />
      )}
    </div>
  )
}
