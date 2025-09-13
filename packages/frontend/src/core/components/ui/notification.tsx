import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"

const notificationVariants = cva(
  "relative flex w-full items-start space-x-3 rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground",
        success: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
        error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
        info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
}

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string
  description?: string
  onDelete?: () => void
  showDelete?: boolean
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ className, variant = "default", title, description, onDelete, showDelete = true, children, ...props }, ref) => {
    const IconComponent = iconMap[variant || "default"]

    return (
      <div
        ref={ref}
        className={cn(notificationVariants({ variant }), className)}
        {...props}
      >
        <div className="flex-shrink-0">
          <IconComponent className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-semibold mb-1">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm opacity-90">
              {description}
            </p>
          )}
          {children}
        </div>

        {showDelete && onDelete && (
          <button
            onClick={onDelete}
            className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Hapus notifikasi"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Notification.displayName = "Notification"

const NotificationList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-3", className)}
    {...props}
  >
    {children}
  </div>
))
NotificationList.displayName = "NotificationList"

const NotificationContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-50 w-full max-w-sm space-y-3",
      "sm:max-w-md md:max-w-lg",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
NotificationContainer.displayName = "NotificationContainer"

export { Notification, NotificationList, NotificationContainer, notificationVariants }