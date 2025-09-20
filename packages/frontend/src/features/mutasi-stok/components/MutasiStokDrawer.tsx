import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/core/lib/utils"

const MutasiStokDrawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  shouldScaleBackground?: boolean
}) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
MutasiStokDrawer.displayName = "MutasiStokDrawer"

const MutasiStokDrawerTrigger = DrawerPrimitive.Trigger

const MutasiStokDrawerPortal = DrawerPrimitive.Portal

const MutasiStokDrawerClose = DrawerPrimitive.Close

const MutasiStokDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
MutasiStokDrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const MutasiStokDrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <MutasiStokDrawerPortal>
    <MutasiStokDrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 right-0 z-50 h-full w-3/4 gap-4 border-l bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </MutasiStokDrawerPortal>
))
MutasiStokDrawerContent.displayName = "MutasiStokDrawerContent"

const MutasiStokDrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
MutasiStokDrawerHeader.displayName = "MutasiStokDrawerHeader"

const MutasiStokDrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
MutasiStokDrawerFooter.displayName = "MutasiStokDrawerFooter"

const MutasiStokDrawerTitle = React.forwardRef<
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
MutasiStokDrawerTitle.displayName = DrawerPrimitive.Title.displayName

const MutasiStokDrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
MutasiStokDrawerDescription.displayName =
  DrawerPrimitive.Description.displayName

export {
  MutasiStokDrawer,
  MutasiStokDrawerPortal,
  MutasiStokDrawerOverlay,
  MutasiStokDrawerTrigger,
  MutasiStokDrawerClose,
  MutasiStokDrawerContent,
  MutasiStokDrawerHeader,
  MutasiStokDrawerFooter,
  MutasiStokDrawerTitle,
  MutasiStokDrawerDescription,
}