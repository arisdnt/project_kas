import * as React from 'react'
import { Input } from '../../input'
import { Label } from '../../label'
import { FormErrors } from '../types'

interface PriceFieldsProps {
  hargaBeli: number
  hargaJual: number
  errors: FormErrors
  touched: Record<string, boolean>
  onChange: (field: 'hargaBeli' | 'hargaJual', value: number) => void
  onBlur: (field: 'hargaBeli' | 'hargaJual') => void
  disabled?: boolean
}

export const PriceFields: React.FC<PriceFieldsProps> = ({
  hargaBeli,
  hargaJual,
  errors,
  touched,
  onChange,
  onBlur,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="hargaBeli">Harga Beli *</Label>
        <Input
          id="hargaBeli"
          type="number"
          min="0"
          step="100"
          value={hargaBeli}
          onChange={(e) => onChange('hargaBeli', Number(e.target.value))}
          onBlur={() => onBlur('hargaBeli')}
          placeholder="0"
          className={errors.hargaBeli ? "border-red-500" : ""}
          disabled={disabled}
        />
        {errors.hargaBeli && touched.hargaBeli && (
          <p className="text-sm text-red-500">{errors.hargaBeli}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="hargaJual">Harga Jual *</Label>
        <Input
          id="hargaJual"
          type="number"
          min="0"
          step="100"
          value={hargaJual}
          onChange={(e) => onChange('hargaJual', Number(e.target.value))}
          onBlur={() => onBlur('hargaJual')}
          placeholder="0"
          className={errors.hargaJual ? "border-red-500" : ""}
          disabled={disabled}
        />
        {errors.hargaJual && touched.hargaJual && (
          <p className="text-sm text-red-500">{errors.hargaJual}</p>
        )}
      </div>
    </div>
  )
}