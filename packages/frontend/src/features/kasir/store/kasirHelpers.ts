// Generate consistent session ID that persists during the session
export const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('kasir_session_id')
  if (stored) return stored

  const newId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  sessionStorage.setItem('kasir_session_id', newId)
  return newId
}

// Generate unique invoice number with simplified format
export const generateInvoiceNumber = (_sessionId?: string): string => {
  const now = new Date()

  // Date components
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')

  // Time components (only hour)
  const hours = now.getHours().toString().padStart(2, '0')

  // Unique identifier using timestamp (more unique than incremental)
  const timestamp = now.getTime().toString() // Unix timestamp in milliseconds
  const uniqueId = timestamp.substr(-6) // Last 6 digits of timestamp for uniqueness

  // Format: INV/YYYY/MM/DD/HH/XXXXXX
  // Example: INV/2025/09/16/14/123456
  return `INV/${year}/${month}/${day}/${hours}/${uniqueId}`
}

// Check if user requires store context
export const checkStoreRequirement = (user: any): boolean => {
  // Only require store for users level 3+ (manager, cashier)
  // God users, level 1 (super admin), and level 2 (admin) can proceed without store
  return !user?.tokoId && !(user?.isGodUser || user?.level === 1 || user?.level === 2)
}

// Check if error message indicates store ID requirement
export const isStoreRequiredError = (error: any): boolean => {
  return /Store ID diperlukan/i.test(String(error))
}