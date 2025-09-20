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
import { ChevronDown, Truck } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type SupplierFilterProps = {
  value?: string[]
  options: string[]
  onChange: (value?: string[]) => void
}

export function SupplierFilter({ value, options, onChange }: SupplierFilterProps) {
  const selectedCount = value?.length || 0
  const hasSelection = selectedCount > 0

  const handleToggle = (supplier: string, checked: boolean) => {
    const next = new Set(value ?? [])
    if (checked) {
      next.add(supplier)
    } else {
      next.delete(supplier)
    }
    const arr = Array.from(next)
    onChange(arr.length > 0 ? arr : undefined)
  }

  const displayText = useMemo(() => {
    if (selectedCount === 0) return 'Supplier'
    if (selectedCount === 1) return value![0]
    return `${selectedCount} supplier`
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
          <Truck className="h-3.5 w-3.5 text-emerald-500" />
          {displayText}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0"
        align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuLabel>Filter Supplier</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.length > 0 ? (
          options.map((supplier) => (
            <DropdownMenuCheckboxItem
              key={supplier}
              checked={value?.includes(supplier) ?? false}
              onCheckedChange={(checked) => handleToggle(supplier, checked)}
              className="hover:bg-slate-600 hover:text-white focus:bg-slate-600 focus:text-white"
            >
              {supplier}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuLabel className="text-xs text-slate-400">
            Tidak ada supplier tersedia
          </DropdownMenuLabel>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}