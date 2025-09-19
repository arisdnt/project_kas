export interface CalculatorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResult?: (result: number) => void
}

export interface CalculatorState {
  display: string
  previousValue: number | null
  operation: string | null
  waitingForOperand: boolean
}

export interface Position {
  x: number
  y: number
}

export interface DragState {
  isDragging: boolean
  dragStart: Position
  position: Position
}

export type CalculatorOperation = '+' | '-' | '×' | '÷'

export interface ButtonData {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}