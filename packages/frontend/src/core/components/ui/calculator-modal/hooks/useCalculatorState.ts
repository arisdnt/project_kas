import { useState, useCallback } from 'react'
import { CalculatorState, CalculatorOperation } from '../types'
import { performCalculation, formatDisplayValue } from '../utils/calculatorOperations'

interface UseCalculatorStateProps {
  onResult?: (result: number) => void
}

export const useCalculatorState = ({ onResult }: UseCalculatorStateProps = {}) => {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false
  })

  const inputNumber = useCallback((num: string) => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: num,
          waitingForOperand: false
        }
      }
      return {
        ...prev,
        display: prev.display === '0' ? num : prev.display + num
      }
    })
  }, [])

  const inputDecimal = useCallback(() => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForOperand: false
        }
      }
      if (prev.display.indexOf('.') === -1) {
        return {
          ...prev,
          display: prev.display + '.'
        }
      }
      return prev
    })
  }, [])

  const clearDisplay = useCallback(() => {
    setState(prev => ({
      ...prev,
      display: '0'
    }))
  }, [])

  const clearAll = useCallback(() => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false
    })
  }, [])

  const performOperation = useCallback((nextOperation: CalculatorOperation) => {
    setState(prev => {
      const inputValue = parseFloat(prev.display)

      if (prev.previousValue === null) {
        return {
          ...prev,
          previousValue: inputValue,
          waitingForOperand: true,
          operation: nextOperation
        }
      }

      if (prev.operation) {
        const newValue = performCalculation(prev.operation, prev.previousValue, inputValue)
        const formattedValue = formatDisplayValue(newValue)

        return {
          ...prev,
          display: formattedValue,
          previousValue: newValue,
          waitingForOperand: true,
          operation: nextOperation
        }
      }

      return {
        ...prev,
        waitingForOperand: true,
        operation: nextOperation
      }
    })
  }, [])

  const calculate = useCallback(() => {
    setState(prev => {
      const inputValue = parseFloat(prev.display)

      if (prev.previousValue !== null && prev.operation) {
        const newValue = performCalculation(prev.operation, prev.previousValue, inputValue)
        const formattedValue = formatDisplayValue(newValue)

        if (onResult) {
          onResult(newValue)
        }

        return {
          display: formattedValue,
          previousValue: null,
          operation: null,
          waitingForOperand: true
        }
      }

      return prev
    })
  }, [onResult])

  const backspace = useCallback(() => {
    setState(prev => {
      if (prev.display.length > 1) {
        return {
          ...prev,
          display: prev.display.slice(0, -1)
        }
      }
      return {
        ...prev,
        display: '0'
      }
    })
  }, [])

  const getCurrentResult = useCallback(() => {
    return parseFloat(state.display)
  }, [state.display])

  return {
    state,
    actions: {
      inputNumber,
      inputDecimal,
      clearDisplay,
      clearAll,
      performOperation,
      calculate,
      backspace,
      getCurrentResult
    }
  }
}