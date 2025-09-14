Arsitektur Akses Terpusat (Multi-tenant & Multi-role)

Ringkasan
- Akses dan isolasi data kini terpusat melalui middleware `accessScope`.
- Seluruh filtering tenant/toko dapat disusun konsisten via helper `applyScopeToSql`.
- Mendukung level/role: God (bypass), Admin (tenant scope), Admin Toko/Kasir (tenant+store scope).

Komponen Utama
- `src/core/middleware/accessScope.ts`
  - `attachAccessScope(req)`: mengisi `req.accessScope` dari `req.user` dan parameter `tokoId`.
  - `requireStoreWhenNeeded`: memastikan `tokoId` tersedia untuk level ≥3.
  - `applyScopeToSql(sql, params, scope, { tenantColumn, storeColumn })`: menambah klausul `WHERE`/`AND` untuk `tenant_id` dan `toko_id` sesuai scope.

Perubahan Otentikasi
- `AuthService` kini mengembalikan `tokoId` (jika ada relasi di tabel `pengguna`).
- `JWTPayload` berisi `tokoId` sehingga scope bisa dievaluasi lebih dini.

Cara Pakai di Service
1) Bangun query dasar tanpa kondisi tenant/toko.
2) Panggil `applyScopeToSql` dengan mapping kolom yang benar.
3) Eksekusi hasil SQL + params yang sudah ditambah.

Contoh (PelangganService)
```ts
const dataBase = `SELECT id, nama FROM pelanggan${baseWhere}`
const scoped = applyScopeToSql(dataBase, baseParams, scope, { tenantColumn: 'tenant_id', storeColumn: 'toko_id' })
const [rows] = await pool.execute(scoped.sql + ' ORDER BY nama ASC', scoped.params)
```

Konvensi
- Kolom default: `tenant_id`, `toko_id`. Jika ada alias, tentukan melalui opsi `tenantColumn`/`storeColumn` (mis. `u.tenant_id`, `p.toko_id`).
- Level/role mapping mengikuti middleware level sebelumnya; God user (`isGodUser`) bypass semua pembatasan.

Migrasi Bertahap
- Service lama boleh tetap berjalan, namun saat refactor gunakan `accessScope` dan `applyScopeToSql` agar konsisten dan mudah dirawat.

Rute/Controller
- Setelah `authenticate`, middleware global `attachAccessScope` aktif. Untuk endpoint yang memerlukan toko spesifik, tambahkan `requireStoreWhenNeeded`.

