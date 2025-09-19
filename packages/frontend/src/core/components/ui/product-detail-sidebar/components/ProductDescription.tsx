import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../card'
import { Product } from '../types'

interface ProductDescriptionProps {
  product: Product
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  if (!product.deskripsi) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Deskripsi</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{product.deskripsi}</p>
      </CardContent>
    </Card>
  )
}