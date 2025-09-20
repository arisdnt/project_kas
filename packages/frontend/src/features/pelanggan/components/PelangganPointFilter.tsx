import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Button } from '@/core/components/ui/button'
import { Star, ChevronDown } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type PelangganPointFilterProps = {
  value?: ('with-points' | 'zero-points')[]
  onChange: (value?: ('with-points' | 'zero-points')[]) => void
  withPointsCount: number
  zeroPointsCount: number
}

export function PelangganPointFilter({ value, onChange, withPointsCount, zeroPointsCount }: PelangganPointFilterProps) {
  const selectedCount = value?.length ?? 0
  const hasSelection = selectedCount > 0

  const handleToggle = (key: 'with-points' | 'zero-points', checked: boolean) => {
    const next = new Set(value ?? [])
    if (checked) next.add(key)
    else next.delete(key)
    const arr = Array.from(next)
    onChange(arr.length > 0 ? arr : undefined)
  }

  const displayLabel = (() => {
    if (selectedCount === 0) return 'Poin'
    if (selectedCount === 1) return value![0] === 'with-points' ? 'Memiliki poin' : 'Tanpa poin'
    return 'Semua poin'
  })()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasSelection ? 'secondary' : 'outline'}
          size="sm"
          className={cn(
            'h-9 w-full gap-1 rounded-lg px-3 text-[13px]',
            hasSelection && 'border-blue-200 bg-blue-50 text-blue-700',
          )}
        >
          <Star className="h-3.5 w-3.5 text-indigo-500" />
          {displayLabel}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0"
        align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuLabel>Filter Poin</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={value?.includes('with-points') ?? false}
          onCheckedChange={(checked) => handleToggle('with-points', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Memiliki poin</span>
          <span className="text-[12px] text-slate-400">{withPointsCount}</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={value?.includes('zero-points') ?? false}
          onCheckedChange={(checked) => handleToggle('zero-points', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Tanpa poin</span>
          <span className="text-[12px] text-slate-400">{zeroPointsCount}</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
