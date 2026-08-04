import { useEffect, useRef, type RefObject } from 'react'
import { guestApi } from '@/services/guestBridge'

/** Reports the content surface rect to Electron so BrowserView fills ~95% of the window. */
export function useGuestBounds(enabled: boolean): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled || !guestApi.available) return

    const node = ref.current
    if (!node) return

    const publish = () => {
      const rect = node.getBoundingClientRect()
      void guestApi.setBounds({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      })
    }

    publish()

    const observer = new ResizeObserver(publish)
    observer.observe(node)
    window.addEventListener('resize', publish)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', publish)
    }
  }, [enabled])

  return ref
}
