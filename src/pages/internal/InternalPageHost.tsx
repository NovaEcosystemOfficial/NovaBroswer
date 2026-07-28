import type { NovaPageId } from '@/services/protocol'
import { NewTabPage } from '@/pages/internal/NewTabPage'
import { InternalStubPage } from '@/pages/internal/InternalStubPage'
import { NOVA_PAGES } from '@/services/protocol'

interface InternalPageHostProps {
  page: NovaPageId
}

export function InternalPageHost({ page }: InternalPageHostProps) {
  if (page === 'newtab' || page === 'home') {
    return <NewTabPage />
  }

  const meta = NOVA_PAGES[page]
  return <InternalStubPage title={meta.title} path={meta.path} />
}
