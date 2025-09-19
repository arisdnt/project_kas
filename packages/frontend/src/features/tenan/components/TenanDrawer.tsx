import * as React from "react"
import * as DrawerPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/core/lib/utils"

const TenanDrawer = DrawerPrimitive.Root

const TenanDrawerTrigger = DrawerPrimitive.Trigger

const TenanDrawerPortal = DrawerPrimitive.Portal

const TenanDrawerClose = DrawerPrimitive.Close

const TenanDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
TenanDrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const tenanDrawerVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
      size: {
        content: "",
        default: "h-[96%]",
        sm: "h-[33%]",
        lg: "h-[85%]",
        xl: "h-[95%]",
        full: "h-full",
      },
    },
    defaultVariants: {
      side: "bottom",
      size: "content",
    },
  }
)

export interface TenanDrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>,
    VariantProps<typeof tenanDrawerVariants> {}

const TenanDrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  TenanDrawerContentProps
>(({ side = "bottom", size = "content", className, children, ...props }, ref) => (
  <TenanDrawerPortal>
    <TenanDrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(tenanDrawerVariants({ side, size }), className)}
      {...props}
    >
      {children}
      <DrawerPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Tutup</span>
      </DrawerPrimitive.Close>
    </DrawerPrimitive.Content>
  </TenanDrawerPortal>
))
TenanDrawerContent.displayName = "TenanDrawerContent"

const TenanDrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "grid gap-1.5 p-4 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
TenanDrawerHeader.displayName = "TenanDrawerHeader"

const TenanDrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
TenanDrawerFooter.displayName = "TenanDrawerFooter"

const TenanDrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
TenanDrawerTitle.displayName = DrawerPrimitive.Title.displayName

const TenanDrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
TenanDrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  TenanDrawer,
  TenanDrawerPortal,
  TenanDrawerOverlay,
  TenanDrawerTrigger,
  TenanDrawerClose,
  TenanDrawerContent,
  TenanDrawerHeader,
  TenanDrawerFooter,
  TenanDrawerTitle,
  TenanDrawerDescription,
}