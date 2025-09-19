import * as React from 'react'
import { Tag } from 'lucide-react'
import { ProductInfoCard } from './ProductInfoCard'
import { Product } from '../types'
import { formatCurrency, calculateProfit } from '../utils/formatters'

interface ProductPricingInfoProps {
  product: Product
}

export const ProductPricingInfo: React.FC<ProductPricingInfoProps> = ({ product }) => {
  const { profit, profitPercentage } = calculateProfit(product.hargaJual, product.hargaBeli)

  return (
    <ProductInfoCard title="Informasi Harga" icon={Tag}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Harga Beli</label>
          <p className="text-sm font-semibold">{formatCurrency(product.hargaBeli)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Harga Jual</label>
          <p className="text-sm font-semibold">{formatCurrency(product.hargaJual)}</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Keuntungan</label>
        <p className="text-sm font-semibold text-green-600">
          {formatCurrency(profit)} ({profitPercentage}%)
        </p>
      </div>
    </ProductInfoCard>
  )
}