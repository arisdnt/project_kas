export const generateProductCode = (productName: string): string => {
  if (!productName.trim()) return ''

  // Split into words and create abbreviation
  const words = productName
    .split(/\s+/)
    .filter(word => word.length > 0)
    .slice(0, 3) // Take first 3 words max

  let code = ''

  if (words.length === 1) {
    // Single word: take first 6 characters
    code = words[0].substring(0, 6).toUpperCase()
  } else {
    // Multiple words: take first 2-3 characters from each word
    code = words
      .map(word => {
        // Remove common words like "dan", "atau", etc.
        const commonWords = ['DAN', 'ATAU', 'DENGAN', 'UNTUK', 'DARI', 'THE', 'AND', 'OR', 'WITH', 'FOR', 'FROM']
        if (commonWords.includes(word.toUpperCase()) && words.length > 2) {
          return ''
        }
        return word.substring(0, words.length > 2 ? 2 : 3).toUpperCase()
      })
      .filter(part => part.length > 0)
      .join('')
  }

  // Remove special characters and limit length
  code = code
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8)

  // Add timestamp suffix for uniqueness (last 4 digits of current timestamp)
  const timestamp = Date.now().toString().slice(-4)
  code = `${code}${timestamp}`

  return code
}

export const validateImageFile = (file: File): string | null => {
  if (file.size > 10 * 1024 * 1024) {
    return 'File size must be less than 10MB'
  }

  if (!file.type.startsWith('image/')) {
    return 'Please select an image file'
  }

  return null
}