import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CalculatorModalProps } from './types'
import { useCalculatorState } from './hooks/useCalculatorState'
import { useDraggable } from './hooks/useDraggable'
import { useKeyboardHandler } from './hooks/useKeyboardHandler'
import { CalculatorHeader } from './components/CalculatorHeader'
import { CalculatorDisplay } from './components/CalculatorDisplay'
import { CalculatorKeypad } from './components/CalculatorKeypad'
import { CalculatorFooter } from './components/CalculatorFooter'

export function CalculatorModal({
  open,
  onOpenChange,
  onResult
}: CalculatorModalProps) {
  const { state, actions } = useCalculatorState({ onResult })
  const { modalRef, position, isDragging, startDrag } = useDraggable({
    isOpen: open
  })

  // Keyboard event handler
  useKeyboardHandler({
    isOpen: open,
    onNumber: actions.inputNumber,
    onDecimal: actions.inputDecimal,
    onOperation: actions.performOperation,
    onEquals: actions.calculate,
    onClear: actions.clearDisplay,
    onClearAll: actions.clearAll,
    onBackspace: actions.backspace,
    onClose: () => onOpenChange(false)
  })

  const handleUseResult = () => {
    const result = actions.getCurrentResult()
    if (onResult) {
      onResult(result)
    }
    onOpenChange(false)
    actions.clearAll()
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Dialog.Portal>
        <Dialog.Content
          ref={modalRef}
          className="fixed w-full max-w-sm rounded-lg bg-white shadow-xl border pointer-events-auto z-50"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'none',
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={() => onOpenChange(false)}
        >
          <CalculatorHeader onStartDrag={startDrag} onClose={handleClose} />

          <div className="p-4 space-y-4">
            <CalculatorDisplay state={state} />

            <CalculatorKeypad
              onNumber={actions.inputNumber}
              onDecimal={actions.inputDecimal}
              onOperation={actions.performOperation}
              onEquals={actions.calculate}
              onClear={actions.clearDisplay}
              onClearAll={actions.clearAll}
            />

            <CalculatorFooter onUseResult={handleUseResult} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Re-export types
export type { CalculatorModalProps } from './types'