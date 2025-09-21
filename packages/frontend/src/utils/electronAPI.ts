/**
 * Utility untuk integrasi Electron API di frontend
 * Menyediakan interface yang aman untuk mengakses Electron APIs
 */

/**
 * Interface untuk Electron API yang tersedia di window object
 */
interface ElectronAPI {
  app: {
    getVersion: () => Promise<string>;
    getPath: (name: string) => Promise<string>;
    restart: () => Promise<void>;
    quit: () => Promise<void>;
  };
  
  dialog: {
    showMessageBox: (options: any) => Promise<any>;
    showOpenDialog: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;
  };

  system: {
    platform: string;
    isElectron: boolean;
  };

  fs: {
    selectFile: (filters?: any[]) => Promise<string | null>;
    selectDirectory: () => Promise<string | null>;
    saveFile: (defaultPath?: string, filters?: any[]) => Promise<string | null>;
  };
}

interface ElectronUtils {
  isElectron: () => boolean;
  getPlatform: () => string;
  isWindows: () => boolean;
  isMacOS: () => boolean;
  isLinux: () => boolean;
  showSuccessMessage: (title: string, message: string) => Promise<any>;
  showErrorMessage: (title: string, message: string) => Promise<any>;
  showConfirmDialog: (title: string, message: string) => Promise<boolean>;
}

/**
 * Extend window interface untuk TypeScript support
 */
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    electronUtils?: ElectronUtils;
  }
}

/**
 * Class untuk mengelola integrasi Electron API
 */
export class ElectronIntegration {
  private static instance: ElectronIntegration;
  private isElectronApp: boolean = false;
  private electronAPI?: ElectronAPI;
  private electronUtils?: ElectronUtils;

  private constructor() {
    this.initializeElectron();
  }

  /**
   * Singleton pattern untuk ElectronIntegration
   */
  public static getInstance(): ElectronIntegration {
    if (!ElectronIntegration.instance) {
      ElectronIntegration.instance = new ElectronIntegration();
    }
    return ElectronIntegration.instance;
  }

  /**
   * Inisialisasi Electron API
   */
  private initializeElectron(): void {
    // Cek apakah aplikasi berjalan di Electron
    this.isElectronApp = !!(window.electronAPI && window.electronUtils);
    
    if (this.isElectronApp) {
      this.electronAPI = window.electronAPI;
      this.electronUtils = window.electronUtils;
      console.log('Electron API terdeteksi dan diinisialisasi');
    } else {
      console.log('Aplikasi berjalan di browser web');
    }
  }

  /**
   * Mengecek apakah aplikasi berjalan di Electron
   */
  public isElectron(): boolean {
    return this.isElectronApp;
  }

  /**
   * Mendapatkan versi aplikasi
   */
  public async getAppVersion(): Promise<string> {
    if (this.isElectronApp && this.electronAPI) {
      try {
        return await this.electronAPI.app.getVersion();
      } catch (error) {
        console.error('Error mendapatkan versi aplikasi:', error);
        return '1.0.0';
      }
    }
    return '1.0.0 (Web)';
  }

  /**
   * Mendapatkan platform sistem
   */
  public getPlatform(): string {
    if (this.isElectronApp && this.electronUtils) {
      return this.electronUtils.getPlatform();
    }
    return navigator.platform || 'Web';
  }

  /**
   * Mengecek apakah platform adalah Windows
   */
  public isWindows(): boolean {
    if (this.isElectronApp && this.electronUtils) {
      return this.electronUtils.isWindows();
    }
    return navigator.platform.toLowerCase().includes('win');
  }

  /**
   * Mengecek apakah platform adalah macOS
   */
  public isMacOS(): boolean {
    if (this.isElectronApp && this.electronUtils) {
      return this.electronUtils.isMacOS();
    }
    return navigator.platform.toLowerCase().includes('mac');
  }

  /**
   * Mengecek apakah platform adalah Linux
   */
  public isLinux(): boolean {
    if (this.isElectronApp && this.electronUtils) {
      return this.electronUtils.isLinux();
    }
    return navigator.platform.toLowerCase().includes('linux');
  }

  /**
   * Menampilkan pesan sukses
   */
  public async showSuccessMessage(title: string, message: string): Promise<void> {
    if (this.isElectronApp && this.electronUtils) {
      await this.electronUtils.showSuccessMessage(title, message);
    } else {
      // Fallback untuk web browser
      alert(`${title}\n\n${message}`);
    }
  }

  /**
   * Menampilkan pesan error
   */
  public async showErrorMessage(title: string, message: string): Promise<void> {
    if (this.isElectronApp && this.electronUtils) {
      await this.electronUtils.showErrorMessage(title, message);
    } else {
      // Fallback untuk web browser
      alert(`Error: ${title}\n\n${message}`);
    }
  }

  /**
   * Menampilkan dialog konfirmasi
   */
  public async showConfirmDialog(title: string, message: string): Promise<boolean> {
    if (this.isElectronApp && this.electronUtils) {
      return await this.electronUtils.showConfirmDialog(title, message);
    } else {
      // Fallback untuk web browser
      return confirm(`${title}\n\n${message}`);
    }
  }

  /**
   * Memilih file dengan dialog
   */
  public async selectFile(filters?: any[]): Promise<string | null> {
    if (this.isElectronApp && this.electronAPI) {
      return await this.electronAPI.fs.selectFile(filters);
    } else {
      // Fallback untuk web browser menggunakan input file
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          resolve(file ? file.name : null);
        };
        input.click();
      });
    }
  }

  /**
   * Memilih direktori dengan dialog
   */
  public async selectDirectory(): Promise<string | null> {
    if (this.isElectronApp && this.electronAPI) {
      return await this.electronAPI.fs.selectDirectory();
    } else {
      // Fallback untuk web browser
      console.warn('Pemilihan direktori tidak didukung di web browser');
      return null;
    }
  }

  /**
   * Restart aplikasi
   */
  public async restartApp(): Promise<void> {
    if (this.isElectronApp && this.electronAPI) {
      await this.electronAPI.app.restart();
    } else {
      // Fallback untuk web browser
      window.location.reload();
    }
  }

  /**
   * Keluar dari aplikasi
   */
  public async quitApp(): Promise<void> {
    if (this.isElectronApp && this.electronAPI) {
      await this.electronAPI.app.quit();
    } else {
      // Fallback untuk web browser
      window.close();
    }
  }

  /**
   * Mendapatkan informasi sistem
   */
  public getSystemInfo(): any {
    return {
      isElectron: this.isElectronApp,
      platform: this.getPlatform(),
      isWindows: this.isWindows(),
      isMacOS: this.isMacOS(),
      isLinux: this.isLinux(),
      userAgent: navigator.userAgent
    };
  }

  /**
   * Setup custom headers untuk request ke backend
   */
  public getElectronHeaders(): Record<string, string> {
    if (this.isElectronApp) {
      return {
        'X-Electron-App': 'kasir-pos',
        'X-Platform': this.getPlatform(),
        'X-App-Mode': 'desktop'
      };
    }
    return {};
  }
}

// Export singleton instance
export const electronAPI = ElectronIntegration.getInstance();

// Export utility functions
export const isElectronApp = () => electronAPI.isElectron();
export const getElectronHeaders = () => electronAPI.getElectronHeaders();
export const showElectronMessage = (title: string, message: string, type: 'success' | 'error' = 'success') => {
  if (type === 'success') {
    return electronAPI.showSuccessMessage(title, message);
  } else {
    return electronAPI.showErrorMessage(title, message);
  }
};