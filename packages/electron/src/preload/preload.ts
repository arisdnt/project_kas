import { contextBridge, ipcRenderer } from 'electron';

/**
 * Interface untuk Electron API yang akan diekspos ke renderer process
 * Mendefinisikan semua method yang dapat diakses dari frontend
 */
interface ElectronAPI {
  // App related APIs
  app: {
    getVersion: () => Promise<string>;
    getPath: (name: string) => Promise<string>;
    restart: () => Promise<void>;
    quit: () => Promise<void>;
  };
  
  // Dialog APIs
  dialog: {
    showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
    showOpenDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;
    showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
  };

  // System APIs
  system: {
    platform: string;
    isElectron: boolean;
  };

  // File system APIs (secure)
  fs: {
    selectFile: (filters?: Electron.FileFilter[]) => Promise<string | null>;
    selectDirectory: () => Promise<string | null>;
    saveFile: (defaultPath?: string, filters?: Electron.FileFilter[]) => Promise<string | null>;
  };

  // Window controls APIs
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
}

/**
 * Implementasi Electron API yang aman untuk renderer process
 * Menggunakan IPC untuk komunikasi dengan main process
 */
const electronAPI: ElectronAPI = {
  // App related APIs
  app: {
    /**
     * Mendapatkan versi aplikasi
     */
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    
    /**
     * Mendapatkan path sistem
     */
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
    
    /**
     * Restart aplikasi
     */
    restart: () => ipcRenderer.invoke('app:restart'),
    
    /**
     * Keluar dari aplikasi
     */
    quit: () => ipcRenderer.invoke('app:quit')
  },

  // Dialog APIs
  dialog: {
    /**
     * Menampilkan message box dialog
     */
    showMessageBox: (options: Electron.MessageBoxOptions) => 
      ipcRenderer.invoke('dialog:showMessageBox', options),
    
    /**
     * Menampilkan open file dialog
     */
    showOpenDialog: (options: Electron.OpenDialogOptions) => 
      ipcRenderer.invoke('dialog:showOpenDialog', options),
    
    /**
     * Menampilkan save file dialog
     */
    showSaveDialog: (options: Electron.SaveDialogOptions) => 
      ipcRenderer.invoke('dialog:showSaveDialog', options)
  },

  // System APIs
  system: {
    platform: process.platform,
    isElectron: true
  },

  // File system APIs (secure wrappers)
  fs: {
    /**
     * Memilih file dengan dialog
     */
    selectFile: async (filters?: Electron.FileFilter[]) => {
      const result = await ipcRenderer.invoke('dialog:showOpenDialog', {
        properties: ['openFile'],
        filters: filters || [
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      return result.canceled ? null : result.filePaths[0];
    },

    /**
     * Memilih direktori dengan dialog
     */
    selectDirectory: async () => {
      const result = await ipcRenderer.invoke('dialog:showOpenDialog', {
        properties: ['openDirectory']
      });
      
      return result.canceled ? null : result.filePaths[0];
    },

    /**
     * Menyimpan file dengan dialog
     */
    saveFile: async (defaultPath?: string, filters?: Electron.FileFilter[]) => {
      const result = await ipcRenderer.invoke('dialog:showSaveDialog', {
        defaultPath,
        filters: filters || [
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      return result.canceled ? null : result.filePath;
    }
  },

  // Window controls APIs
  window: {
    /**
     * Minimize window
     */
    minimize: () => ipcRenderer.invoke('window:minimize'),

    /**
     * Maximize/restore window
     */
    maximize: () => ipcRenderer.invoke('window:maximize'),

    /**
     * Close window
     */
    close: () => ipcRenderer.invoke('window:close'),

    /**
     * Check if window is maximized
     */
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  }
};

/**
 * Utility functions untuk renderer process
 */
const electronUtils = {
  /**
   * Mengecek apakah aplikasi berjalan di Electron
   */
  isElectron: () => true,

  /**
   * Mendapatkan informasi platform
   */
  getPlatform: () => process.platform,

  /**
   * Mengecek apakah platform adalah Windows
   */
  isWindows: () => process.platform === 'win32',

  /**
   * Mengecek apakah platform adalah macOS
   */
  isMacOS: () => process.platform === 'darwin',

  /**
   * Mengecek apakah platform adalah Linux
   */
  isLinux: () => process.platform === 'linux',

  /**
   * Menampilkan notifikasi sukses (deprecated - use custom notifications)
   * @deprecated Use custom toast notifications instead
   */
  showSuccessMessage: async (title: string, message: string) => {
    // Post message to renderer to use custom notification
    if (typeof window !== 'undefined' && window.postMessage) {
      window.postMessage({
        type: 'CUSTOM_NOTIFICATION',
        payload: { variant: 'success', title, message }
      }, '*');
      return { response: 0 };
    }

    return await electronAPI.dialog.showMessageBox({
      type: 'info',
      title,
      message,
      buttons: ['OK']
    });
  },

  /**
   * Menampilkan notifikasi error (deprecated - use custom notifications)
   * @deprecated Use custom toast notifications instead
   */
  showErrorMessage: async (title: string, message: string) => {
    // Post message to renderer to use custom notification
    if (typeof window !== 'undefined' && window.postMessage) {
      window.postMessage({
        type: 'CUSTOM_NOTIFICATION',
        payload: { variant: 'destructive', title, message }
      }, '*');
      return { response: 0 };
    }

    return await electronAPI.dialog.showMessageBox({
      type: 'error',
      title,
      message,
      buttons: ['OK']
    });
  },

  /**
   * Menampilkan konfirmasi dialog (deprecated - use custom dialogs)
   * @deprecated Use custom confirmation dialogs instead
   */
  showConfirmDialog: async (title: string, message: string) => {
    // Post message to renderer to use custom dialog
    if (typeof window !== 'undefined' && window.postMessage) {
      return new Promise((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'CUSTOM_DIALOG_RESPONSE') {
            window.removeEventListener('message', handler);
            resolve(event.data.payload.confirmed);
          }
        };

        window.addEventListener('message', handler);
        window.postMessage({
          type: 'CUSTOM_DIALOG',
          payload: { type: 'confirm', title, message }
        }, '*');
      });
    }

    const result = await electronAPI.dialog.showMessageBox({
      type: 'question',
      title,
      message,
      buttons: ['Ya', 'Tidak'],
      defaultId: 0,
      cancelId: 1
    });

    return result.response === 0;
  }
};

/**
 * Ekspos API ke renderer process melalui context bridge
 * Ini adalah cara yang aman untuk memberikan akses ke Electron APIs
 */
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
contextBridge.exposeInMainWorld('electronUtils', electronUtils);

/**
 * Type declarations untuk TypeScript support di renderer process
 */
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    electronUtils: typeof electronUtils;
  }
}