import { useEffect, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Search, X, Plus } from 'lucide-react'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'

type Props = {
  onCreate?: () => void
}

export function PelangganToolbar({ onCreate }: Props) {
  const { setSearch, setTypeFilter, setStatusFilter, loadFirst } = usePelangganStore()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(query)
      loadFirst()
    }, 350)
    return () => clearTimeout(id)
  }, [query, setSearch, loadFirst])

  const handleTypeChange = (value: string) => {
    setType(value)
    setTypeFilter(value === 'all' ? undefined : value as 'reguler' | 'vip' | 'member' | 'wholesale')
    loadFirst()
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setStatusFilter(value === 'all' ? undefined : value as 'aktif' | 'nonaktif' | 'blacklist')
    loadFirst()
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama, kode, email, telepon..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="reguler">Reguler</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="wholesale">Wholesale</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="nonaktif">Nonaktif</SelectItem>
            <SelectItem value="blacklist">Blacklist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center">
        <Button onClick={onCreate} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" /> Tambah Pelanggan
        </Button>
      </div>
    </div>
  )
}

