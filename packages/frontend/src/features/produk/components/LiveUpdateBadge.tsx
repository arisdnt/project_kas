import { Badge } from '@/core/components/ui/badge'
import * as Tooltip from '@radix-ui/react-tooltip'

type LiveUpdateBadgeProps = {
  lastUpdatedAt: number
  currentPage: number
  displayedCount: number
  totalCount: number
}

export function LiveUpdateBadge({ lastUpdatedAt, currentPage, displayedCount, totalCount }: LiveUpdateBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-2 text-[11px] text-slate-600">
      <Tooltip.Provider delayDuration={120}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Badge className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live {new Date(lastUpdatedAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </Badge>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              sideOffset={8}
              className="z-50 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-md"
            >
              Data diperbarui otomatis tanpa kedipan.
              <Tooltip.Arrow className="fill-white" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
      <span>Halaman {currentPage}</span>
      <span>Menampilkan {displayedCount} dari {totalCount} produk</span>
    </div>
  )
}