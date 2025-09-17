# Sistem Swagger Baru

Sistem dokumentasi API kini dibangun ulang untuk menyederhanakan pemeliharaan dan menghindari ketergantungan pada workspace lain.

## Fitur Utama
- Deteksi otomatis seluruh controller dan berkas rute melalui pencarian glob di `src/features/**/controllers` dan `src/**/routes`.
- Komponen standar (responses, parameter pagination, dan schema error) tersentral di `packages/backend/src/config/swagger/definition.ts`.
- Endpoint dokumentasi mendukung rebuild cepat dengan query `?refresh=true` tanpa restart server.
- Skrip `npm run generate:swagger --workspace backend` menulis ulang `src/config/swagger.json` dan `dist/config/swagger.json` untuk kebutuhan distribusi.
- Template anotasi konsisten tersedia di `packages/backend/src/config/swagger/templates.ts` beserta helper untuk operasi CRUD.

## Cara Pakai
1. Tambahkan anotasi `@swagger` pada controller menggunakan template dari `swagger/templates.ts`.
2. Jalankan server backend dan akses `http://localhost:3000/api-docs`.
3. Gunakan `http://localhost:3000/api-docs?refresh=true` bila ada penambahan controller baru dan ingin memaksa rebuild saat runtime.
4. Untuk menghasilkan file JSON statis jalankan `npm run generate:swagger --workspace backend`.

## Catatan
- Spesifikasi otomatis menyetel `servers[0].url` mengikuti host request (tidak lagi hard-coded).
- Jika menambah module baru, cukup pastikan file berada di bawah `src` (atau hasil build di `dist`); tidak perlu mendaftarkan manual.
- File `swagger.json` merupakan artefak hasil build – commit bila dibutuhkan untuk distribusi, atau abaikan ketika menggunakan generator dinamis.
