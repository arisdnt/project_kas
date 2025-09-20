import * as React from 'react'
import { cn } from '@/core/lib/utils'

interface PembelianDrawerContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PembelianDrawerContext = React.createContext<PembelianDrawerContextValue | undefined>(undefined)

function usePembelianDrawer() {
  const context = React.useContext(PembelianDrawerContext)
  if (!context) {
    throw new Error('usePembelianDrawer must be used within a PembelianDrawer')
  }
  return context
}

interface PembelianDrawerProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PembelianDrawer({ children, open, onOpenChange }: PembelianDrawerProps) {
  return (
    <PembelianDrawerContext.Provider value={{ open, onOpenChange }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => onOpenChange(false)}
        />
      )}
    </PembelianDrawerContext.Provider>
  )
}

interface PembelianDrawerContentProps {
  children: React.ReactNode
  className?: string
}

function PembelianDrawerContent({ children, className }: PembelianDrawerContentProps) {
  const { open, onOpenChange } = usePembelianDrawer()

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

interface PembelianDrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

function PembelianDrawerHeader({ children, className }: PembelianDrawerHeaderProps) {
  return (
    <div className={cn("flex-shrink-0", className)}>
      {children}
    </div>
  )
}

interface PembelianDrawerTitleProps {
  children: React.ReactNode
  className?: string
}

function PembelianDrawerTitle({ children, className }: PembelianDrawerTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

export {
  PembelianDrawer,
  PembelianDrawerContent,
  PembelianDrawerHeader,
  PembelianDrawerTitle
}