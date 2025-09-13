-- Migration: Create dokumen_transaksi table
-- Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
-- Tabel untuk menyimpan metadata dokumen/berkas yang terkait dengan transaksi

CREATE TABLE IF NOT EXISTS dokumen_transaksi (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  -- ID unik untuk setiap dokumen
  
  id_transaksi BIGINT UNSIGNED NULL,
  -- Kunci asing ke tabel transaksi (nullable untuk dokumen umum)
  
  kunci_objek VARCHAR(255) NOT NULL,
  -- Kunci objek (nama file unik) di MinIO
  
  nama_file_asli VARCHAR(255) NOT NULL,
  -- Nama file asli yang diupload user
  
  ukuran_file BIGINT UNSIGNED NOT NULL,
  -- Ukuran file dalam bytes
  
  tipe_mime VARCHAR(100) NOT NULL,
  -- MIME type file (image/jpeg, application/pdf, dll)
  
  kategori ENUM('umum', 'produk', 'dokumen') NOT NULL DEFAULT 'umum',
  -- Kategori file sesuai UploadTarget
  
  id_pengguna INT UNSIGNED NOT NULL,
  -- ID pengguna yang mengupload file
  
  id_toko INT UNSIGNED NOT NULL,
  -- ID toko (multi-tenant support)
  
  deskripsi TEXT NULL,
  -- Deskripsi opsional untuk file
  
  status ENUM('aktif', 'dihapus', 'arsip') NOT NULL DEFAULT 'aktif',
  -- Status file
  
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Timestamp upload
  
  diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Timestamp update terakhir
  
  -- Indexes untuk performa
  INDEX idx_dokumen_transaksi (id_transaksi),
  INDEX idx_dokumen_kunci_objek (kunci_objek),
  INDEX idx_dokumen_kategori (kategori),
  INDEX idx_dokumen_pengguna (id_pengguna),
  INDEX idx_dokumen_toko (id_toko),
  INDEX idx_dokumen_status (status),
  INDEX idx_dokumen_created (dibuat_pada),
  
  -- Composite index untuk filtering dan pagination
  INDEX idx_dokumen_composite (id_toko, kategori, status, dibuat_pada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analyze table untuk optimasi query planner
ANALYZE TABLE dokumen_transaksi;