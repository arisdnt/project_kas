import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Calculator, X } from 'lucide-react'
import { Button } from '../../button'

interface CalculatorHeaderProps {
  onStartDrag: (e: React.MouseEvent) => void
  onClose: () => void
  className?: string
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  onStartDrag,
  onClose,
  className = ''
}) => {
  return (
    <div
      className={`flex items-center justify-between p-4 border-b cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={onStartDrag}
    >
      <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
        <Calculator className="h-5 w-5" />
        Kalkulator
      </Dialog.Title>
      <Dialog.Description className="sr-only">
        Kalkulator untuk melakukan perhitungan matematika dasar
      </Dialog.Description>
      <Dialog.Close asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </Dialog.Close>
    </div>
  )
}