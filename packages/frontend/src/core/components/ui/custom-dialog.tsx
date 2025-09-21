import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, HelpCircle } from "lucide-react"
import { cn } from "@/core/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Tutup</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Custom System Dialog Types
export type SystemDialogType = 'info' | 'warning' | 'error' | 'question' | 'success'

const dialogTypeConfig = {
  info: {
    icon: Info,
    className: "border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-200",
    iconClassName: "text-blue-600 dark:text-blue-400"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-200 text-yellow-800 dark:border-yellow-800 dark:text-yellow-200",
    iconClassName: "text-yellow-600 dark:text-yellow-400"
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 text-red-800 dark:border-red-800 dark:text-red-200",
    iconClassName: "text-red-600 dark:text-red-400"
  },
  question: {
    icon: HelpCircle,
    className: "border-purple-200 text-purple-800 dark:border-purple-800 dark:text-purple-200",
    iconClassName: "text-purple-600 dark:text-purple-400"
  },
  success: {
    icon: CheckCircle,
    className: "border-green-200 text-green-800 dark:border-green-800 dark:text-green-200",
    iconClassName: "text-green-600 dark:text-green-400"
  }
}

interface SystemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: SystemDialogType
  title: string
  message: string
  buttons?: Array<{
    label: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    onClick: () => void
  }>
  defaultButton?: number
}

const SystemDialog: React.FC<SystemDialogProps> = ({
  open,
  onOpenChange,
  type,
  title,
  message,
  buttons = [{ label: 'OK', onClick: () => onOpenChange(false) }],
  defaultButton = 0
}) => {
  const config = dialogTypeConfig[type]
  const IconComponent = config.icon

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && defaultButton >= 0 && defaultButton < buttons.length) {
        e.preventDefault()
        buttons[defaultButton].onClick()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, buttons, defaultButton, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", config.className)}>
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <IconComponent className={cn("h-6 w-6", config.iconClassName)} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="text-base leading-relaxed pl-9">
          {message}
        </DialogDescription>

        <DialogFooter className="pl-9">
          <div className="flex space-x-2">
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  "h-10 px-4 py-2",
                  {
                    'bg-primary text-primary-foreground hover:bg-primary/90': !button.variant || button.variant === 'default',
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90': button.variant === 'destructive',
                    'border border-input bg-background hover:bg-accent hover:text-accent-foreground': button.variant === 'outline',
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80': button.variant === 'secondary',
                    'hover:bg-accent hover:text-accent-foreground': button.variant === 'ghost',
                    'text-primary underline-offset-4 hover:underline': button.variant === 'link',
                  },
                  index === defaultButton && 'ring-2 ring-ring ring-offset-2'
                )}
                autoFocus={index === defaultButton}
              >
                {button.label}
              </button>
            ))}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  SystemDialog,
  type SystemDialogProps
}