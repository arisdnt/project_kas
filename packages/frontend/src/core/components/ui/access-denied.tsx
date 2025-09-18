import { AlertTriangle, ShieldX } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  icon?: 'shield' | 'warning';
  className?: string;
}

export function AccessDenied({
  title = "Akses Ditolak",
  message = "Anda tidak memiliki izin untuk mengakses halaman ini.",
  icon = 'shield',
  className = ""
}: AccessDeniedProps) {
  const Icon = icon === 'shield' ? ShieldX : AlertTriangle;
  const iconColor = icon === 'shield' ? 'text-red-600' : 'text-amber-600';
  const bgColor = icon === 'shield' ? 'bg-red-100' : 'bg-amber-100';

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center max-w-md mx-auto p-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${bgColor} ${iconColor} mb-6`}>
          <Icon className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          {title}
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="text-sm text-gray-500">
          Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator sistem.
        </div>
      </div>
    </div>
  );
}