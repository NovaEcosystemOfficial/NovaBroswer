import { contextBridge } from 'electron'

export type NovaBrowserAPI = {
  platform: NodeJS.Platform
  versions: {
    electron: string
    chrome: string
    node: string
  }
}

const api: NovaBrowserAPI = {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
}

contextBridge.exposeInMainWorld('nova', api)
