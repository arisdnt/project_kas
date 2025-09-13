import { useEffect, useRef } from 'react'
import { Input } from '@/core/components/ui/input'
import { Barcode } from 'lucide-react'

interface InputBarcodeProps {
  onScan: (kode: string) => void
}

export function InputBarcode({ onScan }: InputBarcodeProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const kode = e.currentTarget.value.trim()
      if (kode) {
        onScan(kode)
        e.currentTarget.value = ''
      }
    }
  }

  return (
    <div className="relative">
      <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        ref={ref}
        placeholder="Pindai barcode di sini..."
        className="pl-9"
        onKeyDown={onKeyDown}
        onBlur={() => ref.current?.focus()}
      />
    </div>
  )
}
