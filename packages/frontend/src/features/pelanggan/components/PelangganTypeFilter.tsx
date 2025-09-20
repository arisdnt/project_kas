import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Button } from '@/core/components/ui/button'
import { Users, ChevronDown } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type PelangganTypeFilterProps = {
  value?: 'all' | 'reguler' | 'vip' | 'member' | 'wholesale'
  onChange: (value?: 'all' | 'reguler' | 'vip' | 'member' | 'wholesale') => void
}

const TYPE_OPTIONS: Array<{ value: 'all' | 'reguler' | 'vip' | 'member' | 'wholesale'; label: string }> = [
  { value: 'all', label: 'Semua tipe' },
  { value: 'reguler', label: 'Reguler' },
  { value: 'vip', label: 'VIP' },
  { value: 'member', label: 'Member' },
  { value: 'wholesale', label: 'Wholesale' },
]

export function PelangganTypeFilter({ value = 'all', onChange }: PelangganTypeFilterProps) {
  const hasSelection = value !== 'all'
  const displayText = TYPE_OPTIONS.find((option) => option.value === value)?.label ?? 'Semua tipe'

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
          <Users className="h-3.5 w-3.5 text-indigo-500" />
          {displayText}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0"
        align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuLabel>Filter Tipe Pelanggan</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={(val) => onChange(val as PelangganTypeFilterProps['value'])}>
          {TYPE_OPTIONS.map(({ value: typeValue, label }) => (
            <DropdownMenuRadioItem key={typeValue} value={typeValue} className="cursor-pointer">
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
