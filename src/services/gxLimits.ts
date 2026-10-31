/** Opera GX–style resource limits. Network is enforced; CPU/RAM are soft guest policies. */

export type GxLimits = {
  /** 0–100. Below 100 prunes inactive Chromium guests (fewer background processes). */
  cpu: number
  /** 0–100. Below 100 keeps only the active tab’s BrowserView alive. */
  ram: number
  /** 0–100. 100 = full speed; 0 ≈ offline. Applied via CDP on guest. */
  network: number
}

const STORAGE_KEY = 'novabrowser:gx-limits'

export const DEFAULT_GX_LIMITS: GxLimits = {
  cpu: 100,
  ram: 100,
  network: 100,
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 100
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function normalizeGxLimits(input: Partial<GxLimits> | null | undefined): GxLimits {
  return {
    cpu: clampPercent(input?.cpu ?? DEFAULT_GX_LIMITS.cpu),
    ram: clampPercent(input?.ram ?? DEFAULT_GX_LIMITS.ram),
    network: clampPercent(input?.network ?? DEFAULT_GX_LIMITS.network),
  }
}

export function loadGxLimits(): GxLimits {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_GX_LIMITS }
    return normalizeGxLimits(JSON.parse(raw) as Partial<GxLimits>)
  } catch {
    return { ...DEFAULT_GX_LIMITS }
  }
}

export function saveGxLimits(limits: GxLimits): GxLimits {
  const next = normalizeGxLimits(limits)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // quota / private mode
  }
  return next
}

/** Map 0–100 network slider → CDP Network.emulateNetworkConditions-ish values. */
export function networkConditionsFromLimit(network: number): {
  offline: boolean
  latencyMs: number
  downloadThroughput: number
  uploadThroughput: number
} {
  const value = clampPercent(network)
  if (value <= 0) {
    return {
      offline: true,
      latencyMs: 0,
      downloadThroughput: 0,
      uploadThroughput: 0,
    }
  }
  if (value >= 100) {
    return {
      offline: false,
      latencyMs: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    }
  }
  // Rough curve: 10 → ~slow-3G, 50 → ~Fast 3G, 90 → mild limit
  const factor = value / 100
  const downloadThroughput = Math.max(8_000, Math.round(10_000_000 * factor ** 2))
  const uploadThroughput = Math.max(4_000, Math.round(2_000_000 * factor ** 2))
  const latencyMs = Math.round((100 - value) * 3)
  return { offline: false, latencyMs, downloadThroughput, uploadThroughput }
}
