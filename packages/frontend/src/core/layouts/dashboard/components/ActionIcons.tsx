import { Calculator, Maximize, RefreshCw } from 'lucide-react';

type Props = {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenCalculator: () => void;
  onRefresh: () => void;
};

export function ActionIcons({ isFullscreen, onToggleFullscreen, onOpenCalculator, onRefresh }: Props) {
  return (
    <>
      <button
        onClick={onRefresh}
        className="hidden md:flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        title="Refresh Data"
      >
        <RefreshCw className="h-5 w-5" />
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

      <button className="hidden md:flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25h-15V12l2.25-2.25V9.75a6 6 0 0 1 6-6z" />
        </svg>
      </button>
    </>
  );
}
