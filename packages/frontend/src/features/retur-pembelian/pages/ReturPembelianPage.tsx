import { useEffect } from 'react'
import { ReturPembelianLayout } from '../layout/ReturPembelianLayout'
import { useReturPembelianStore } from '../store/returPembelianStore'

export function ReturPembelianPage() {
  const {
    loading,
    error,
    setError,
    reset
  } = useReturPembelianStore()

  useEffect(() => {
    // Initialize the page
    reset()
    
    // Cleanup on unmount
    return () => {
      reset()
    }
  }, [reset])

  return (
    <ReturPembelianLayout>
      {/* Error handling */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Memuat data retur pembelian...</p>
          </div>
        </div>
      )}
    </ReturPembelianLayout>
  )
}