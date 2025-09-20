import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Button } from '@/core/components/ui/button'
import { Image as ImageIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type LogoFilterProps = {
  value?: ('with-logo' | 'without-logo')[]
  onChange: (value?: ('with-logo' | 'without-logo')[]) => void
  withLogoCount: number
  withoutLogoCount: number
}

export function LogoFilter({ value, onChange, withLogoCount, withoutLogoCount }: LogoFilterProps) {
  const selectedCount = value?.length ?? 0
  const hasSelection = selectedCount > 0

  const handleToggle = (key: 'with-logo' | 'without-logo', checked: boolean) => {
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
    if (selectedCount === 0) return 'Logo'
    if (selectedCount === 1) {
      return value![0] === 'with-logo' ? 'Dengan logo' : 'Tanpa logo'
    }
    return 'Semua logo'
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
          <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
          {displayLabel}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0"
        align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuLabel>Filter Logo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={value?.includes('with-logo') ?? false}
          onCheckedChange={(checked) => handleToggle('with-logo', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Dengan logo</span>
          <span className="text-[12px] text-slate-400">{withLogoCount}</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={value?.includes('without-logo') ?? false}
          onCheckedChange={(checked) => handleToggle('without-logo', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Tanpa logo</span>
          <span className="text-[12px] text-slate-400">{withoutLogoCount}</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
