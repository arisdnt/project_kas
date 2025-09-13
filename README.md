# Sistem POS Real‑Time Multi‑Tenant

Dokumentasi lengkap untuk menjalankan proyek ini di Ubuntu 24.04. Monorepo berisi Backend (Express + TypeScript) dan Frontend (React + Vite + Tailwind).

## ✨ Fitur Utama
- API Node.js/Express dengan TypeScript, JWT Auth, dan Rate Limiting
- Frontend React (Vite) dengan komponen modular per fitur
- Real‑time via Socket.IO
- Penyimpanan dokumen opsional (MinIO/S3 compatible)
- Siap produksi: build terpisah, SPA di‑serve oleh backend

## 🧱 Arsitektur & Struktur
```
.
├─ packages/
│  ├─ backend/            # API Express + TS
│  │  ├─ src/
│  │  │  ├─ core/         # config, database, utils, middleware
│  │  │  └─ features/     # auth, produk, penjualan, dst (controllers/services/models/routes)
│  │  └─ database/migrations/*.sql
│  └─ frontend/           # React + Vite + Tailwind
│     └─ src/core, src/features
├─ dokumentasi/           # dokumen pendukung
├─ assets/                # aset umum
└─ package.json           # workspace scripts
```

## ✅ Prasyarat (Ubuntu 24.04)
- Node.js ≥ 18 dan npm ≥ 9
- Git, build tools: `sudo apt update && sudo apt install -y build-essential git curl`
- MySQL Server 8.x (atau MariaDB ≥ 10.6): `sudo apt install -y mysql-server`
- Opsional: MinIO (untuk penyimpanan file) atau penyedia S3 kompatibel

Instal Node.js (via nvm):
```
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v && npm -v
```

## 🛠️ Instalasi
1) Klon repo dan masuk folder proyek
```
git clone https://github.com/<org>/<repo>.git
cd <repo>
```
2) Install dependencies semua workspace
```
npm run install:all
```
3) Siapkan database MySQL (contoh)
```
sudo mysql -e "CREATE DATABASE kasir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; \
CREATE USER 'posuser'@'localhost' IDENTIFIED BY 'strong_password_here'; \
GRANT ALL PRIVILEGES ON kasir.* TO 'posuser'@'localhost'; FLUSH PRIVILEGES;"
```
4) Jalankan migrasi SQL
```
for f in packages/backend/database/migrations/*.sql; do \
  echo "Applying $f"; \
  mysql -u posuser -p'strong_password_here' kasir < "$f"; \
done
```
5) Buat file env backend: `packages/backend/.env`
```
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# JWT
JWT_SECRET=please-change-this-to-a-long-random-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS (sesuaikan bila akses dari domain lain)
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=posuser
DB_PASSWORD=strong_password_here
DB_NAME=kasir

# MinIO / S3 (opsional)
MINIO_ENABLED=false
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=pos-files
```

## 🚀 Menjalankan Aplikasi (Development)
- Jalankan backend & frontend bersamaan:
```
npm run dev
```
- Akses:
  - Frontend (Vite dev): http://localhost:5173
  - API Base: http://localhost:3000/api
  - Health Check: http://localhost:3000/health dan /health/status

Per‑workspace:
```
# Backend
npm run dev --workspace=backend
npm run lint --workspace=backend
npm test --workspace=backend

# Frontend
npm run dev --workspace=frontend
npm run lint --workspace=frontend
```

## 📦 Build Produksi
```
# Build kedua workspace
npm run build

# Start backend (meng‑serve SPA hasil build frontend)
NODE_ENV=production npm start --workspace=backend
```
- Frontend build berada di `packages/frontend/dist` dan otomatis di‑serve oleh backend pada route `/` dan `/dashboard`.

## 🧪 Pengujian
- Backend: Jest (`npm test --workspace=backend`). Tambahkan `--coverage` bila perlu.
- Frontend: belum ada setup unit test; lakukan verifikasi manual/e2e sesuai kebutuhan.

## 🧹 Kualitas Kode
- ESLint tersedia di kedua workspace: `npm run lint --workspace=<backend|frontend>`
- Ikuti penamaan: React Component PascalCase, hooks `useX.ts`, store Zustand `xStore.ts`. Backend: `XController.ts`, `XService.ts`, `xRoutes.ts`. Gunakan alias import `@/...`.

## 🗄️ Opsi Penyimpanan Berkas (MinIO, Opsional)
Menjalankan MinIO via Docker (contoh lokal):
```
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
  -v ~/minio-data:/data quay.io/minio/minio server /data --console-address ":9001"
```
Lalu set `.env` backend: `MINIO_ENABLED=true`, endpoint/credential sesuai.

## 🧰 Skrip Penting (Root)
- `npm run dev` – jalankan backend & frontend sekaligus
- `npm run build` – build backend (tsc) dan frontend (vite)
- `npm run install:all` – install dependencies semua workspace
- `npm run clean` – hapus `node_modules` dan `dist` seluruh workspace

## 🐞 Troubleshooting
- Port bentrok: ubah `PORT` backend atau port Vite, atau matikan proses yang berjalan.
- Error MySQL auth: pastikan user/DB benar; bila perlu, gunakan `ALTER USER ... IDENTIFIED WITH mysql_native_password BY '...'` pada MySQL 8.
- CORS error: set `CORS_ORIGIN` agar cocok dengan origin frontend.
- MinIO gagal: set `MINIO_ENABLED=false` untuk menonaktifkan sementara; cek koneksi dan kredensial.
- Rate limit (429): saat pengujian beban, sesuaikan `RATE_LIMIT_*` di `.env` bila diperlukan.

## 🔒 Keamanan
- Jangan commit kredensial produksi. Simpan `.env` secara lokal/secret manager.
- Gunakan `JWT_SECRET` panjang dan acak.
- Backup database dan bucket penyimpanan secara berkala.

## 📄 Lisensi
MIT
