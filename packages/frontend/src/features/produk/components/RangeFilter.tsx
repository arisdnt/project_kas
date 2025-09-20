import { useEffect, useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { cn } from '@/core/lib/utils'
import { Eraser } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'

export type Range = {
  min?: number
  max?: number
}

type RangeFilterProps = {
  label: string
  icon: React.ReactNode
  value?: Range
  onApply: (range?: Range) => void
}

export function RangeFilter({ label, icon, value, onApply }: RangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [min, setMin] = useState<string>('')
  const [max, setMax] = useState<string>('')

  useEffect(() => {
    setMin(value?.min != null ? String(value.min) : '')
    setMax(value?.max != null ? String(value.max) : '')
  }, [value, open])

  const apply = () => {
    const normalized: Range = {}
    if (min !== '') normalized.min = Number(min)
    if (max !== '') normalized.max = Number(max)
    if (normalized.min == null && normalized.max == null) {
      onApply(undefined)
    } else {
      onApply(normalized)
    }
    setOpen(false)
  }

  const clear = () => {
    setMin('')
    setMax('')
    onApply(undefined)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-6 items-center gap-1 rounded px-1.5 text-[11px] font-medium transition',
            value?.min != null || value?.max != null
              ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
              : 'text-slate-400 hover:text-slate-600',
          )}
          aria-label={`Filter ${label}`}
        >
          {icon}
          <span>{value?.min != null || value?.max != null ? 'Filter' : ''}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          className="z-50 w-60 rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
        >
          <div className="flex items-center justify-between text-[12px] font-semibold text-slate-700">
            <span>{label}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clear}>
              <Eraser className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Minimal</span>
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="0"
                className="h-8 text-[12px]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Maksimal</span>
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="∞"
                className="h-8 text-[12px]"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={clear}>
              Reset
            </Button>
            <Button size="sm" className="h-8 text-[12px]" onClick={apply}>
              Terapkan
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}