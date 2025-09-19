import * as React from 'react'
import { getDebugInfo } from '../utils/imageUtils'

interface ProductDebugInfoProps {
  imageUrl?: string
  className?: string
}

export const ProductDebugInfo: React.FC<ProductDebugInfoProps> = ({
  imageUrl,
  className = ''
}) => {
  const debugInfo = getDebugInfo(imageUrl)

  return (
    <div className={`mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 ${className}`}>
      <div className="font-mono break-all">
        <div><strong>Original URL:</strong> {debugInfo.originalUrl}</div>
        <div><strong>Auth Token:</strong> {debugInfo.hasAuthToken}</div>
        <div><strong>API Endpoint:</strong> {debugInfo.apiEndpoint}</div>
      </div>
    </div>
  )
}