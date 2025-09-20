import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Button } from '@/core/components/ui/button'
import { Globe2, ChevronDown } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type WebsiteFilterProps = {
  value?: ('with-website' | 'without-website')[]
  onChange: (value?: ('with-website' | 'without-website')[]) => void
  withWebsiteCount: number
  withoutWebsiteCount: number
}

export function WebsiteFilter({ value, onChange, withWebsiteCount, withoutWebsiteCount }: WebsiteFilterProps) {
  const selectedCount = value?.length ?? 0
  const hasSelection = selectedCount > 0

  const handleToggle = (key: 'with-website' | 'without-website', checked: boolean) => {
    const next = new Set(value ?? [])
    if (checked) {
      next.add(key)
    } else {
      next.delete(key)
    }
    const arr = Array.from(next)
    onChange(arr.length > 0 ? arr : undefined)
  }

  const displayLabel = (() => {
    if (selectedCount === 0) return 'Website'
    if (selectedCount === 1) {
      return value![0] === 'with-website' ? 'Dengan website' : 'Tanpa website'
    }
    return 'Semua website'
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
          <Globe2 className="h-3.5 w-3.5 text-indigo-500" />
          {displayLabel}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0"
        align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuLabel>Filter Website</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={value?.includes('with-website') ?? false}
          onCheckedChange={(checked) => handleToggle('with-website', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Dengan website</span>
          <span className="text-[12px] text-slate-400">{withWebsiteCount}</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={value?.includes('without-website') ?? false}
          onCheckedChange={(checked) => handleToggle('without-website', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Tanpa website</span>
          <span className="text-[12px] text-slate-400">{withoutWebsiteCount}</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
