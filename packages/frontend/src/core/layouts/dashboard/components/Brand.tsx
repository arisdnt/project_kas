import { ShoppingCart } from 'lucide-react';

export function Brand() {
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg">
        <ShoppingCart className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">KasirPro</h1>
        <p className="text-xs text-gray-500 font-medium hidden sm:block">Point of Sale System</p>
      </div>
    </div>
  );
}

