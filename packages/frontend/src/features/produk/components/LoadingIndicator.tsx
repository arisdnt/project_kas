import { DotFilledIcon } from '@radix-ui/react-icons'

export function LoadingIndicator() {
  return (
    <div className="sticky bottom-0 left-0 right-0 flex items-center justify-center bg-gradient-to-t from-white via-white/80 to-transparent pb-3 pt-6">
      <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-500 shadow-sm">
        <DotFilledIcon className="h-3 w-3 animate-pulse text-blue-500" />
        Memuat data tambahan…
      </span>
    </div>
  )
}