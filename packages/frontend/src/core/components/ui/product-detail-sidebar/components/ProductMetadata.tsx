import * as React from 'react'
import { Calendar, User } from 'lucide-react'
import { ProductInfoCard } from './ProductInfoCard'
import { Product } from '../types'
import { formatDate } from '../utils/formatters'

interface ProductMetadataProps {
  product: Product
}

export const ProductMetadata: React.FC<ProductMetadataProps> = ({ product }) => {
  return (
    <ProductInfoCard title="Informasi Sistem" icon={Calendar}>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Dibuat Pada</label>
        <p className="text-sm">{formatDate(product.createdAt)}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Diperbarui Pada</label>
        <p className="text-sm">{formatDate(product.updatedAt)}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Dibuat Oleh</label>
        <p className="text-sm flex items-center gap-1">
          <User className="h-3 w-3" />
          {product.createdBy}
        </p>
      </div>
    </ProductInfoCard>
  )
}