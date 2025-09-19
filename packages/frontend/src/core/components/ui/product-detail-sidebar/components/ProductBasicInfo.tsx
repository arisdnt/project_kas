import * as React from 'react'
import { Package } from 'lucide-react'
import { Badge } from '../../badge'
import { ProductInfoCard } from './ProductInfoCard'
import { Product } from '../types'

interface ProductBasicInfoProps {
  product: Product
}

export const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({ product }) => {
  return (
    <ProductInfoCard title="Informasi Dasar" icon={Package}>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Nama Produk</label>
        <p className="text-sm font-semibold">{product.nama}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Kode Produk</label>
        <p className="text-sm font-mono">{product.kode}</p>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground">Kategori</label>
          <p className="text-sm">{product.kategori}</p>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground">Brand</label>
          <p className="text-sm">{product.brand}</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Status</label>
        <div className="mt-1">
          <Badge variant={product.status === 'aktif' ? 'default' : 'secondary'}>
            {product.status}
          </Badge>
        </div>
      </div>
    </ProductInfoCard>
  )
}