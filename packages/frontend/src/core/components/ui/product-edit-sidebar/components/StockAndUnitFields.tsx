import * as React from 'react'
import { Input } from '../../input'
import { Label } from '../../label'
import { Combobox } from '../../combobox'
import { FormErrors } from '../types'
import { SATUAN_OPTIONS } from '../validation/constants'

interface StockAndUnitFieldsProps {
  stok: number
  satuan: string
  errors: FormErrors
  touched: Record<string, boolean>
  onChange: (field: 'stok' | 'satuan', value: number | string) => void
  onBlur: (field: 'stok' | 'satuan') => void
  disabled?: boolean
}

export const StockAndUnitFields: React.FC<StockAndUnitFieldsProps> = ({
  stok,
  satuan,
  errors,
  touched,
  onChange,
  onBlur,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="stok">Stok *</Label>
        <Input
          id="stok"
          type="number"
          min="0"
          value={stok}
          onChange={(e) => onChange('stok', Number(e.target.value))}
          onBlur={() => onBlur('stok')}
          placeholder="0"
          className={errors.stok ? "border-red-500" : ""}
          disabled={disabled}
        />
        {errors.stok && touched.stok && (
          <p className="text-sm text-red-500">{errors.stok}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="satuan">Satuan *</Label>
        <Combobox
          options={SATUAN_OPTIONS}
          value={satuan}
          onValueChange={(value) => onChange('satuan', value)}
          placeholder="Pilih satuan..."
          searchPlaceholder="Cari satuan..."
          emptyText="Satuan tidak ditemukan"
          allowCreate={false}
          className={errors.satuan ? "border-red-500" : ""}
          disabled={disabled}
        />
        {errors.satuan && touched.satuan && (
          <p className="text-sm text-red-500">{errors.satuan}</p>
        )}
      </div>
    </div>
  )
}