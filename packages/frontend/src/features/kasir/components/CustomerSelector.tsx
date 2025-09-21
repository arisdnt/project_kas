import { useEffect, useMemo, useRef, useState, useId } from 'react'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { Search, User, X } from 'lucide-react'

export function CustomerSelector() {
  const listboxId = useId()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { items, loading } = usePelangganStore()
  const searchFn = useRef<(q: string) => Promise<void> | void>()
  // Initialize search function ref once
  if (!searchFn.current) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s: any = (usePelangganStore as any).getState()
    searchFn.current = s.search?.bind(s)
  }
  const pelanggan = useKasirStore((s) => s.pelanggan)
  const setPelanggan = useKasirStore((s) => s.setPelanggan)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const term = q.trim()
    if (term.length === 0) return
    const t = setTimeout(() => searchFn.current?.(term), 250)
    return () => clearTimeout(t)
  }, [q])

  const results = useMemo(() => items, [items])

  // Keep active option in view when navigating with keyboard
  useEffect(() => {
    if (!open) return
    if (selectedIndex < 0) return
    const opt = document.getElementById(`${listboxId}-opt-${selectedIndex}`)
    opt?.scrollIntoView({ block: 'nearest' })
  }, [open, selectedIndex, listboxId])

  const select = async (idx: number) => {
    const r = results[idx]
    if (!r) return
    await setPelanggan({ id: r.id, nama: r.nama || r.email || r.telepon || 'Umum' })
    setOpen(false)
    setQ('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow F-keys to propagate to global handler
    if (e.key.startsWith('F')) {
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        void select(selectedIndex)
      } else if (results.length > 0) {
        // Default to first result when none highlighted
        void select(0)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      // Ensure dropdown is open when navigating
      if (!open && q.trim().length > 0) setOpen(true)
      setSelectedIndex((p) => {
        const next = p < 0 ? 0 : p + 1
        return Math.min(next, results.length - 1)
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, -1))
    } else if (e.key === 'Escape') {
      e.preventDefault(); setOpen(false); setQ('')
    }
  }

  return (
    <div className="relative w-full">
      {/* Always show one consistent input/display */}
      {pelanggan ? (
        <div
          className="flex items-center justify-between h-10 px-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => {
            setOpen(true)
            setQ('')
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          data-customer-search
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-900 truncate">{pelanggan.nama}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setPelanggan(null)
            }}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="Cari pelanggan atau biarkan kosong untuk umum... [F2]"
            className="pl-9 h-10 text-sm"
            role="combobox"
            aria-expanded={open && q.trim().length > 0}
            aria-controls={open && q.trim().length > 0 ? listboxId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={selectedIndex >= 0 ? `${listboxId}-opt-${selectedIndex}` : undefined}
            data-customer-search
          />
          {!open && q.trim().length === 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
              Umum
            </div>
          )}
        </div>
      )}

      {/* Search results dropdown */}
      {open && q.trim().length > 0 && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Hasil pencarian pelanggan"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loading && (
            <div className="p-3 text-sm text-gray-500 flex items-center gap-2" aria-live="polite">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              Mencari...
            </div>
          )}
          {!loading && results.length === 0 && q.trim().length > 0 && (
            <div className="p-3 text-sm text-gray-500">
              Pelanggan tidak ditemukan
            </div>
          )}
          {!loading && results.length > 0 && results.map((r, idx) => (
            <button
              key={r.id}
              type="button"
              id={`${listboxId}-opt-${idx}`}
              role="option"
              aria-selected={idx === selectedIndex}
              className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                idx === selectedIndex ? 'bg-blue-50' : ''
              }`}
              onClick={() => select(idx)}
            >
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${idx === selectedIndex ? 'text-blue-900' : 'text-gray-900'}`}>
                  {r.nama || '-'}
                </span>
                <span className={`text-xs ${idx === selectedIndex ? 'text-blue-600' : 'text-gray-500'}`}>
                  {r.email || r.telepon || ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

