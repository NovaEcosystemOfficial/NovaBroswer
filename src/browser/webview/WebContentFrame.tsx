interface WebContentFrameProps {
  url: string
  title: string
}

/**
 * Future Chromium guest WebContents attach here.
 * External URLs already occupy the full WebView surface like a real browser.
 */
export function WebContentFrame({ url, title }: WebContentFrameProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-white px-6 text-center">
      <p className="text-[13px] font-medium text-neutral-800">{title}</p>
      <p className="max-w-md font-mono text-[11px] break-all text-neutral-500">{url}</p>
      <p className="mt-1 max-w-sm text-[12px] text-neutral-400">
        Guest page rendering will attach to this surface.
      </p>
    </div>
  )
}
