import type { DownloadSnapshot } from '../../electron/preload'

const noopAsync = async () => false
const noopPath = async () => ''

/** Typed bridge to Electron downloads. Safe no-op outside Electron. */
export const downloadApi = {
  get available() {
    return Boolean(window.nova?.downloads)
  },

  cancel(id: string) {
    return window.nova?.downloads.cancel(id) ?? noopAsync()
  },

  open(id: string, savePath: string) {
    return window.nova?.downloads.open(id, savePath) ?? noopAsync()
  },

  showInFolder(id: string, savePath: string) {
    return window.nova?.downloads.showInFolder(id, savePath) ?? noopAsync()
  },

  getPath() {
    return window.nova?.downloads.getPath() ?? noopPath()
  },

  onUpdate(callback: (item: DownloadSnapshot) => void) {
    return window.nova?.downloads.onUpdate(callback) ?? (() => undefined)
  },
}
