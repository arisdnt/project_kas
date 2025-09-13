-- =====================================================
-- Database Structure with UUID Primary Keys
-- Multi-Tenant, Multi-Store, Multi-User System
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- =====================================================
-- CORE TABLES (Tenant, Users, Store Management)
-- =====================================================

-- Tabel Tenants (Multi-tenant support)
CREATE TABLE tenants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telepon VARCHAR(20),
    alamat TEXT,
    status ENUM('aktif', 'nonaktif', 'suspended') DEFAULT 'aktif',
    paket ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
    max_toko INT DEFAULT 1,
    max_pengguna INT DEFAULT 5,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenants_status (status),
    INDEX idx_tenants_paket (paket)
);

-- Tabel Users (System users)
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    telepon VARCHAR(20),
    avatar_url VARCHAR(255),
    status ENUM('aktif', 'nonaktif', 'suspended') DEFAULT 'aktif',
    is_super_admin BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_users_tenant (tenant_id),
    INDEX idx_users_status (status),
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
);

-- Tabel Toko (Multi-store support)
CREATE TABLE toko (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(20) UNIQUE NOT NULL,
    alamat TEXT,
    telepon VARCHAR(20),
    email VARCHAR(100),
    status ENUM('aktif', 'nonaktif', 'maintenance') DEFAULT 'aktif',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    mata_uang VARCHAR(3) DEFAULT 'IDR',
    logo_url VARCHAR(255),
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_toko_tenant (tenant_id),
    INDEX idx_toko_status (status),
    INDEX idx_toko_kode (kode)
);

-- =====================================================
-- MASTER DATA TABLES
-- =====================================================

-- Tabel Kategori Produk
CREATE TABLE kategori (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    parent_id CHAR(36) NULL,
    icon_url VARCHAR(255),
    urutan INT DEFAULT 0,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES kategori(id) ON DELETE SET NULL,
    INDEX idx_kategori_tenant (tenant_id),
    INDEX idx_kategori_parent (parent_id),
    INDEX idx_kategori_status (status)
);

-- Tabel Brand
CREATE TABLE brand (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    logo_url VARCHAR(255),
    website VARCHAR(255),
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_brand_tenant (tenant_id),
    INDEX idx_brand_status (status)
);

-- Tabel Supplier
CREATE TABLE supplier (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    kontak_person VARCHAR(100),
    telepon VARCHAR(20),
    email VARCHAR(100),
    alamat TEXT,
    npwp VARCHAR(20),
    bank_nama VARCHAR(50),
    bank_rekening VARCHAR(30),
    bank_atas_nama VARCHAR(100),
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_supplier_tenant (tenant_id),
    INDEX idx_supplier_status (status)
);

-- Tabel Peran (Roles)
CREATE TABLE peran (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    nama VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    level INT DEFAULT 1,
    is_system_role BOOLEAN DEFAULT FALSE,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_peran_tenant (tenant_id),
    INDEX idx_peran_level (level),
    INDEX idx_peran_status (status)
);

-- Tabel Izin (Permissions)
CREATE TABLE izin (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    modul VARCHAR(50) NOT NULL,
    aksi VARCHAR(50) NOT NULL,
    resource VARCHAR(100),
    is_system_permission BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_izin_modul (modul),
    INDEX idx_izin_aksi (aksi),
    UNIQUE KEY uk_izin_modul_aksi_resource (modul, aksi, resource)
);

-- =====================================================
-- OPERATIONAL TABLES
-- =====================================================

