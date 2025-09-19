import * as React from 'react'
import { Button } from '../../button'
import { Input } from '../../input'
import { Label } from '../../label'
import { Shuffle } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { generateProductCode } from '../utils/productCodeGenerator'

interface ProductCodeFieldProps {
  value: string
  productName: string
  error?: string
  touched?: boolean
  onChange: (value: string) => void
  onBlur: () => void
  disabled?: boolean
  className?: string
}

export const ProductCodeField: React.FC<ProductCodeFieldProps> = ({
  value,
  productName,
  error,
  touched,
  onChange,
  onBlur,
  disabled = false,
  className
}) => {
  const handleGenerate = () => {
    const code = generateProductCode(productName)
    onChange(code)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="kode">Kode Produk *</Label>
      <div className="flex gap-2">
        <Input
          id="kode"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onBlur={onBlur}
          placeholder="Masukkan kode produk"
          className={cn("flex-1", error ? "border-red-500" : "")}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleGenerate}
          disabled={!productName.trim() || disabled}
          className="px-4 h-10 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 min-w-[100px]"
          title="Generate kode produk dari nama"
        >
          <Shuffle className="h-4 w-4 mr-1" />
          Generate
        </Button>
      </div>
      {error && touched && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}