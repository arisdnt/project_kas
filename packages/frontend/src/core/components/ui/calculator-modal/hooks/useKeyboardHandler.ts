import { useEffect } from 'react'
import { KEYBOARD_MAP } from '../constants/keypadLayout'
import { CalculatorOperation } from '../types'

interface UseKeyboardHandlerProps {
  isOpen: boolean
  onNumber: (num: string) => void
  onDecimal: () => void
  onOperation: (op: CalculatorOperation) => void
  onEquals: () => void
  onClear: () => void
  onClearAll: () => void
  onBackspace: () => void
  onClose: () => void
}

export const useKeyboardHandler = ({
  isOpen,
  onNumber,
  onDecimal,
  onOperation,
  onEquals,
  onClear,
  onClearAll,
  onBackspace,
  onClose
}: UseKeyboardHandlerProps) => {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()

      const mapping = KEYBOARD_MAP[event.key]
      if (!mapping) return

      switch (mapping.type) {
        case 'number':
          if (mapping.value) {
            onNumber(mapping.value)
          }
          break

        case 'decimal':
          onDecimal()
          break

        case 'operation':
          if (mapping.value) {
            onOperation(mapping.value as CalculatorOperation)
          }
          break

        case 'equals':
          onEquals()
          break

        case 'clear':
          if (event.shiftKey) {
            onClearAll()
          } else {
            onClear()
          }
          break

        case 'backspace':
          onBackspace()
          break

        case 'close':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    onNumber,
    onDecimal,
    onOperation,
    onEquals,
    onClear,
    onClearAll,
    onBackspace,
    onClose
  ])
}