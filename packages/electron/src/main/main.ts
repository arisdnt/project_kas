import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { IpcMainInvokeEvent, MenuItemConstructorOptions, OpenDialogOptions, SaveDialogOptions, MessageBoxOptions } from 'electron';

/**
 * Kelas utama untuk mengelola aplikasi Electron
 * Menangani lifecycle aplikasi, window management, dan integrasi backend
 */
class ElectronApp {
  private mainWindow: BrowserWindow | null = null;
  private backendProcess: ChildProcess | null = null;
  private isDev = process.env.NODE_ENV === 'development';
  private backendPort = 3000;
  private frontendPort = 3002;

  constructor() {
    this.initializeApp();
  }

  /**
   * Inisialisasi aplikasi Electron
   * Setup event listeners dan konfigurasi dasar
   */
  private initializeApp(): void {
    // Tunggu sampai aplikasi siap
    app.whenReady().then(() => {
      this.createMainWindow();
      this.startBackendServer();
      this.setupIpcHandlers();
      this.setupAppMenu();
    });

    // Keluar aplikasi ketika semua window ditutup (kecuali macOS)
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.cleanup();
        app.quit();
      }
    });

    // Aktifkan kembali aplikasi di macOS
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    // Cleanup saat aplikasi akan keluar
    app.on('before-quit', () => {
      this.cleanup();
    });
  }

  /**
   * Membuat window utama aplikasi
   * Konfigurasi window dan security settings
   */
  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/preload.js'),
        webSecurity: true,
        devTools: false // Menonaktifkan developer tools sepenuhnya
      },
      // Konfigurasi frameless window - PENTING: frame harus false
      frame: false,
      // Untuk macOS, gunakan titleBarStyle
      ...(process.platform === 'darwin' && {
        titleBarStyle: 'hiddenInset'
      }),
      // Untuk Windows, gunakan konfigurasi khusus
      ...(process.platform === 'win32' && {
        titleBarStyle: 'hidden',
        titleBarOverlay: false
      }),
      // Window properties
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true,
      // Visual properties
      transparent: false,
      hasShadow: true,
      skipTaskbar: false,
      alwaysOnTop: false
    });

    // Menonaktifkan context menu (klik kanan)
    this.mainWindow.webContents.on('context-menu', (e) => {
      e.preventDefault();
    });

    // Menonaktifkan keyboard shortcuts untuk developer tools
    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      // Blokir F12
      if (input.key === 'F12') {
        event.preventDefault();
      }
      // Blokir Ctrl+Shift+I (Windows/Linux)
      if (input.control && input.shift && input.key === 'I') {
        event.preventDefault();
      }
      // Blokir Ctrl+Shift+J (Console)
      if (input.control && input.shift && input.key === 'J') {
        event.preventDefault();
      }
      // Blokir Ctrl+U (View Source)
      if (input.control && input.key === 'U') {
        event.preventDefault();
      }
      // Blokir Ctrl+Shift+C (Inspect Element)
      if (input.control && input.shift && input.key === 'C') {
        event.preventDefault();
      }
    });

    // Load aplikasi setelah window siap
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      // Tidak membuka dev tools bahkan di development mode
    });

    this.loadApplication();
  }

  /**
   * Load aplikasi frontend
   * Development: dari dev server, Production: dari file statis
   */
  private loadApplication(): void {
    // Mengubah user agent untuk menyembunyikan identitas Electron
    const customUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 KasirPOS/1.0.0';
    
    if (this.isDev) {
      // Development mode: load dari dev server
      this.mainWindow?.loadURL(`http://localhost:${this.frontendPort}`);
    } else {
      // Production mode: load dari file statis
      const frontendPath = path.join(__dirname, '../../frontend/index.html');
      if (fs.existsSync(frontendPath)) {
        this.mainWindow?.loadFile(frontendPath);
      } else {
        this.showErrorDialog('Error', 'Frontend build tidak ditemukan');
      }
    }
    
    // Set user agent untuk semua request
    this.mainWindow?.webContents.setUserAgent(customUserAgent);
  }

  /**
   * Menjalankan backend server
   * Development: npm run dev, Production: node index.js
   */
  private startBackendServer(): void {
    if (this.isDev) {
      // Development mode: jalankan backend dengan npm run dev
      this.backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, '../../../backend'),
        stdio: 'pipe',
        shell: true
      });
    } else {
      // Production mode: jalankan backend dari build
      const backendPath = path.join(__dirname, '../../backend/index.js');
      if (fs.existsSync(backendPath)) {
        this.backendProcess = spawn('node', [backendPath], {
          stdio: 'pipe',
          shell: true
        });
      }
    }

    if (this.backendProcess) {
      this.backendProcess.stdout?.on('data', (data) => {
        console.log(`Backend: ${data}`);
      });

      this.backendProcess.stderr?.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
      });

      this.backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
      });
    }
  }

  /**
   * Setup IPC handlers untuk komunikasi dengan renderer process
   */
  private setupIpcHandlers(): void {
    // Hapus semua handler yang ada sebelum mendaftarkan yang baru
    ipcMain.removeAllListeners('dialog:showOpenDialog');
    ipcMain.removeAllListeners('dialog:showSaveDialog');
    ipcMain.removeAllListeners('dialog:showMessageBox');
    ipcMain.removeAllListeners('window:minimize');
    ipcMain.removeAllListeners('window:maximize');
    ipcMain.removeAllListeners('window:close');
    ipcMain.removeAllListeners('window:isMaximized');

    // Handler untuk kontrol window
    ipcMain.handle('window:minimize', async (): Promise<void> => {
      if (this.mainWindow) {
        this.mainWindow.minimize();
      }
    });

    ipcMain.handle('window:maximize', async (): Promise<void> => {
      if (this.mainWindow) {
        if (this.mainWindow.isMaximized()) {
          this.mainWindow.unmaximize();
        } else {
          this.mainWindow.maximize();
        }
      }
    });

    ipcMain.handle('window:close', async (): Promise<void> => {
      if (this.mainWindow) {
        this.mainWindow.close();
      }
    });

    ipcMain.handle('window:isMaximized', async (): Promise<boolean> => {
      return this.mainWindow ? this.mainWindow.isMaximized() : false;
    });

    // Handler untuk mendapatkan informasi aplikasi
    ipcMain.handle('app:getVersion', async (): Promise<string> => {
      return app.getVersion();
    });

    ipcMain.handle('app:getPath', async (_: IpcMainInvokeEvent, name: string): Promise<string> => {
      return app.getPath(name as any);
    });

    ipcMain.handle('app:restart', async (): Promise<void> => {
      app.relaunch();
      app.exit();
    });

    ipcMain.handle('app:quit', async (): Promise<void> => {
      this.cleanup();
      app.quit();
    });

    // Handler untuk dialog
    ipcMain.handle('dialog:showMessageBox', async (_: IpcMainInvokeEvent, options: MessageBoxOptions) => {
      if (this.mainWindow) {
        return await dialog.showMessageBox(this.mainWindow, options);
      }
      return await dialog.showMessageBox(options);
    });

    ipcMain.handle('dialog:showOpenDialog', async (event: IpcMainInvokeEvent, options?: OpenDialogOptions) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: options?.properties || ['openFile'],
        filters: options?.filters || [{ name: 'All Files', extensions: ['*'] }]
      });
      return result.canceled ? [] : result.filePaths;
    });

    ipcMain.handle('dialog:showSaveDialog', async (event: IpcMainInvokeEvent, options?: SaveDialogOptions) => {
      const filters = options?.filters;
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        filters: filters || [{ name: 'All Files', extensions: ['*'] }]
      });
      return result.canceled ? null : (result.filePath || null);
    });

    // Handler untuk file system
    ipcMain.handle('fs:selectFile', async (_: IpcMainInvokeEvent, filters?: any[]): Promise<string | null> => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openFile'],
        filters: filters || [{ name: 'All Files', extensions: ['*'] }]
      });
      return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle('fs:selectDirectory', async (): Promise<string | null> => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openDirectory']
      });
      return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle('fs:saveFile', async (_: IpcMainInvokeEvent, defaultPath?: string, filters?: any[]): Promise<string | null> => {
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        defaultPath,
        filters: filters || [{ name: 'All Files', extensions: ['*'] }]
      });
      return result.canceled ? null : (result.filePath || null);
    });
  }

  /**
   * Setup menu aplikasi - Menonaktifkan semua menu yang bisa membuka developer tools
   */
  private setupAppMenu(): void {
    const template: MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          { role: 'quit', label: 'Keluar' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo', label: 'Undo' },
          { role: 'redo', label: 'Redo' },
          { type: 'separator' },
          { role: 'cut', label: 'Cut' },
          { role: 'copy', label: 'Copy' },
          { role: 'paste', label: 'Paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload', label: 'Reload' },
          { role: 'forceReload', label: 'Force Reload' },
          // Menghapus toggleDevTools dari menu
          { type: 'separator' },
          { role: 'resetZoom', label: 'Reset Zoom' },
          { role: 'zoomIn', label: 'Zoom In' },
          { role: 'zoomOut', label: 'Zoom Out' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Toggle Fullscreen' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  /**
   * Mendapatkan path icon aplikasi
   */
  private getAppIcon(): string {
    const iconPath = path.join(__dirname, '../../build/icon.svg');
    return fs.existsSync(iconPath) ? iconPath : '';
  }

  /**
   * Menampilkan dialog error
   */
  private showErrorDialog(title: string, content: string): void {
    dialog.showErrorBox(title, content);
  }

  /**
   * Cleanup resources saat aplikasi ditutup
   */
  private cleanup(): void {
    if (this.backendProcess) {
      this.backendProcess.kill();
      this.backendProcess = null;
    }
  }
}

// Inisialisasi aplikasi
new ElectronApp();