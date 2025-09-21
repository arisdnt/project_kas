import React, { useState } from 'react';
import { Minus, Square, X, Copy, Maximize } from 'lucide-react';
import { cn } from '@/core/lib/utils';

interface WindowsControlsProps {
  className?: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

declare global {
  interface Window {
    electronAPI?: {
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
      };
    };
  }
}

export function WindowsControls({ className, isFullscreen, onToggleFullscreen }: WindowsControlsProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  React.useEffect(() => {
    // Debug: Check if electronAPI is available
    const debugAPI = () => {
      if (typeof window !== 'undefined') {
        const hasElectronAPI = !!window.electronAPI;
        const hasWindowAPI = !!(window.electronAPI?.window);
        const apiMethods = window.electronAPI?.window ? Object.keys(window.electronAPI.window) : [];
        setDebugInfo(`ElectronAPI: ${hasElectronAPI}, WindowAPI: ${hasWindowAPI}, Methods: ${apiMethods.join(', ')}`);
        console.log('Debug WindowsControls:', {
          hasElectronAPI,
          hasWindowAPI,
          apiMethods,
          fullAPI: window.electronAPI
        });
      }
    };

    debugAPI();

    // Check if window is maximized on mount and set up listeners
    const checkMaximized = async () => {
      if (window.electronAPI?.window?.isMaximized) {
        try {
          const maximized = await window.electronAPI.window.isMaximized();
          setIsMaximized(maximized);
        } catch (error) {
          console.error('Error checking maximized state:', error);
        }
      }
    };

    checkMaximized();

    // Listen for window state changes
    const handleMaximizeChange = () => {
      checkMaximized();
    };

    window.addEventListener('resize', handleMaximizeChange);

    return () => {
      window.removeEventListener('resize', handleMaximizeChange);
    };
  }, []);

  const handleMinimize = async () => {
    console.log('Attempting to minimize window...');
    try {
      if (window.electronAPI?.window?.minimize) {
        await window.electronAPI.window.minimize();
        console.log('Window minimize called successfully');
      } else {
        console.error('window.minimize method not available');
      }
    } catch (error) {
      console.error('Error minimizing window:', error);
    }
  };

  const handleMaximize = async () => {
    console.log('Attempting to maximize/restore window...');
    try {
      if (window.electronAPI?.window?.maximize) {
        await window.electronAPI.window.maximize();
        console.log('Window maximize called successfully');
        // Update state after a short delay to ensure the window state has changed
        setTimeout(async () => {
          if (window.electronAPI?.window?.isMaximized) {
            const maximized = await window.electronAPI.window.isMaximized();
            setIsMaximized(maximized);
          }
        }, 100);
      } else {
        console.error('window.maximize method not available');
      }
    } catch (error) {
      console.error('Error maximizing window:', error);
    }
  };

  const handleClose = async () => {
    console.log('Attempting to close window...');
    try {
      if (window.electronAPI?.window?.close) {
        await window.electronAPI.window.close();
        console.log('Window close called successfully');
      } else {
        console.error('window.close method not available');
      }
    } catch (error) {
      console.error('Error closing window:', error);
    }
  };

  const buttonBaseClass = "flex items-center justify-center w-12 h-8 transition-all duration-200 ease-in-out";

  // Don't render if not in Electron environment
  if (typeof window === 'undefined' || !window.electronAPI) {
    return (
      <div className={cn("flex items-center -mr-2 no-drag", className)}>
        <div className="text-xs text-red-500 px-2" title={debugInfo}>
          No Electron API
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center -mr-2 no-drag", className)}>
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 px-2" title={debugInfo}>
          API Status
        </div>
      )}

      {/* Fullscreen Button */}
      <button
        onClick={onToggleFullscreen}
        onMouseEnter={() => setHoveredButton('fullscreen')}
        onMouseLeave={() => setHoveredButton(null)}
        className={cn(
          buttonBaseClass,
          "hover:bg-gray-200 dark:hover:bg-gray-700 no-drag"
        )}
        title={isFullscreen ? 'Keluar dari Layar Penuh' : 'Layar Penuh'}
      >
        <Maximize
          size={14}
          className={cn(
            "transition-colors duration-200",
            hoveredButton === 'fullscreen' ? "text-green-600 dark:text-green-400" : "text-green-500 dark:text-green-500"
          )}
        />
      </button>

      {/* Minimize Button */}
      <button
        onClick={handleMinimize}
        onMouseEnter={() => setHoveredButton('minimize')}
        onMouseLeave={() => setHoveredButton(null)}
        className={cn(
          buttonBaseClass,
          "hover:bg-gray-200 dark:hover:bg-gray-700 no-drag"
        )}
        title="Minimize"
      >
        <Minus
          size={16}
          className={cn(
            "transition-colors duration-200",
            hoveredButton === 'minimize' ? "text-gray-800 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
          )}
        />
      </button>

      {/* Maximize/Restore Button */}
      <button
        onClick={handleMaximize}
        onMouseEnter={() => setHoveredButton('maximize')}
        onMouseLeave={() => setHoveredButton(null)}
        className={cn(
          buttonBaseClass,
          "hover:bg-gray-200 dark:hover:bg-gray-700 no-drag"
        )}
        title={isMaximized ? "Restore Down" : "Maximize"}
      >
        {isMaximized ? (
          <Copy
            size={14}
            className={cn(
              "transition-colors duration-200",
              hoveredButton === 'maximize' ? "text-blue-600 dark:text-blue-400" : "text-blue-500 dark:text-blue-500"
            )}
          />
        ) : (
          <Square
            size={14}
            className={cn(
              "transition-colors duration-200",
              hoveredButton === 'maximize' ? "text-blue-600 dark:text-blue-400" : "text-blue-500 dark:text-blue-500"
            )}
          />
        )}
      </button>

      {/* Close Button */}
      <button
        onClick={handleClose}
        onMouseEnter={() => setHoveredButton('close')}
        onMouseLeave={() => setHoveredButton(null)}
        className={cn(
          buttonBaseClass,
          "hover:bg-red-500 hover:text-white no-drag"
        )}
        title="Close"
      >
        <X
          size={16}
          className={cn(
            "transition-colors duration-200",
            hoveredButton === 'close'
              ? "text-white"
              : "text-red-500 dark:text-red-400"
          )}
        />
      </button>
    </div>
  );
}