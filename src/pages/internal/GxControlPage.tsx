import { useBrowserStore } from '@/store/browserStore'
import type { GxLimits } from '@/types'
import { guestApi } from '@/services/guestBridge'
import { cn } from '@/utils/cn'

type LimitKey = keyof GxLimits

const SLIDERS: Array<{
  key: LimitKey
  label: string
  hint: string
}> = [
  {
    key: 'cpu',
    label: 'CPU',
    hint: 'Below 100% tears down Chromium guests for background tabs.',
  },
  {
    key: 'ram',
    label: 'RAM',
    hint: 'Below 100% keeps only the active tab BrowserView alive.',
  },
  {
    key: 'network',
    label: 'Network',
    hint: 'Real guest throttle via CDP (0 ≈ offline, 100 = unrestricted).',
  },
]

function LimitSlider({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: number
  onChange: (next: number) => void
}) {
  return (
    <div className="rounded-lg bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.06]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-nova-text text-[13px] font-medium">{label}</p>
        <p className="text-nova-gx font-mono text-[12px]">{value}%</p>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn(
          'mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#1a1f2a]',
          '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:bg-nova-gx',
        )}
        aria-label={label}
      />
      <p className="text-nova-faint mt-2 text-[12px]">{hint}</p>
    </div>
  )
}

/** Opera GX–inspired resource control — always a nova:// tab, never a chrome panel. */
export function GxControlPage() {
  const gxLimits = useBrowserStore((s) => s.gxLimits)
  const setGxLimits = useBrowserStore((s) => s.setGxLimits)

  return (
    <div className="flex h-full flex-col bg-[#0b0d12] px-6 pt-14">
      <header className="mb-5">
        <p className="text-nova-gx/80 font-mono text-[11px]">nova://gx</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">GX Control</h1>
        <p className="text-nova-muted mt-2 max-w-md text-[13px]">
          Cap browser resources the Opera GX way — as a normal tab, so the WebView stays ~95% of the
          window.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md space-y-3">
          {SLIDERS.map((slider) => (
            <LimitSlider
              key={slider.key}
              label={slider.label}
              hint={slider.hint}
              value={gxLimits[slider.key]}
              onChange={(next) => setGxLimits({ [slider.key]: next })}
            />
          ))}

          <div className="rounded-lg bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.06]">
            <p className="text-nova-text text-[13px] font-medium">Runtime</p>
            <p className="text-nova-faint mt-1 font-mono text-[11px]">
              Electron guest bridge: {guestApi.available ? 'active' : 'dev placeholder'}
            </p>
            <button
              type="button"
              onClick={() => setGxLimits({ cpu: 100, ram: 100, network: 100 })}
              className="text-nova-muted hover:text-nova-text mt-3 text-[12px] transition-colors"
            >
              Reset to unlimited
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
