import * as React from 'react'
import { Button } from '../../button'
import { KEYPAD_LAYOUT, KeypadButton } from '../constants/keypadLayout'
import { CalculatorOperation } from '../types'

interface CalculatorKeypadProps {
  onNumber: (num: string) => void
  onDecimal: () => void
  onOperation: (op: CalculatorOperation) => void
  onEquals: () => void
  onClear: () => void
  onClearAll: () => void
  className?: string
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  onNumber,
  onDecimal,
  onOperation,
  onEquals,
  onClear,
  onClearAll,
  className = ''
}) => {
  const handleButtonClick = (button: KeypadButton) => {
    switch (button.type) {
      case 'number':
        if (button.value) {
          onNumber(button.value)
        }
        break
      case 'decimal':
        onDecimal()
        break
      case 'operation':
        if (button.value) {
          onOperation(button.value as CalculatorOperation)
        }
        break
      case 'equals':
        onEquals()
        break
      case 'function':
        if (button.label === 'AC') {
          onClearAll()
        } else if (button.label === 'C') {
          onClear()
        }
        break
    }
  }

  return (
    <div className={`grid grid-cols-4 gap-2 ${className}`}>
      {KEYPAD_LAYOUT.flat().map((button, index) => (
        <Button
          key={`${button.label}-${index}`}
          variant={button.variant || 'default'}
          onClick={() => handleButtonClick(button)}
          className={`${button.className || ''} ${
            button.span === 2 ? 'col-span-2' : ''
          }`}
        >
          {button.label}
        </Button>
      ))}
    </div>
  )
}