import { Badge } from '@/core/components/ui/badge'
import { Clock } from 'lucide-react'

interface Props {
  lastUpdatedAt: Date | null
}

export function LiveUpdateBadge({ lastUpdatedAt }: Props) {
  if (!lastUpdatedAt) return null

  const timeAgo = Math.floor((Date.now() - lastUpdatedAt.getTime()) / 1000)

  let displayText = 'Baru saja'
  if (timeAgo > 60) {
    const minutes = Math.floor(timeAgo / 60)
    displayText = `${minutes}m lalu`
  } else if (timeAgo > 10) {
    displayText = `${timeAgo}d lalu`
  }

  return (
    <Badge variant="outline" className="text-xs">
      <Clock className="mr-1 h-3 w-3" />
      {displayText}
    </Badge>
  )
}