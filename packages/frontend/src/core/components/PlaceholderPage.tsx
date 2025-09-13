import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="flex justify-center">
          <div className="p-4 bg-orange-100 rounded-full">
            <Construction className="h-12 w-12 text-orange-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-lg text-orange-600 font-medium">
            Halaman masih dalam pengembangan
          </p>
          {description && (
            <p className="text-gray-600 text-sm">
              {description}
            </p>
          )}
        </div>
        
        <div className="pt-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}