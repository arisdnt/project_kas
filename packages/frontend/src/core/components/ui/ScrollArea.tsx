import React, { ReactNode } from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/core/lib/utils';

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollHideDelay?: number;
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ children, className, orientation = 'vertical', scrollHideDelay = 600, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>

    {(orientation === 'vertical' || orientation === 'both') && (
      <ScrollAreaPrimitive.Scrollbar
        className="flex touch-none select-none transition-colors duration-300 ease-out hover:bg-accent/20 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent data-[orientation=vertical]:p-[1px]"
        orientation="vertical"
        forceMount
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border transition-colors hover:bg-border/80" />
      </ScrollAreaPrimitive.Scrollbar>
    )}

    {(orientation === 'horizontal' || orientation === 'both') && (
      <ScrollAreaPrimitive.Scrollbar
        className="flex touch-none select-none transition-colors duration-300 ease-out hover:bg-accent/20 data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=horizontal]:p-[1px]"
        orientation="horizontal"
        forceMount
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border transition-colors hover:bg-border/80" />
      </ScrollAreaPrimitive.Scrollbar>
    )}

    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { ScrollArea };