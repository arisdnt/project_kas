-- Migration: Menghapus kolom is_super_admin dari tabel users
-- Tanggal: 2024-01-15
-- Deskripsi: Menghapus kolom is_super_admin karena penentuan hak akses sudah menggunakan kolom level dari tabel peran

-- Backup data sebelum menghapus kolom (opsional)
-- CREATE TABLE users_backup_is_super_admin AS SELECT id, username, is_super_admin FROM users WHERE is_super_admin = 1;

-- Menghapus kolom is_super_admin dari tabel users
ALTER TABLE users DROP COLUMN is_super_admin;

-- Verifikasi struktur tabel setelah perubahan
-- DESCRIBE users;

-- Catatan:
-- 1. Kolom is_super_admin telah dihapus dari tabel users
-- 2. Sistem sekarang menggunakan kolom level dari tabel peran untuk menentukan hak akses
-- 3. Level 8 (SUPER_ADMIN) sudah ditambahkan ke enum AccessLevel di kode aplikasi
-- 4. Semua referensi is_super_admin di kode aplikasi sudah dihapus