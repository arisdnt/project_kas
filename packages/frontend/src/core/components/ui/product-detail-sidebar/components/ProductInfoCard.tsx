import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../card'
import { ProductInfoCardProps } from '../types'

export const ProductInfoCard: React.FC<ProductInfoCardProps> = ({
  title,
  icon: Icon,
  children,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
      </CardContent>
    </Card>
  )
}