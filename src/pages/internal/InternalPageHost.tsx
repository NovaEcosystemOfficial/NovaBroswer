import type { NovaPageId } from '@/services/protocol'
import { NewTabPage } from '@/pages/internal/NewTabPage'
import { HistoryPage } from '@/pages/internal/HistoryPage'
import { BookmarksPage } from '@/pages/internal/BookmarksPage'
import { DownloadsPage } from '@/pages/internal/DownloadsPage'
import { WorkspacePage } from '@/pages/internal/WorkspacePage'
import { SettingsPage } from '@/pages/internal/SettingsPage'
import { CloudPage } from '@/pages/internal/CloudPage'
import { DocsPage } from '@/pages/internal/DocsPage'
import { AiPage } from '@/pages/internal/AiPage'
import { InternalStubPage } from '@/pages/internal/InternalStubPage'
import { NOVA_PAGES } from '@/services/protocol'

interface InternalPageHostProps {
  page: NovaPageId
}

export function InternalPageHost({ page }: InternalPageHostProps) {
  switch (page) {
    case 'newtab':
    case 'home':
      return <NewTabPage />
    case 'history':
      return <HistoryPage />
    case 'bookmarks':
      return <BookmarksPage />
    case 'downloads':
      return <DownloadsPage />
    case 'workspace':
      return <WorkspacePage />
    case 'settings':
      return <SettingsPage />
    case 'cloud':
      return <CloudPage />
    case 'docs':
      return <DocsPage />
    case 'ai':
      return <AiPage />
    default: {
      const _exhaustive: never = page
      void _exhaustive
      const meta = NOVA_PAGES['home']
      return <InternalStubPage title={meta.title} path={meta.path} />
    }
  }
}
