import { useEffect, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { useBrandStore } from '@/features/brand/store/brandStore'
import { useAuthStore } from '@/core/store/authStore'
import { Plus, Search, X } from 'lucide-react'

type Props = {
  onCreate: () => void
}

export function BrandToolbar({ onCreate }: Props) {
  const { setSearch, loadFirst } = useBrandStore()
  const { isAuthenticated, user } = useAuthStore()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    const id = setTimeout(() => {
      setSearch(query)
      loadFirst()
    }, 350)
    return () => clearTimeout(id)
  }, [query, setSearch, loadFirst, isAuthenticated])

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari brand..."
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
      </div>

      <div className="flex items-center">
        <Button onClick={onCreate} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" /> Tambah Brand
        </Button>
      </div>
    </div>
  )
}

