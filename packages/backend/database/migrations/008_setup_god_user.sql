-- Migration: Setup God User dan Virtual Tenant/Store
-- Created: 2025-09-18
-- Description: Membuat virtual tenant dan store untuk god user serta memasukkan data god user

-- 1. Buat virtual tenant untuk god user
INSERT IGNORE INTO `tenants` (
    `id`,
    `nama`,
    `email`,
    `telepon`,
    `alamat`,
    `status`,
    `paket`,
    `max_toko`,
    `max_pengguna`,
    `dibuat_pada`,
    `diperbarui_pada`
) VALUES (
    'god-tenant-bypass',
    'God Tenant (System)',
    'god@system.internal',
    '000-000-0000',
    'System Virtual Address',
    'aktif',
    'enterprise',
    9999,
    9999,
    NOW(),
    NOW()
);

-- 2. Buat virtual store untuk god user
INSERT IGNORE INTO `toko` (
    `id`,
    `tenant_id`,
    `nama`,
    `kode`,
    `alamat`,
    `telepon`,
    `email`,
    `status`,
    `timezone`,
    `mata_uang`,
    `logo_url`,
    `dibuat_pada`,
    `diperbarui_pada`
) VALUES (
    'god-store-bypass',
    'god-tenant-bypass',
    'God Store (System)',
    'GOD-STORE',
    'System Virtual Store Address',
    '000-000-0000',
    'god-store@system.internal',
    'aktif',
    'Asia/Jakarta',
    'IDR',
    NULL,
    NOW(),
    NOW()
);

-- 3. Buat peran khusus untuk god user (level 1)
INSERT IGNORE INTO `peran` (
    `id`,
    `tenant_id`,
    `nama`,
    `deskripsi`,
    `level`,
    `status`,
    `dibuat_pada`,
    `diperbarui_pada`
) VALUES (
    'god-peran-system',
    'god-tenant-bypass',
    'God User',
    'Super Administrator dengan akses penuh ke semua tenant dan toko',
    1,
    'aktif',
    NOW(),
    NOW()
);

-- 4. Masukkan god user ke tabel users
-- Password hash untuk "god123" dengan bcrypt salt rounds 12
INSERT IGNORE INTO `users` (
    `id`,
    `tenant_id`,
    `toko_id`,
    `peran_id`,
    `username`,
    `password_hash`,
    `status`,
    `last_login`,
    `dibuat_pada`,
    `diperbarui_pada`
) VALUES (
    'god-user-system-id',
    'god-tenant-bypass',
    'god-store-bypass',
    'god-peran-system',
    'god',
    '$2a$12$wyFusB7MvuhwyB3jLwg/rO7iAIQnGLfQhsTKewLuQMbVL7Z7PRDUO',
    'aktif',
    NULL,
    NOW(),
    NOW()
);

-- 5. Buat detail user untuk god user
INSERT IGNORE INTO `detail_user` (
    `id`,
    `user_id`,
    `tenant_id`,
    `toko_id`,
    `nama_lengkap`,
    `email`,
    `telepon`,
    `alamat`,
    `tanggal_lahir`,
    `jenis_kelamin`,
    `gaji_poko`,
    `komisi_persen`,
    `tanggal_masuk`,
    `tanggal_keluar`,
    `avatar_url`,
    `dibuat_pada`,
    `diperbarui_pada`
) VALUES (
    UUID(),
    'god-user-system-id',
    'god-tenant-bypass',
    'god-store-bypass',
    'God User - System Administrator',
    'god@system.internal',
    '000-000-0000',
    'System Administrator Address',
    '1970-01-01',
    'L',
    0.00,
    0.00,
    '1970-01-01',
    NULL,
    NULL,
    NOW(),
    NOW()
);

-- 6. Verifikasi data yang telah dibuat
SELECT
    'God Tenant Created' as message,
    t.id,
    t.nama
FROM tenants t
WHERE t.id = 'god-tenant-bypass'

UNION ALL

SELECT
    'God Store Created' as message,
    s.id,
    s.nama
FROM toko s
WHERE s.id = 'god-store-bypass'

UNION ALL

SELECT
    'God User Created' as message,
    u.id,
    u.username
FROM users u
WHERE u.id = 'god-user-system-id';