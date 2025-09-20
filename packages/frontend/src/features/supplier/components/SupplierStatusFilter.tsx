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
import { ChevronDown, ToggleLeft } from 'lucide-react'
import { cn } from '@/core/lib/utils'

const STATUS_OPTIONS: Array<{ value: 'all' | 'aktif' | 'nonaktif' | 'blacklist'; label: string }> = [
  { value: 'all', label: 'Semua status' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
  { value: 'blacklist', label: 'Blacklist' },
]

type SupplierStatusFilterProps = {
  value?: 'all' | 'aktif' | 'nonaktif' | 'blacklist'
  onChange: (value?: 'all' | 'aktif' | 'nonaktif' | 'blacklist') => void
}

export function SupplierStatusFilter({ value = 'all', onChange }: SupplierStatusFilterProps) {
  const hasSelection = value !== 'all'
  const displayText = STATUS_OPTIONS.find((option) => option.value === value)?.label ?? 'Semua status'

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
          <ToggleLeft className="h-3.5 w-3.5 text-indigo-500" />
          {displayText}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0"
        align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={(val) => onChange(val as SupplierStatusFilterProps['value'])}>
          {STATUS_OPTIONS.map(({ value: statusValue, label }) => (
            <DropdownMenuRadioItem
              key={statusValue}
              value={statusValue}
              className="cursor-pointer"
            >
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
