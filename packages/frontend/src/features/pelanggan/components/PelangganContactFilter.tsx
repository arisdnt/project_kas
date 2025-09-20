import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Button } from '@/core/components/ui/button'
import { Phone, ChevronDown } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type PelangganContactFilterProps = {
  value?: ('with-contact' | 'without-contact')[]
  onChange: (value?: ('with-contact' | 'without-contact')[]) => void
  withContactCount: number
  withoutContactCount: number
}

export function PelangganContactFilter({ value, onChange, withContactCount, withoutContactCount }: PelangganContactFilterProps) {
  const selectedCount = value?.length ?? 0
  const hasSelection = selectedCount > 0

  const handleToggle = (key: 'with-contact' | 'without-contact', checked: boolean) => {
    const next = new Set(value ?? [])
    if (checked) next.add(key)
    else next.delete(key)
    const arr = Array.from(next)
    onChange(arr.length > 0 ? arr : undefined)
  }

  const displayLabel = (() => {
    if (selectedCount === 0) return 'Telepon'
    if (selectedCount === 1) return value![0] === 'with-contact' ? 'Dengan telepon' : 'Tanpa telepon'
    return 'Semua telepon'
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
          <Phone className="h-3.5 w-3.5 text-indigo-500" />
          {displayLabel}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0"
        align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuLabel>Filter Telepon</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={value?.includes('with-contact') ?? false}
          onCheckedChange={(checked) => handleToggle('with-contact', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Dengan telepon</span>
          <span className="text-[12px] text-slate-400">{withContactCount}</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={value?.includes('without-contact') ?? false}
          onCheckedChange={(checked) => handleToggle('without-contact', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Tanpa telepon</span>
          <span className="text-[12px] text-slate-400">{withoutContactCount}</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
