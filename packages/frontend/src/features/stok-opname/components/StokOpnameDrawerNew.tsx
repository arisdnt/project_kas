import * as React from 'react'
import { cn } from '@/core/lib/utils'

interface StokOpnameDrawerContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const StokOpnameDrawerContext = React.createContext<StokOpnameDrawerContextValue | undefined>(undefined)

function useStokOpnameDrawer() {
  const context = React.useContext(StokOpnameDrawerContext)
  if (!context) {
    throw new Error('useStokOpnameDrawer must be used within a StokOpnameDrawer')
  }
  return context
}

interface StokOpnameDrawerProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

function StokOpnameDrawerNew({ children, open, onOpenChange }: StokOpnameDrawerProps) {
  return (
    <StokOpnameDrawerContext.Provider value={{ open, onOpenChange }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => onOpenChange(false)}
        />
      )}
    </StokOpnameDrawerContext.Provider>
  )
}

interface StokOpnameDrawerContentProps {
  children: React.ReactNode
  className?: string
}

function StokOpnameDrawerContentNew({ children, className }: StokOpnameDrawerContentProps) {
  const { open, onOpenChange } = useStokOpnameDrawer()

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

interface StokOpnameDrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

function StokOpnameDrawerHeaderNew({ children, className }: StokOpnameDrawerHeaderProps) {
  return (
    <div className={cn("flex-shrink-0", className)}>
      {children}
    </div>
  )
}

interface StokOpnameDrawerTitleProps {
  children: React.ReactNode
  className?: string
}

function StokOpnameDrawerTitleNew({ children, className }: StokOpnameDrawerTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

export {
  StokOpnameDrawerNew,
  StokOpnameDrawerContentNew,
  StokOpnameDrawerHeaderNew,
  StokOpnameDrawerTitleNew
}