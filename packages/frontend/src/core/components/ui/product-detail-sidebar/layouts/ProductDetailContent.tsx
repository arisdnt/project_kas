import * as React from 'react'
import { Product } from '../types'
import { ProductImage } from '../components/ProductImage'
import { ProductDebugInfo } from '../components/ProductDebugInfo'
import { ProductBasicInfo } from '../components/ProductBasicInfo'
import { ProductPricingInfo } from '../components/ProductPricingInfo'
import { ProductStockInfo } from '../components/ProductStockInfo'
import { ProductDescription } from '../components/ProductDescription'
import { ProductMetadata } from '../components/ProductMetadata'

interface ProductDetailContentProps {
  product: Product
}

export const ProductDetailContent: React.FC<ProductDetailContentProps> = ({
  product
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-2 gap-6 h-full">
        {/* Left Column - Product Image */}
        <div className="flex flex-col">
          <div className="aspect-square w-full overflow-hidden rounded-lg border relative">
            <ProductImage
              src={product.gambar}
              alt={product.nama}
              className="h-full w-full rounded-lg"
            />
          </div>

          {/* Debug Info - Temporary */}
          <ProductDebugInfo imageUrl={product.gambar} />
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-6">
          <ProductBasicInfo product={product} />
          <ProductPricingInfo product={product} />
          <ProductStockInfo product={product} />
          <ProductDescription product={product} />
          <ProductMetadata product={product} />
        </div>
      </div>
    </div>
  )
}