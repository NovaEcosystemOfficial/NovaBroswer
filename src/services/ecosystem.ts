import { ECOSYSTEM_MODULES } from '@/utils/constants'
import { toNovaUrl, type NovaPageId } from '@/services/protocol'

export type EcosystemModule = (typeof ECOSYSTEM_MODULES)[number]

export interface EcosystemBridge {
  module: EcosystemModule
  ready: boolean
  version: string | null
  /** Internal browser page — never a separate window. */
  novaUrl: string | null
}

const MODULE_PAGES: Partial<Record<EcosystemModule, NovaPageId>> = {
  NovaCloud: 'cloud',
  'Ryuk AI': 'ai',
  NovaDocs: 'docs',
}

/** Registry for future Nova Ecosystem integrations as nova:// pages. */
export function getEcosystemStatus(): EcosystemBridge[] {
  return ECOSYSTEM_MODULES.map((module) => {
    const page = MODULE_PAGES[module]
    return {
      module,
      ready: false,
      version: null,
      novaUrl: page ? toNovaUrl(page) : null,
    }
  })
}
