import { Calculator, Maximize, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { PerpesananQuickAction } from '@/features/perpesanan/components/PerpesananQuickAction';

type Props = {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenCalculator: () => void;
  onRefresh: () => void;
};

export function ActionIcons({ isFullscreen, onToggleFullscreen, onOpenCalculator, onRefresh }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh();

    // Reset animation after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  return (
    <>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="hidden md:flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        title="Refresh Data"
      >
        <RefreshCw className={`h-5 w-5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      <button
        onClick={onToggleFullscreen}
        className="hidden md:flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        title={isFullscreen ? 'Keluar dari Layar Penuh' : 'Layar Penuh'}
      >
        <Maximize className="h-5 w-5" />
      </button>

      <button
        onClick={onOpenCalculator}
        className="hidden md:flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        title="Kalkulator"
      >
        <Calculator className="h-5 w-5" />
      </button>

      <PerpesananQuickAction />
    </>
  );
}
