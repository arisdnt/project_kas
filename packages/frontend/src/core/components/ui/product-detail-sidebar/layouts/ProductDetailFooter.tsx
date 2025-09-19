import * as React from 'react'
import { Button } from '../../button'
import { Product } from '../types'

interface ProductDetailFooterProps {
  product: Product
  onClose: () => void
  onEdit?: (product: Product) => void
}

export const ProductDetailFooter: React.FC<ProductDetailFooterProps> = ({
  product,
  onClose,
  onEdit
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onClose}
        className="flex-1"
      >
        Tutup
      </Button>
      {onEdit && (
        <Button
          onClick={() => onEdit(product)}
          className="flex-1"
        >
          Edit Produk
        </Button>
      )}
    </div>
  )
}