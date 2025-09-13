import { useState, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Calculator, X } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

interface CalculatorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResult?: (result: number) => void
}

export function CalculatorModal({ open, onOpenChange, onResult }: CalculatorModalProps) {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle keyboard input
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      
      if (event.key >= '0' && event.key <= '9') {
        inputNumber(event.key)
      } else if (event.key === '.') {
        inputDecimal()
      } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
        const op = event.key === '*' ? '×' : event.key === '/' ? '÷' : event.key
        performOperation(op)
      } else if (event.key === 'Enter' || event.key === '=') {
        calculate()
      } else if (event.key === 'Escape') {
        onOpenChange(false)
      } else if (event.key === 'Backspace') {
        if (display.length > 1) {
          setDisplay(display.slice(0, -1))
        } else {
          setDisplay('0')
        }
      } else if (event.key === 'Delete' || event.key === 'c' || event.key === 'C') {
        if (event.shiftKey) {
          clearAll()
        } else {
          clearDisplay()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, display, previousValue, operation, waitingForOperand])

  // Handle drag functionality
  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const onDrag = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const stopDrag = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag)
      window.addEventListener('mouseup', stopDrag)
    }
    
    return () => {
      window.removeEventListener('mousemove', onDrag)
      window.removeEventListener('mouseup', stopDrag)
    }
  }, [isDragging, dragStart])

  // Center modal when opened
  useEffect(() => {
    if (open) {
      // Add a small delay to ensure the modal is rendered before calculating position
      setTimeout(() => {
        if (modalRef.current) {
          const modal = modalRef.current
          setPosition({
            x: window.innerWidth / 2 - modal.offsetWidth / 2,
            y: window.innerHeight / 2 - modal.offsetHeight / 2
          })
        }
      }, 10)
    }
  }, [open])

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clearDisplay = () => {
    setDisplay('0')
  }

  const clearAll = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue
      let newValue: number

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue
          break
        case '-':
          newValue = currentValue - inputValue
          break
        case '×':
          newValue = currentValue * inputValue
          break
        case '÷':
          newValue = currentValue / inputValue
          break
        default:
          newValue = inputValue
      }

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const currentValue = previousValue
      let newValue: number

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue
          break
        case '-':
          newValue = currentValue - inputValue
          break
        case '×':
          newValue = currentValue * inputValue
          break
        case '÷':
          newValue = currentValue / inputValue
          break
        default:
          newValue = inputValue
      }

      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
      
      if (onResult) {
        onResult(newValue)
      }
    }
  }

  const handleResult = () => {
    const result = parseFloat(display)
    if (onResult) {
      onResult(result)
    }
    onOpenChange(false)
    clearAll()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm pointer-events-none" />
        <Dialog.Content 
          ref={modalRef}
          className="fixed w-full max-w-sm rounded-lg bg-white shadow-xl border pointer-events-auto"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'none',
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          <div 
            className="flex items-center justify-between p-4 border-b cursor-grab active:cursor-grabbing"
            onMouseDown={startDrag}
          >
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
              <Calculator className="h-5 w-5" />
              Kalkulator
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-right">
                <div className="text-xs text-gray-500 h-4">
                  {previousValue !== null && operation && (
                    `${previousValue} ${operation}`
                  )}
                </div>
                <div className="text-2xl font-mono font-semibold text-gray-900 tabular-nums">
                  {display}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="secondary"
                onClick={clearAll}
                className="col-span-2"
              >
                AC
              </Button>
              <Button
                variant="secondary"
                onClick={clearDisplay}
              >
                C
              </Button>
              <Button
                variant="secondary"
                onClick={() => performOperation('÷')}
              >
                ÷
              </Button>

              <Button
                variant="outline"
                onClick={() => inputNumber('7')}
              >
                7
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber('8')}
              >
                8
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber('9')}
              >
                9
              </Button>
              <Button
                variant="secondary"
                onClick={() => performOperation('×')}
              >
                ×
              </Button>

              <Button
                variant="outline"
                onClick={() => inputNumber('4')}
              >
                4
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber('5')}
              >
                5
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber('6')}
              >
                6
              </Button>
              <Button
                variant="secondary"
                onClick={() => performOperation('-')}
              >
                -
              </Button>

              <Button
                variant="outline"
                onClick={() => inputNumber('1')}
              >
                1
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber('2')}
              >
                2
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber('3')}
              >
                3
              </Button>
              <Button
                variant="secondary"
                onClick={() => performOperation('+')}
              >
                +
              </Button>

              <Button
                variant="outline"
                onClick={() => inputNumber('0')}
                className="col-span-2"
              >
                0
              </Button>
              <Button
                variant="outline"
                onClick={inputDecimal}
              >
                .
              </Button>
              <Button
                onClick={calculate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                =
              </Button>
            </div>

            <Button
              onClick={handleResult}
              className="w-full"
            >
              Gunakan Hasil
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}