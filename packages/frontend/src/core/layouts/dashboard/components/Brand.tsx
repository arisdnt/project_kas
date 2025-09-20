import { ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { useNavbarData } from '@/core/hooks/useNavbarData';

export function Brand() {
  const { tenantName, tokoName, displayText, loading, error } = useNavbarData();

  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg">
        <ShoppingCart className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">KasirPro</h1>
        <div className="flex items-center space-x-1">
          {loading ? (
            <div className="flex items-center space-x-1">
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              <p className="text-xs font-semibold text-gray-400">Memuat...</p>
            </div>
          ) : error ? (
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              <p className="text-xs font-semibold text-red-500">Error</p>
            </div>
          ) : (
            <p className="text-xs font-semibold text-red-600">
              {displayText || `${tenantName} | ${tokoName}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