-- Tabel Pengguna (Store users)
CREATE TABLE pengguna (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    toko_id CHAR(36) NOT NULL,
    peran_id CHAR(36) NOT NULL,
    user_id CHAR(36) NULL,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telepon VARCHAR(20),
    alamat TEXT,
    tanggal_lahir DATE,
    jenis_kelamin ENUM('L', 'P'),
    foto_url VARCHAR(255),
    status ENUM('aktif', 'nonaktif', 'cuti') DEFAULT 'aktif',
    gaji_pokok DECIMAL(15,2) DEFAULT 0,
    komisi_persen DECIMAL(5,2) DEFAULT 0,
    tanggal_masuk DATE,
    tanggal_keluar DATE NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (toko_id) REFERENCES toko(id) ON DELETE CASCADE,
    FOREIGN KEY (peran_id) REFERENCES peran(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_pengguna_tenant (tenant_id),
    INDEX idx_pengguna_toko (toko_id),
    INDEX idx_pengguna_peran (peran_id),
    INDEX idx_pengguna_status (status)
);

-- Tabel Pelanggan
CREATE TABLE pelanggan (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    toko_id CHAR(36) NOT NULL,
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telepon VARCHAR(20),
    alamat TEXT,
    tanggal_lahir DATE,
    jenis_kelamin ENUM('L', 'P'),
    pekerjaan VARCHAR(100),
    tipe ENUM('reguler', 'member', 'vip') DEFAULT 'reguler',
    diskon_persen DECIMAL(5,2) DEFAULT 0,
    limit_kredit DECIMAL(15,2) DEFAULT 0,
    saldo_poin INT DEFAULT 0,
    status ENUM('aktif', 'nonaktif', 'blacklist') DEFAULT 'aktif',
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (toko_id) REFERENCES toko(id) ON DELETE CASCADE,
    INDEX idx_pelanggan_tenant (tenant_id),
    INDEX idx_pelanggan_toko (toko_id),
    INDEX idx_pelanggan_kode (kode),
    INDEX idx_pelanggan_tipe (tipe),
    INDEX idx_pelanggan_status (status)
);

-- Tabel Produk
CREATE TABLE produk (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    kategori_id CHAR(36) NOT NULL,
    brand_id CHAR(36) NOT NULL,
    supplier_id CHAR(36) NOT NULL,
    kode VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    nama VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    satuan VARCHAR(20) DEFAULT 'pcs',
    harga_beli DECIMAL(15,2) NOT NULL DEFAULT 0,
    harga_jual DECIMAL(15,2) NOT NULL DEFAULT 0,
    margin_persen DECIMAL(5,2) DEFAULT 0,
    stok_minimum INT DEFAULT 0,
    berat DECIMAL(8,2) DEFAULT 0,
    dimensi VARCHAR(50),
    gambar_url VARCHAR(255),
    is_aktif BOOLEAN DEFAULT TRUE,
    is_dijual_online BOOLEAN DEFAULT FALSE,
    pajak_persen DECIMAL(5,2) DEFAULT 0,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE RESTRICT,
    FOREIGN KEY (brand_id) REFERENCES brand(id) ON DELETE RESTRICT,
    FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE RESTRICT,
    INDEX idx_produk_tenant (tenant_id),
    INDEX idx_produk_kategori (kategori_id),
    INDEX idx_produk_brand (brand_id),
    INDEX idx_produk_supplier (supplier_id),
    INDEX idx_produk_kode (kode),
    INDEX idx_produk_barcode (barcode),
    INDEX idx_produk_aktif (is_aktif)
);

-- Tabel Transaksi
CREATE TABLE transaksi (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    toko_id CHAR(36) NOT NULL,
    pengguna_id CHAR(36) NOT NULL,
    pelanggan_id CHAR(36) NULL,
    nomor_transaksi VARCHAR(50) UNIQUE NOT NULL,
    tipe ENUM('penjualan', 'pembelian', 'retur_jual', 'retur_beli') NOT NULL,
    tanggal DATETIME NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    diskon_persen DECIMAL(5,2) DEFAULT 0,
    diskon_nominal DECIMAL(15,2) DEFAULT 0,
    pajak_persen DECIMAL(5,2) DEFAULT 0,
    pajak_nominal DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL DEFAULT 0,
    bayar DECIMAL(15,2) DEFAULT 0,
    kembalian DECIMAL(15,2) DEFAULT 0,
    metode_bayar ENUM('tunai', 'transfer', 'kartu', 'kredit', 'poin') DEFAULT 'tunai',
    status ENUM('draft', 'selesai', 'batal', 'pending') DEFAULT 'draft',
    catatan TEXT,
    referensi_transaksi CHAR(36) NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (toko_id) REFERENCES toko(id) ON DELETE CASCADE,
    FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE RESTRICT,
    FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id) ON DELETE SET NULL,
    FOREIGN KEY (referensi_transaksi) REFERENCES transaksi(id) ON DELETE SET NULL,
    INDEX idx_transaksi_tenant (tenant_id),
    INDEX idx_transaksi_toko (toko_id),
    INDEX idx_transaksi_pengguna (pengguna_id),
    INDEX idx_transaksi_pelanggan (pelanggan_id),
    INDEX idx_transaksi_nomor (nomor_transaksi),
    INDEX idx_transaksi_tipe (tipe),
    INDEX idx_transaksi_tanggal (tanggal),
    INDEX idx_transaksi_status (status)
);

