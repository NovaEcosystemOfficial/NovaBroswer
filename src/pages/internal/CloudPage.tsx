export function CloudPage() {
  return (
    <div className="flex h-full flex-col bg-[#0b0d12] px-6 pt-14">
      <header className="mb-4">
        <p className="font-mono text-[11px] text-nova-faint">nova://cloud</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">NovaCloud</h1>
      </header>

      <div className="max-w-md">
        <p className="text-[13px] text-nova-muted">
          NovaCloud is a future ecosystem module. In this sprint we keep NovaBrowser browser-first:
          the content surface stays focused on web navigation.
        </p>
      </div>
    </div>
  )
}

