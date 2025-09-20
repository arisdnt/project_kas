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
import { ChevronDown } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type CategoryFilterProps = {
  value?: string[]
  options: string[]
  onChange: (value?: string[]) => void
}

export function CategoryFilter({ value, options, onChange }: CategoryFilterProps) {
  const selectedCount = value?.length || 0
  const hasSelection = selectedCount > 0

  const handleToggle = (category: string, checked: boolean) => {
    const next = new Set(value ?? [])
    if (checked) {
      next.add(category)
    } else {
      next.delete(category)
    }
    const arr = Array.from(next)
    onChange(arr.length > 0 ? arr : undefined)
  }

  const displayText = useMemo(() => {
    if (selectedCount === 0) return 'Kategori'
    if (selectedCount === 1) return value![0]
    return `${selectedCount} kategori`
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
          {displayText}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Filter Kategori</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.length > 0 ? (
          options.map((category) => (
            <DropdownMenuCheckboxItem
              key={category}
              checked={value?.includes(category) ?? false}
              onCheckedChange={(checked) => handleToggle(category, checked)}
            >
              {category}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuLabel className="text-xs text-slate-400">
            Tidak ada kategori tersedia
          </DropdownMenuLabel>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}