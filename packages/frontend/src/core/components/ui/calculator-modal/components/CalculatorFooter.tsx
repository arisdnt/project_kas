import * as React from 'react'
import { Button } from '../../button'

interface CalculatorFooterProps {
  onUseResult: () => void
  className?: string
}

export const CalculatorFooter: React.FC<CalculatorFooterProps> = ({
  onUseResult,
  className = ''
}) => {
  return (
    <div className={`mt-4 ${className}`}>
      <Button onClick={onUseResult} className="w-full">
        Gunakan Hasil
      </Button>
    </div>
  )
}