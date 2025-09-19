import * as React from "react"
import { Button } from "@/core/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu"
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { cn } from "@/core/lib/utils"

export interface ActionButtonProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "ghost" | "outline"
  showLabels?: boolean
  viewLabel?: string
  editLabel?: string
  deleteLabel?: string
}

export function ActionButton({
  onView,
  onEdit,
  onDelete,
  className,
  disabled = false,
  size = "sm",
  variant = "ghost",
  showLabels = true,
  viewLabel = "Lihat Detail",
  editLabel = "Edit",
  deleteLabel = "Hapus"
}: ActionButtonProps) {
  const hasActions = onView || onEdit || onDelete

  if (!hasActions) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
            className
          )}
          disabled={disabled}
        >
          <span className="sr-only">Buka menu aksi</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {onView && (
          <DropdownMenuItem
            onClick={onView}
            className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showLabels ? viewLabel : ""}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            onClick={onEdit}
            className="cursor-pointer text-amber-600 hover:text-amber-700 hover:bg-amber-50 focus:bg-amber-50 focus:text-amber-700"
          >
            <Pencil className="mr-2 h-4 w-4" />
            {showLabels ? editLabel : ""}
          </DropdownMenuItem>
        )}
        {onDelete && onView && (
          <DropdownMenuSeparator />
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {showLabels ? deleteLabel : ""}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Separate buttons variant for when you want individual buttons instead of dropdown
export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  className,
  disabled = false,
  size = "sm",
  gap = "gap-2"
}: ActionButtonProps & { gap?: string }) {
  return (
    <div className={cn("flex items-center", gap, className)}>
      {onView && (
        <Button
          variant="ghost"
          size={size}
          onClick={onView}
          disabled={disabled}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500"
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Lihat Detail</span>
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size={size}
          onClick={onEdit}
          disabled={disabled}
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 focus:ring-2 focus:ring-amber-500"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size={size}
          onClick={onDelete}
          disabled={disabled}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Hapus</span>
        </Button>
      )}
    </div>
  )
}