-- Tabel Inventaris (Stock per toko)
CREATE TABLE inventaris (
    produk_id CHAR(36) NOT NULL,
    toko_id CHAR(36) NOT NULL,
    stok_tersedia INT NOT NULL DEFAULT 0,
    stok_reserved INT NOT NULL DEFAULT 0,
    harga_jual_toko DECIMAL(15,2),
    stok_minimum_toko INT DEFAULT 0,
    lokasi_rak VARCHAR(50),
    terakhir_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (produk_id, toko_id),
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE,
    FOREIGN KEY (toko_id) REFERENCES toko(id) ON DELETE CASCADE,
    INDEX idx_inventaris_stok (stok_tersedia),
    INDEX idx_inventaris_update (terakhir_update)
);

-- =====================================================
-- RELATION TABLES
-- =====================================================

-- Tabel Izin Peran (Role Permissions)
CREATE TABLE izin_peran (
    peran_id CHAR(36) NOT NULL,
    izin_id CHAR(36) NOT NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (peran_id, izin_id),
    FOREIGN KEY (peran_id) REFERENCES peran(id) ON DELETE CASCADE,
    FOREIGN KEY (izin_id) REFERENCES izin(id) ON DELETE CASCADE
);

-- Tabel Item Transaksi
CREATE TABLE item_transaksi (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    transaksi_id CHAR(36) NOT NULL,
    produk_id CHAR(36) NOT NULL,
    kuantitas INT NOT NULL DEFAULT 1,
    harga_satuan DECIMAL(15,2) NOT NULL,
    diskon_persen DECIMAL(5,2) DEFAULT 0,
    diskon_nominal DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    catatan TEXT,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE RESTRICT,
    INDEX idx_item_transaksi_transaksi (transaksi_id),
    INDEX idx_item_transaksi_produk (produk_id)
);

-- Tabel Dokumen Transaksi (untuk MinIO integration)
CREATE TABLE dokumen_transaksi (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    transaksi_id CHAR(36) NOT NULL,
    nama_file VARCHAR(255) NOT NULL,
    tipe_dokumen ENUM('struk', 'invoice', 'nota', 'kwitansi', 'foto') NOT NULL,
    mime_type VARCHAR(100),
    ukuran_file BIGINT,
    path_minio VARCHAR(500) NOT NULL,
    url_akses VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
    INDEX idx_dokumen_transaksi (transaksi_id),
    INDEX idx_dokumen_tipe (tipe_dokumen)
);

-- Tabel User Sessions
CREATE TABLE user_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_expires (expires_at),
    INDEX idx_sessions_active (is_active)
);

-- =====================================================
-- ADDITIONAL SUPPORT TABLES
-- =====================================================

