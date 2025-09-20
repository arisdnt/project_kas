import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Button } from '@/core/components/ui/button'
import { CreditCard, ChevronDown } from 'lucide-react'
import { cn } from '@/core/lib/utils'

type BankFilterProps = {
  value?: ('with-bank' | 'without-bank')[]
  onChange: (value?: ('with-bank' | 'without-bank')[]) => void
  withBankCount: number
  withoutBankCount: number
}

export function BankFilter({ value, onChange, withBankCount, withoutBankCount }: BankFilterProps) {
  const selectedCount = value?.length ?? 0
  const hasSelection = selectedCount > 0

  const handleToggle = (key: 'with-bank' | 'without-bank', checked: boolean) => {
    const next = new Set(value ?? [])
    if (checked) next.add(key)
    else next.delete(key)
    const arr = Array.from(next)
    onChange(arr.length > 0 ? arr : undefined)
  }

  const displayLabel = (() => {
    if (selectedCount === 0) return 'Rekening'
    if (selectedCount === 1) {
      return value![0] === 'with-bank' ? 'Dengan rekening' : 'Tanpa rekening'
    }
    return 'Semua rekening'
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
          <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
          {displayLabel}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0"
        align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <DropdownMenuLabel>Filter Rekening Bank</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={value?.includes('with-bank') ?? false}
          onCheckedChange={(checked) => handleToggle('with-bank', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Dengan rekening</span>
          <span className="text-[12px] text-slate-400">{withBankCount}</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={value?.includes('without-bank') ?? false}
          onCheckedChange={(checked) => handleToggle('without-bank', checked)}
          className="flex items-center justify-between gap-4"
        >
          <span>Tanpa rekening</span>
          <span className="text-[12px] text-slate-400">{withoutBankCount}</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
