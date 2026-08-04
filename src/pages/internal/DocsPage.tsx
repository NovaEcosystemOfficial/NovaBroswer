export function DocsPage() {
  return (
    <div className="flex h-full flex-col bg-[#0b0d12] px-6 pt-14">
      <header className="mb-4">
        <p className="font-mono text-[11px] text-nova-faint">nova://docs</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">NovaDocs</h1>
      </header>

      <div className="max-w-md">
        <p className="text-[13px] text-nova-muted">
          NovaDocs UI will be implemented in later sprints. For now, this page is a minimal
          internal placeholder rendered like a normal tab.
        </p>
      </div>
    </div>
  )
}

