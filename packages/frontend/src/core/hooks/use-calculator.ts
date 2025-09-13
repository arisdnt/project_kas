import { useState, useCallback } from 'react'

interface UseCalculatorReturn {
  isCalculatorOpen: boolean
  openCalculator: () => void
  closeCalculator: () => void
  handleCalculatorResult: (result: number) => void
  lastCalculatorResult: number | null
}

export function useCalculator(): UseCalculatorReturn {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [lastCalculatorResult, setLastCalculatorResult] = useState<number | null>(null)

  const openCalculator = useCallback(() => {
    setIsCalculatorOpen(true)
  }, [])

  const closeCalculator = useCallback(() => {
    setIsCalculatorOpen(false)
  }, [])

  const handleCalculatorResult = useCallback((result: number) => {
    setLastCalculatorResult(result)
  }, [])

  return {
    isCalculatorOpen,
    openCalculator,
    closeCalculator,
    handleCalculatorResult,
    lastCalculatorResult
  }
}