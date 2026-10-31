import type {
  GuestBounds,
  GuestNavigationState,
  GuestOpenUrlRequest,
  GxLimitsPayload,
} from '../../electron/preload'

const noopAsync = async () => undefined

/** Typed bridge to Electron guest WebContents. Safe no-op outside Electron. */
export const guestApi = {
  get available() {
    return Boolean(window.nova?.guest)
  },

  attach(tabId: string, url: string) {
    return window.nova?.guest.attach(tabId, url) ?? noopAsync()
  },

  destroy(tabId: string) {
    return window.nova?.guest.destroy(tabId) ?? noopAsync()
  },

  show(tabId: string) {
    return window.nova?.guest.show(tabId) ?? noopAsync()
  },

  hide() {
    return window.nova?.guest.hide() ?? noopAsync()
  },

  navigate(tabId: string, url: string) {
    return window.nova?.guest.navigate(tabId, url) ?? noopAsync()
  },

  goBack(tabId: string) {
    return window.nova?.guest.goBack(tabId) ?? noopAsync()
  },

  goForward(tabId: string) {
    return window.nova?.guest.goForward(tabId) ?? noopAsync()
  },

  reload(tabId: string, ignoreCache?: boolean) {
    return window.nova?.guest.reload(tabId, ignoreCache) ?? noopAsync()
  },

  stop(tabId: string) {
    return window.nova?.guest.stop(tabId) ?? noopAsync()
  },

  setBounds(bounds: GuestBounds) {
    return window.nova?.guest.setBounds(bounds) ?? noopAsync()
  },

  setGxLimits(limits: GxLimitsPayload) {
    return window.nova?.guest.setGxLimits(limits) ?? Promise.resolve({ ...limits })
  },

  getGxLimits() {
    return window.nova?.guest.getGxLimits() ?? Promise.resolve({ cpu: 100, ram: 100, network: 100 })
  },

  onNavigation(callback: (state: GuestNavigationState) => void) {
    return window.nova?.guest.onNavigation(callback) ?? (() => undefined)
  },

  onOpenUrl(callback: (request: GuestOpenUrlRequest) => void) {
    return window.nova?.guest.onOpenUrl(callback) ?? (() => undefined)
  },
}
