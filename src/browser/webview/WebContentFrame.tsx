interface WebContentFrameProps {
  url: string
  title: string
  isLoading?: boolean
  /** When true, Electron BrowserView paints over this surface. */
  electronAttached?: boolean
}

/**
 * Host surface for Chromium guest pages.
 * In Electron the real page is a BrowserView layered on these bounds.
 */
export function WebContentFrame({
  url,
  title,
  isLoading = false,
  electronAttached = false,
}: WebContentFrameProps) {
  if (electronAttached) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        {isLoading && (
          <p className="text-[12px] text-neutral-400">Loading {title || url}…</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-white px-6 text-center">
      <p className="text-[13px] font-medium text-neutral-800">{title}</p>
      <p className="max-w-md font-mono text-[11px] break-all text-neutral-500">{url}</p>
      <p className="mt-1 max-w-sm text-[12px] text-neutral-400">
        Open with <span className="font-mono">npm run electron:dev</span> to load real web pages.
      </p>
    </div>
  )
}
