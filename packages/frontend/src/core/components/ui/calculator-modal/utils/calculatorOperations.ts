import { CalculatorOperation } from '../types'

export const performCalculation = (
  operation: CalculatorOperation,
  firstValue: number,
  secondValue: number
): number => {
  switch (operation) {
    case '+':
      return firstValue + secondValue
    case '-':
      return firstValue - secondValue
    case '×':
      return firstValue * secondValue
    case '÷':
      return firstValue / secondValue
    default:
      return secondValue
  }
}

export const formatDisplayValue = (value: string | number): string => {
  const stringValue = String(value)

  // Handle overflow - if the number is too long, use scientific notation
  if (stringValue.length > 12) {
    const num = Number(value)
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6)
    }
  }

  return stringValue
}

export const isValidNumber = (value: string): boolean => {
  const num = parseFloat(value)
  return !isNaN(num) && isFinite(num)
}