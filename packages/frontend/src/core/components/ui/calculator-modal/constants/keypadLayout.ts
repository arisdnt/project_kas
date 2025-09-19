import { CalculatorOperation } from '../types'

export interface KeypadButton {
  label: string
  type: 'number' | 'operation' | 'function' | 'decimal' | 'equals'
  value?: string | CalculatorOperation
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
  span?: number
}

export const KEYPAD_LAYOUT: KeypadButton[][] = [
  [
    { label: 'AC', type: 'function', variant: 'secondary', span: 2 },
    { label: 'C', type: 'function', variant: 'secondary' },
    { label: '÷', type: 'operation', value: '÷', variant: 'secondary' }
  ],
  [
    { label: '7', type: 'number', value: '7', variant: 'outline' },
    { label: '8', type: 'number', value: '8', variant: 'outline' },
    { label: '9', type: 'number', value: '9', variant: 'outline' },
    { label: '×', type: 'operation', value: '×', variant: 'secondary' }
  ],
  [
    { label: '4', type: 'number', value: '4', variant: 'outline' },
    { label: '5', type: 'number', value: '5', variant: 'outline' },
    { label: '6', type: 'number', value: '6', variant: 'outline' },
    { label: '-', type: 'operation', value: '-', variant: 'secondary' }
  ],
  [
    { label: '1', type: 'number', value: '1', variant: 'outline' },
    { label: '2', type: 'number', value: '2', variant: 'outline' },
    { label: '3', type: 'number', value: '3', variant: 'outline' },
    { label: '+', type: 'operation', value: '+', variant: 'secondary' }
  ],
  [
    { label: '0', type: 'number', value: '0', variant: 'outline', span: 2 },
    { label: '.', type: 'decimal', variant: 'outline' },
    { label: '=', type: 'equals', className: 'bg-blue-600 hover:bg-blue-700' }
  ]
]

export const KEYBOARD_MAP: Record<string, { type: string; value?: string }> = {
  '0': { type: 'number', value: '0' },
  '1': { type: 'number', value: '1' },
  '2': { type: 'number', value: '2' },
  '3': { type: 'number', value: '3' },
  '4': { type: 'number', value: '4' },
  '5': { type: 'number', value: '5' },
  '6': { type: 'number', value: '6' },
  '7': { type: 'number', value: '7' },
  '8': { type: 'number', value: '8' },
  '9': { type: 'number', value: '9' },
  '.': { type: 'decimal' },
  '+': { type: 'operation', value: '+' },
  '-': { type: 'operation', value: '-' },
  '*': { type: 'operation', value: '×' },
  '/': { type: 'operation', value: '÷' },
  'Enter': { type: 'equals' },
  '=': { type: 'equals' },
  'Escape': { type: 'close' },
  'Backspace': { type: 'backspace' },
  'Delete': { type: 'clear' },
  'c': { type: 'clear' },
  'C': { type: 'clear' }
}