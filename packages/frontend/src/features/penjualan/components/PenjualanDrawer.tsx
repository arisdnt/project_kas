import * as React from 'react'
import { cn } from '@/core/lib/utils'

interface PenjualanDrawerContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PenjualanDrawerContext = React.createContext<PenjualanDrawerContextValue | undefined>(undefined)

function usePenjualanDrawer() {
  const context = React.useContext(PenjualanDrawerContext)
  if (!context) {
    throw new Error('usePenjualanDrawer must be used within a PenjualanDrawer')
  }
  return context
}

interface PenjualanDrawerProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PenjualanDrawer({ children, open, onOpenChange }: PenjualanDrawerProps) {
  return (
    <PenjualanDrawerContext.Provider value={{ open, onOpenChange }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => onOpenChange(false)}
        />
      )}
    </PenjualanDrawerContext.Provider>
  )
}

interface PenjualanDrawerContentProps {
  children: React.ReactNode
  className?: string
}

function PenjualanDrawerContent({ children, className }: PenjualanDrawerContentProps) {
  const { open, onOpenChange } = usePenjualanDrawer()

  if (!open) return null

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-50 h-full w-[35vw] flex flex-col bg-white shadow-xl",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

interface PenjualanDrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

function PenjualanDrawerHeader({ children, className }: PenjualanDrawerHeaderProps) {
  return (
    <div className={cn("flex-shrink-0", className)}>
      {children}
    </div>
  )
}

interface PenjualanDrawerTitleProps {
  children: React.ReactNode
  className?: string
}

function PenjualanDrawerTitle({ children, className }: PenjualanDrawerTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

export {
  PenjualanDrawer,
  PenjualanDrawerContent,
  PenjualanDrawerHeader,
  PenjualanDrawerTitle
}