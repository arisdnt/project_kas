import { useMemo } from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Button } from '@/core/components/ui/button'
import { ChevronDown, ToggleLeft } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type StatusFilterProps = {
  value?: ('aktif' | 'tidak aktif')[]
  onChange: (value?: ('aktif' | 'tidak aktif')[]) => void
}

const statusOptions = [
  { value: 'aktif' as const, label: 'Aktif' },
  { value: 'tidak aktif' as const, label: 'Tidak Aktif' },
]

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const selectedCount = value?.length || 0
  const hasSelection = selectedCount > 0

  const handleToggle = (status: 'aktif' | 'tidak aktif', checked: boolean) => {
    const next = new Set(value ?? [])
    if (checked) {
      next.add(status)
    } else {
      next.delete(status)
    }
    const arr = Array.from(next)
    onChange(arr.length > 0 ? arr : undefined)
  }

  const displayText = useMemo(() => {
    if (selectedCount === 0) return 'Status'
    if (selectedCount === 1) {
      return value![0] === 'aktif' ? 'Aktif' : 'Tidak Aktif'
    }
    return `${selectedCount} status`
  }, [selectedCount, value])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasSelection ? 'secondary' : 'outline'}
          size="sm"
          className={cn(
            'h-9 gap-1 rounded-lg px-3 text-[13px] w-full',
            hasSelection && 'bg-blue-50 text-blue-700 border-blue-200'
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
        {statusOptions.map(({ value: statusValue, label }) => (
          <DropdownMenuCheckboxItem
            key={statusValue}
            checked={value?.includes(statusValue) ?? false}
            onCheckedChange={(checked) => handleToggle(statusValue, checked)}
            className="hover:bg-slate-600 hover:text-white focus:bg-slate-600 focus:text-white"
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}