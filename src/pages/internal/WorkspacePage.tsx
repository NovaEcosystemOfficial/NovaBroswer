const WORKSPACES = [
  { id: 'w1', name: 'Product', color: '#7C8CFF', tabCount: 6 },
  { id: 'w2', name: 'Research', color: '#6EE7FF', tabCount: 4 },
  { id: 'w3', name: 'Creative', color: '#C084FC', tabCount: 8 },
]

export function WorkspacePage() {
  return (
    <div className="flex h-full flex-col bg-[#0b0d12] px-6 pt-14">
      <header className="mb-4">
        <p className="font-mono text-[11px] text-nova-faint">nova://workspace</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Workspace</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {WORKSPACES.map((ws) => (
            <li key={ws.id}>
              <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 ring-1 ring-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="h-3.5 w-3.5 rounded-full ring-1 ring-white/[0.10] shrink-0"
                    style={{ backgroundColor: ws.color }}
                  />
                  <span className="min-w-0 truncate text-[13px] text-nova-text font-medium">
                    {ws.name}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] text-nova-faint">{ws.tabCount} tabs</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 max-w-md rounded-lg bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.06]">
          <p className="font-mono text-[11px] text-nova-faint">Tip</p>
          <p className="mt-1 text-[13px] text-nova-muted">
            Workspace is UI-only in this sprint.
          </p>
          <p className="mt-2 text-[13px] text-nova-muted">
            To open real content, use the address bar or bookmarks.
          </p>
        </div>
      </div>
    </div>
  )
}

