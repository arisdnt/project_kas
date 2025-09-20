import { useEffect, useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { cn } from '@/core/lib/utils'
import { Calendar as CalendarIcon, Eraser } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'

export type DateRange = {
  from?: string
  to?: string
}

type DateRangeFilterProps = {
  label: string
  value?: DateRange
  onApply: (range?: DateRange) => void
}

export function DateRangeFilter({ label, value, onApply }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  useEffect(() => {
    setFrom(value?.from || '')
    setTo(value?.to || '')
  }, [value, open])

  const apply = () => {
    const normalized: DateRange = {}
    if (from) normalized.from = from
    if (to) normalized.to = to
    if (!normalized.from && !normalized.to) {
      onApply(undefined)
    } else {
      onApply(normalized)
    }
    setOpen(false)
  }

  const clear = () => {
    setFrom('')
    setTo('')
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
            value?.from || value?.to
              ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
              : 'text-slate-400 hover:text-slate-600',
          )}
          aria-label={`Filter tanggal ${label}`}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>{value?.from || value?.to ? 'Filter' : ''}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          className="z-50 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
        >
          <div className="flex items-center justify-between text-[12px] font-semibold text-slate-700">
            <span>{label}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clear}>
              <Eraser className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Dari</span>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8 text-[12px]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Sampai</span>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
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