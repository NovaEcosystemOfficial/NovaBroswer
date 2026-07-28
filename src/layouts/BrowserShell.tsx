import { Sidebar } from '@/browser/sidebar/Sidebar'
import { Toolbar } from '@/browser/toolbar/Toolbar'
import { TabBar } from '@/browser/tabs/TabBar'
import { WebView } from '@/browser/webview/WebView'

/**
 * Permanent chrome only — WebView owns the rest of the window.
 * Hierarchy: WebView → Tabs → Address → Navigation → Browser → Nova.
 */
export function BrowserShell() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0a0c10]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="drag-region shrink-0">
          <TabBar />
          <Toolbar />
        </header>
        <WebView />
      </div>
    </div>
  )
}
