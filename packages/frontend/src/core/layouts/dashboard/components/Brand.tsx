import { ShoppingCart } from 'lucide-react';
import { useTenantToko } from '@/core/hooks/useTenantToko';

export function Brand() {
  const { tenantName, tokoName } = useTenantToko();
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg">
        <ShoppingCart className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">KasirPro</h1>
        <p className="text-xs font-semibold text-red-600">{tenantName} | {tokoName}</p>
      </div>
    </div>
  );
}
