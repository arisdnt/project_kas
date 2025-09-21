import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import { join } from 'path';
import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';

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
   * Konfigurasi window properties dan load content
   */
  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: join(__dirname, '../preload/preload.js'),
        webSecurity: true
      },
      icon: this.getAppIcon(),
      show: false,
      titleBarStyle: 'default',
      autoHideMenuBar: false
    });

    // Load aplikasi setelah window siap
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      if (this.isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Load URL berdasarkan mode development atau production
    this.loadApplication();

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  /**
   * Load aplikasi berdasarkan mode development atau production
   */
  private loadApplication(): void {
    if (this.isDev) {
      // Development mode: load dari dev server
      this.mainWindow?.loadURL(`http://localhost:${this.frontendPort}`);
    } else {
      // Production mode: load dari file statis
      const frontendPath = join(__dirname, '../../frontend/index.html');
      if (existsSync(frontendPath)) {
        this.mainWindow?.loadFile(frontendPath);
      } else {
        this.showErrorDialog('Frontend tidak ditemukan', 
          'File frontend tidak ditemukan. Pastikan aplikasi sudah di-build dengan benar.');
      }
    }
  }

  /**
   * Memulai backend server
   * Spawn process backend dalam mode development atau production
   */
  private startBackendServer(): void {
    if (this.isDev) {
      // Development mode: jalankan backend dengan npm run dev
      this.backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: join(__dirname, '../../../backend'),
        stdio: 'pipe',
        shell: true
      });
    } else {
      // Production mode: jalankan backend dari build
      const backendPath = join(__dirname, '../../backend/index.js');
      if (existsSync(backendPath)) {
        this.backendProcess = spawn('node', [backendPath], {
          stdio: 'pipe',
          env: { ...process.env, NODE_ENV: 'production' }
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
    // Handler untuk mendapatkan informasi aplikasi
    ipcMain.handle('app:getVersion', () => {
      return app.getVersion();
    });

    // Handler untuk mendapatkan path aplikasi
    ipcMain.handle('app:getPath', (_, name: string) => {
      return app.getPath(name as any);
    });

    // Handler untuk menampilkan dialog
    ipcMain.handle('dialog:showMessageBox', async (_, options) => {
      if (this.mainWindow) {
        return await dialog.showMessageBox(this.mainWindow, options);
      }
      return await dialog.showMessageBox(options);
    });

    // Handler untuk membuka file dialog
    ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
      if (this.mainWindow) {
        return await dialog.showOpenDialog(this.mainWindow, options);
      }
      return await dialog.showOpenDialog(options);
    });

    // Handler untuk menyimpan file dialog
    ipcMain.handle('dialog:showSaveDialog', async (_, options) => {
      if (this.mainWindow) {
        return await dialog.showSaveDialog(this.mainWindow, options);
      }
      return await dialog.showSaveDialog(options);
    });

    // Handler untuk restart aplikasi
    ipcMain.handle('app:restart', () => {
      app.relaunch();
      app.exit();
    });

    // Handler untuk keluar aplikasi
    ipcMain.handle('app:quit', () => {
      this.cleanup();
      app.quit();
    });
  }

  /**
   * Setup menu aplikasi
   */
  private setupAppMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Keluar',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              this.cleanup();
              app.quit();
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload', label: 'Muat Ulang' },
          { role: 'forceReload', label: 'Paksa Muat Ulang' },
          { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
          { type: 'separator' },
          { role: 'resetZoom', label: 'Reset Zoom' },
          { role: 'zoomIn', label: 'Zoom In' },
          { role: 'zoomOut', label: 'Zoom Out' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Toggle Fullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize', label: 'Minimize' },
          { role: 'close', label: 'Tutup' }
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
    const iconPath = join(__dirname, '../../build/icon.png');
    return existsSync(iconPath) ? iconPath : '';
  }

  /**
   * Menampilkan dialog error
   */
  private showErrorDialog(title: string, content: string): void {
    dialog.showErrorBox(title, content);
  }

  /**
   * Cleanup resources sebelum aplikasi ditutup
   */
  private cleanup(): void {
    if (this.backendProcess) {
      this.backendProcess.kill();
      this.backendProcess = null;
    }
  }
}

// Inisialisasi aplikasi Electron
new ElectronApp();