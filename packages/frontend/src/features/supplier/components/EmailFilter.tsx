import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Button } from '@/core/components/ui/button'
import { Mail, ChevronDown } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type EmailFilterProps = {
  value?: ('with-email' | 'without-email')[]
  onChange: (value?: ('with-email' | 'without-email')[]) => void
  withEmailCount: number
  withoutEmailCount: number
}

export function EmailFilter({ value, onChange, withEmailCount, withoutEmailCount }: EmailFilterProps) {
  const selectedCount = value?.length ?? 0
  const hasSelection = selectedCount > 0

  const handleToggle = (key: 'with-email' | 'without-email', checked: boolean) => {
    const next = new Set(value ?? [])
    if (checked) next.add(key)
    else next.delete(key)
    const arr = Array.from(next)
    onChange(arr.length > 0 ? arr : undefined)
  }

  const displayLabel = (() => {
    if (selectedCount === 0) return 'Email'
    if (selectedCount === 1) {
      return value![0] === 'with-email' ? 'Dengan email' : 'Tanpa email'
    }
    return 'Semua email'
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
          <Mail className="h-3.5 w-3.5 text-indigo-500" />
          {displayLabel}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0"
        align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuLabel>Filter Email</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={value?.includes('with-email') ?? false}
          onCheckedChange={(checked) => handleToggle('with-email', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Dengan email</span>
          <span className="text-[12px] text-slate-400">{withEmailCount}</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={value?.includes('without-email') ?? false}
          onCheckedChange={(checked) => handleToggle('without-email', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Tanpa email</span>
          <span className="text-[12px] text-slate-400">{withoutEmailCount}</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
