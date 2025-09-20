import { Loader2 } from 'lucide-react'

export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Memuat data...</span>
      </div>
    </div>
  )
}