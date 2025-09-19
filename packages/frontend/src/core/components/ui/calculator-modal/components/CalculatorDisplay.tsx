import * as React from 'react'
import { CalculatorState } from '../types'

interface CalculatorDisplayProps {
  state: CalculatorState
  className?: string
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  state,
  className = ''
}) => {
  const { display, previousValue, operation } = state

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
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
  )
}