# Kasir POS - Aplikasi Desktop Electron

Aplikasi desktop Point of Sale (POS) yang dibangun dengan Electron, menyediakan antarmuka native untuk sistem kasir yang terintegrasi dengan backend dan frontend web.

## 🚀 Fitur Utama

- **Aplikasi Desktop Native**: Berjalan sebagai aplikasi desktop Windows/macOS/Linux
- **Integrasi Backend**: Otomatis menjalankan dan mengelola backend server
- **Notifikasi Native**: Sistem notifikasi desktop terintegrasi
- **Auto-updater**: Sistem pembaruan otomatis (dalam pengembangan)
- **Secure API**: Komunikasi aman antara main dan renderer process
- **File System Access**: Akses file system untuk export/import data

## 📁 Struktur Direktori

```
packages/electron/
├── src/
│   ├── main/           # Main process Electron
│   │   └── main.ts     # Entry point aplikasi
│   └── preload/        # Preload scripts
│       └── preload.ts  # API bridge untuk renderer
├── scripts/            # Build dan development scripts
│   ├── build.js        # Script build otomatis
│   └── dev.js          # Script development
├── build/              # Asset build
│   ├── icon.svg        # Icon aplikasi
│   └── installer.nsh   # Script installer Windows
├── tsconfig.json       # Konfigurasi TypeScript base
├── tsconfig.main.json  # Konfigurasi TypeScript main process
├── tsconfig.preload.json # Konfigurasi TypeScript preload
└── electron-builder.yml # Konfigurasi packaging
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm atau yarn
- Backend dan Frontend sudah ter-setup

### Instalasi Dependencies

```bash
cd packages/electron
npm install
```

### Menjalankan Development Server

```bash
# Menjalankan semua services (backend, frontend, electron)
npm run dev

# Atau menjalankan individual
npm run dev:backend   # Backend saja
npm run dev:frontend  # Frontend saja  
npm run dev:electron  # Electron saja (setelah backend & frontend ready)
```

### Build untuk Development

```bash
# Build semua komponen
npm run build:all

# Build individual
npm run build         # Electron scripts saja
npm run build:backend # Backend saja
npm run build:frontend # Frontend saja
```

## 📦 Packaging & Distribution

### Build Package Development

```bash
# Package untuk testing (tidak compressed)
npm run pack
```

### Build Distribution

```bash
# Build distribusi lengkap
npm run dist

# Build khusus Windows
npm run dist:win
```

### Output

Hasil build akan tersimpan di:
- `dist-electron/` - Package aplikasi
- `dist/` - Compiled TypeScript files

## 🔧 Konfigurasi

### Electron Builder

Konfigurasi packaging ada di `electron-builder.yml`:

```yaml
appId: com.kasir.pos
productName: Kasir POS
directories:
  output: dist-electron
  buildResources: build
```

### TypeScript

- `tsconfig.json` - Konfigurasi base
- `tsconfig.main.json` - Main process
- `tsconfig.preload.json` - Preload scripts

## 🔐 Security

### Context Isolation

Aplikasi menggunakan context isolation untuk keamanan:

```typescript
// preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  // API yang aman untuk renderer
});
```

### Secure Communication

Komunikasi antara main dan renderer menggunakan IPC yang aman:

```typescript
// Main process
ipcMain.handle('secure-api-call', async (event, data) => {
  // Handle secure API calls
});

// Renderer process (melalui preload)
window.electronAPI.secureCall(data);
```

## 🔄 Auto-updater

Sistem auto-updater dikonfigurasi untuk pembaruan otomatis:

```typescript
// main.ts
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();
```

## 🧪 Testing

```bash
# Jalankan tests (belum diimplementasi)
npm test
```

## 📱 Platform Support

### Windows
- Target: NSIS installer
- Architecture: x64
- Icon: SVG (converted to ICO)

### macOS (Opsional)
- Target: DMG
- Architecture: x64, ARM64
- Category: Business

### Linux (Opsional)  
- Target: AppImage
- Architecture: x64
- Category: Office

## 🔍 Debugging

### Development Tools

```bash
# Buka DevTools di Electron
Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (macOS)
```

### Logging

Aplikasi menggunakan console logging dengan prefix:

```
[TIMESTAMP] [BACKEND] Backend message
[TIMESTAMP] [FRONTEND] Frontend message  
[TIMESTAMP] [ELECTRON] Electron message
```

## 🚨 Troubleshooting

### Port Sudah Digunakan

```bash
# Cek port yang digunakan
netstat -ano | findstr :3000
netstat -ano | findstr :3002

# Kill process
taskkill /PID <PID> /F
```

### Build Gagal

```bash
# Bersihkan cache
npm run clean
npm install

# Build ulang
npm run build:all
```

### Electron Tidak Muncul

1. Pastikan backend dan frontend sudah running
2. Cek console untuk error messages
3. Verifikasi port 3000 dan 3002 accessible

## 📄 License

MIT License - Lihat file LICENSE untuk detail lengkap.

## 👥 Tim Pengembang

Tim Pengembang Kasir POS

---

Untuk informasi lebih lanjut, lihat dokumentasi di direktori `dokumentasi/`.