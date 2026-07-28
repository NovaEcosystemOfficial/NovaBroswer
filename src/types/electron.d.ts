import type { NovaBrowserAPI } from '../electron/preload'

declare global {
  interface Window {
    nova?: NovaBrowserAPI
  }
}

export {}
