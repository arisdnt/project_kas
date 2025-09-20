import { useEffect, useMemo, useRef, useState } from 'react'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { Search, User, X } from 'lucide-react'

export function CustomerSelector() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const { items, search, loading } = usePelangganStore()
  const pelanggan = useKasirStore((s) => s.pelanggan)
  const setPelanggan = useKasirStore((s) => s.setPelanggan)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const term = q.trim()
    if (term.length === 0) return
    const t = setTimeout(() => search(term), 250)
    return () => clearTimeout(t)
  }, [q, search])

  const results = useMemo(() => items, [items])

  const select = async (idx: number) => {
    const r = results[idx]
    if (!r) return
    await setPelanggan({ id: r.id, nama: r.nama || r.email || r.telepon || 'Umum' })
    setOpen(false)
    setQ('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) void select(selectedIndex)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, -1))
    } else if (e.key === 'Escape') {
      e.preventDefault(); setOpen(false); setQ('')
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Pelanggan</span>
        </div>
        {pelanggan ? (
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-900">{pelanggan.nama || 'Umum'}</div>
            <Button variant="secondary" size="sm" onClick={() => setPelanggan(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)}>
            Pilih
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari pelanggan (nama/email/telp)"
              className="pl-9"
            />
          </div>
          {/* Overlay dropdown modern */}
          <div className="relative">
            <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-xl max-h-72 overflow-auto">
              {loading && <div className="p-3 text-sm text-gray-500">Memuat...</div>}
              {!loading && results.length === 0 && (
                <div className="p-3 text-sm text-gray-500">Tidak ada hasil</div>
              )}
              {results.map((r, idx) => (
                <button
                  key={r.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 flex items-center justify-between ${
                    idx === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => select(idx)}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm ${idx === selectedIndex ? 'text-blue-900' : 'text-gray-900'}`}>{r.nama || '-'}</span>
                    <span className={`text-xs ${idx === selectedIndex ? 'text-blue-600' : 'text-gray-500'}`}>
                      {r.email || r.telepon || ''}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

