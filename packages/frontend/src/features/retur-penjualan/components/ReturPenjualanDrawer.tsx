import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/core/lib/utils"

const ReturPenjualanDrawer = DialogPrimitive.Root

const ReturPenjualanDrawerTrigger = DialogPrimitive.Trigger

const ReturPenjualanDrawerPortal = DialogPrimitive.Portal

const ReturPenjualanDrawerClose = DialogPrimitive.Close

const ReturPenjualanDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ReturPenjualanDrawerOverlay.displayName = DialogPrimitive.Overlay.displayName

const returPenjualanDrawerVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        right:
          "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
      },
      size: {
        default: "w-3/4 sm:max-w-sm md:max-w-md lg:max-w-lg",
        full: "w-full max-w-none",
        forty: "w-[90vw] max-w-none md:w-[40%] lg:w-[40%]",
        fifty: "w-[90vw] max-w-none md:w-[50%] lg:w-[50%]",
      },
    },
    defaultVariants: {
      side: "right",
      size: "default",
    },
  }
)

export interface ReturPenjualanDrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof returPenjualanDrawerVariants> {}

const ReturPenjualanDrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ReturPenjualanDrawerContentProps
>(({ side = "right", size, className, children, ...props }, ref) => (
  <ReturPenjualanDrawerPortal>
    <ReturPenjualanDrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(returPenjualanDrawerVariants({ side, size }), className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Tutup</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ReturPenjualanDrawerPortal>
))
ReturPenjualanDrawerContent.displayName = DialogPrimitive.Content.displayName

const ReturPenjualanDrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
ReturPenjualanDrawerHeader.displayName = "ReturPenjualanDrawerHeader"

const ReturPenjualanDrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
ReturPenjualanDrawerFooter.displayName = "ReturPenjualanDrawerFooter"

const ReturPenjualanDrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
ReturPenjualanDrawerTitle.displayName = DialogPrimitive.Title.displayName

const ReturPenjualanDrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ReturPenjualanDrawerDescription.displayName = DialogPrimitive.Description.displayName

export {
  ReturPenjualanDrawer,
  ReturPenjualanDrawerPortal,
  ReturPenjualanDrawerOverlay,
  ReturPenjualanDrawerTrigger,
  ReturPenjualanDrawerClose,
  ReturPenjualanDrawerContent,
  ReturPenjualanDrawerHeader,
  ReturPenjualanDrawerFooter,
  ReturPenjualanDrawerTitle,
  ReturPenjualanDrawerDescription,
}