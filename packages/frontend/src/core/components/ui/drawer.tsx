import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/core/utils/cn';

// Lightweight drawer abstraction (side panel) built on Radix Dialog
export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerPortal = (props: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
);

export const DrawerOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', className)}
    {...props}
  />
));
DrawerOverlay.displayName = 'DrawerOverlay';

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<'div'> {
  side?: 'right' | 'left';
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(({ className, side = 'right', ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <div className="fixed inset-0 z-50 flex">
      {side === 'right' && <div className="flex-1" aria-hidden />}
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'w-full sm:w-[40%] bg-background shadow-xl h-full flex flex-col border-l transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:fade-in data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
          side === 'left' && 'border-l-0 border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
          className
        )}
        {...props}
      />
      {side === 'left' && <div className="flex-1" aria-hidden />}
    </div>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

export const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 pt-5 pb-3 border-b', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

export const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<'h2'>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
));
DrawerTitle.displayName = 'DrawerTitle';

export const DrawerDescription = DialogPrimitive.Description;
