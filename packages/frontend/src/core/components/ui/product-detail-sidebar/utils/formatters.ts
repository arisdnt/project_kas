export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export const calculateProfit = (hargaJual: number, hargaBeli: number) => {
  const profit = hargaJual - hargaBeli
  const profitPercentage = ((profit / hargaBeli) * 100).toFixed(1)

  return {
    profit,
    profitPercentage: parseFloat(profitPercentage)
  }
}