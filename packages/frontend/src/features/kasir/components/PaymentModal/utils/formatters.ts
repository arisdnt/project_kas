export const formatNumberID = (n: number): string => {
  if (!isFinite(n)) return ''
  return new Intl.NumberFormat('id-ID').format(Math.floor(n))
}

export const parseNumberID = (s: string): number => {
  const digits = s.replace(/[^0-9]/g, '')
  return digits ? Number(digits) : 0
}

export const formatCurrency = (n: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(n)
}

export const calculateChange = (amountPaid: number, total: number, paymentMethod: string): number => {
  if (paymentMethod === 'TUNAI') {
    return Math.max(0, amountPaid - total)
  }
  return 0
}