-- Tabel Audit Log
CREATE TABLE audit_log (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    user_id CHAR(36),
    tabel VARCHAR(50) NOT NULL,
    record_id CHAR(36),
    aksi ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT') NOT NULL,
    data_lama JSON,
    data_baru JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_tenant (tenant_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_tabel (tabel),
    INDEX idx_audit_aksi (aksi),
    INDEX idx_audit_tanggal (dibuat_pada)
);

-- Tabel Konfigurasi Sistem
CREATE TABLE konfigurasi_sistem (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    toko_id CHAR(36) NULL,
    kunci VARCHAR(100) NOT NULL,
    nilai TEXT,
    tipe_data ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    deskripsi TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (toko_id) REFERENCES toko(id) ON DELETE CASCADE,
    UNIQUE KEY uk_config_tenant_toko_kunci (tenant_id, toko_id, kunci),
    INDEX idx_config_tenant (tenant_id),
    INDEX idx_config_toko (toko_id),
    INDEX idx_config_kunci (kunci)
);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default permissions
INSERT INTO izin (id, nama, deskripsi, modul, aksi, resource, is_system_permission) VALUES
(UUID(), 'Dashboard View', 'Melihat dashboard', 'dashboard', 'view', 'dashboard', TRUE),
(UUID(), 'User Management', 'Mengelola pengguna', 'users', 'manage', 'users', TRUE),
(UUID(), 'Store Management', 'Mengelola toko', 'stores', 'manage', 'stores', TRUE),
(UUID(), 'Product View', 'Melihat produk', 'products', 'view', 'products', TRUE),
(UUID(), 'Product Manage', 'Mengelola produk', 'products', 'manage', 'products', TRUE),
(UUID(), 'Transaction View', 'Melihat transaksi', 'transactions', 'view', 'transactions', TRUE),
(UUID(), 'Transaction Create', 'Membuat transaksi', 'transactions', 'create', 'transactions', TRUE),
(UUID(), 'Transaction Manage', 'Mengelola transaksi', 'transactions', 'manage', 'transactions', TRUE),
(UUID(), 'Inventory View', 'Melihat inventaris', 'inventory', 'view', 'inventory', TRUE),
(UUID(), 'Inventory Manage', 'Mengelola inventaris', 'inventory', 'manage', 'inventory', TRUE),
(UUID(), 'Report View', 'Melihat laporan', 'reports', 'view', 'reports', TRUE),
(UUID(), 'Report Generate', 'Generate laporan', 'reports', 'generate', 'reports', TRUE),
(UUID(), 'Settings Manage', 'Mengelola pengaturan', 'settings', 'manage', 'settings', TRUE);

-- Create default tenant
INSERT INTO tenants (id, nama, email, telepon, alamat, status, paket, max_toko, max_pengguna) VALUES
(UUID(), 'Default Tenant', 'admin@kasir.com', '081234567890', 'Jakarta, Indonesia', 'aktif', 'enterprise', 10, 50);

-- Get tenant ID for subsequent inserts
SET @tenant_id = (SELECT id FROM tenants WHERE email = 'admin@kasir.com' LIMIT 1);

-- Create default super admin user
INSERT INTO users (id, tenant_id, username, email, password_hash, nama_lengkap, status, is_super_admin) VALUES
(UUID(), @tenant_id, 'admin', 'admin@kasir.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'aktif', TRUE);

-- Create default store
INSERT INTO toko (id, tenant_id, nama, kode, alamat, telepon, email, status) VALUES
(UUID(), @tenant_id, 'Toko Utama', 'TK001', 'Jakarta Pusat', '021-1234567', 'toko@kasir.com', 'aktif');

-- Create default roles
INSERT INTO peran (id, tenant_id, nama, deskripsi, level, is_system_role) VALUES
(UUID(), @tenant_id, 'Super Admin', 'Administrator sistem dengan akses penuh', 1, TRUE),
(UUID(), @tenant_id, 'Admin Toko', 'Administrator toko dengan akses manajemen', 2, TRUE),
(UUID(), @tenant_id, 'Kasir', 'Kasir dengan akses transaksi', 3, TRUE),
(UUID(), @tenant_id, 'Staff', 'Staff dengan akses terbatas', 4, TRUE);

-- Create default categories
INSERT INTO kategori (id, tenant_id, nama, deskripsi, status) VALUES
(UUID(), @tenant_id, 'Makanan', 'Kategori produk makanan', 'aktif'),
(UUID(), @tenant_id, 'Minuman', 'Kategori produk minuman', 'aktif'),
(UUID(), @tenant_id, 'Elektronik', 'Kategori produk elektronik', 'aktif'),
(UUID(), @tenant_id, 'Fashion', 'Kategori produk fashion', 'aktif');

-- Create default brands
INSERT INTO brand (id, tenant_id, nama, deskripsi, status) VALUES
(UUID(), @tenant_id, 'Generic', 'Brand umum untuk produk tanpa brand', 'aktif'),
(UUID(), @tenant_id, 'House Brand', 'Brand internal toko', 'aktif');

-- Create default supplier
INSERT INTO supplier (id, tenant_id, nama, kontak_person, telepon, email, alamat, status) VALUES
(UUID(), @tenant_id, 'Supplier Umum', 'Admin Supplier', '081234567890', 'supplier@kasir.com', 'Jakarta', 'aktif');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- END OF DATABASE STRUCTURE
-- =====================================================