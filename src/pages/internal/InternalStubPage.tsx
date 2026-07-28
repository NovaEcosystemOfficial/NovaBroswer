interface InternalStubPageProps {
  title: string
  path: string
}

/** Quiet internal page — same surface as any other tab. */
export function InternalStubPage({ title, path }: InternalStubPageProps) {
  return (
    <div className="flex h-full items-start justify-center bg-[#0b0d12] px-6 pt-24">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] text-nova-faint">nova://{path}</p>
        <h1 className="mt-2 text-xl font-medium tracking-tight text-nova-text">{title}</h1>
        <p className="mt-2 text-[13px] text-nova-faint">This tab is ready for a future sprint.</p>
      </div>
    </div>
  )
}
