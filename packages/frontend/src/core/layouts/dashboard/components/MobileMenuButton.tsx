import { Menu, X } from 'lucide-react';

type Props = {
  open: boolean;
  onToggle: () => void;
};

export function MobileMenuButton({ open, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="md:hidden p-2 sm:p-2.5 rounded-lg text-blue-600 hover:text-blue-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
    >
      {open ? (
        <X className="h-6 w-6 text-blue-600" />
      ) : (
        <Menu className="h-6 w-6 text-blue-600" />
      )}
    </button>
  );
}

