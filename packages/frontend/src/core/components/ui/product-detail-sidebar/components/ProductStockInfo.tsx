import * as React from 'react'
import { BarChart3 } from 'lucide-react'
import { ProductInfoCard } from './ProductInfoCard'
import { Product } from '../types'

interface ProductStockInfoProps {
  product: Product
}

export const ProductStockInfo: React.FC<ProductStockInfoProps> = ({ product }) => {
  return (
    <ProductInfoCard title="Informasi Stok" icon={BarChart3}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Stok Tersedia</label>
          <p className="text-sm font-semibold">{product.stok}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Satuan</label>
          <p className="text-sm">{product.satuan}</p>
        </div>
      </div>
    </ProductInfoCard>
  )
}