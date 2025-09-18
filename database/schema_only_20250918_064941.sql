-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: kasir
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tabel` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aksi` enum('CREATE','UPDATE','DELETE','LOGIN','LOGOUT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_lama` json DEFAULT NULL,
  `data_baru` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_tenant` (`tenant_id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_tabel` (`tabel`),
  KEY `idx_audit_aksi` (`aksi`),
  KEY `idx_audit_tanggal` (`dibuat_pada`),
  CONSTRAINT `audit_log_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_audit_log_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('aktif','nonaktif') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_brand_tenant` (`tenant_id`),
  KEY `idx_brand_status` (`status`),
  KEY `idx_brand_toko_id` (`toko_id`),
  CONSTRAINT `fk_brand_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_brand_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detail_user`
--

DROP TABLE IF EXISTS `detail_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detail_user` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_lengkap` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telepon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('L','P') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gaji_poko` decimal(15,2) DEFAULT NULL,
  `komisi_persen` decimal(5,2) DEFAULT NULL,
  `tanggal_masuk` date DEFAULT NULL,
  `tanggal_keluar` date DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_email` (`email`),
  KEY `idx_detail_user_tenant_id` (`tenant_id`),
  KEY `idx_detail_user_toko_id` (`toko_id`),
  CONSTRAINT `detail_user_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detail_user_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detail_user_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dokumen_minio`
--

DROP TABLE IF EXISTS `dokumen_minio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dokumen_minio` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bucket_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `object_key` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_dokumen` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_file_asli` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe_file` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ukuran_file` bigint NOT NULL DEFAULT '0',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hash_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kategori_dokumen` enum('invoice','receipt','contract','image','document','other') COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `status` enum('uploaded','processing','ready','error','deleted') COLLATE utf8mb4_unicode_ci DEFAULT 'uploaded',
  `is_public` tinyint(1) DEFAULT '0',
  `expires_at` timestamp NULL DEFAULT NULL,
  `metadata_json` json DEFAULT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_toko_id` (`toko_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_kategori` (`kategori_dokumen`),
  KEY `idx_dibuat_pada` (`dibuat_pada`),
  KEY `idx_dokumen_minio_tenant_toko` (`tenant_id`,`toko_id`),
  KEY `idx_dokumen_minio_user_status` (`user_id`,`status`),
  KEY `idx_dokumen_minio_bucket_key` (`bucket_name`,`object_key`),
  KEY `idx_dokumen_minio_tipe_kategori` (`tipe_file`,`kategori_dokumen`),
  CONSTRAINT `fk_dokumen_minio_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dokumen_minio_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dokumen_minio_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dokument_retur_pembelian`
--

DROP TABLE IF EXISTS `dokument_retur_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dokument_retur_pembelian` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `transaksi_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Pembuat/pengunggah dokumen',
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lokasi transaksi',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Pemilik bisnis',
  `nama_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama file dokumen',
  `tipe_dokumen` enum('struk','invoice','nota','kwitansi','foto') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis dokumen',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipe MIME file',
  `ukuran_file` bigint DEFAULT NULL COMMENT 'Ukuran file dalam bytes',
  `path_minio` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path file di MinIO',
  `url_akses` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL akses publik',
  `is_public` tinyint(1) DEFAULT '0' COMMENT 'Apakah dokumen publik',
  `status_dokumen` enum('draft','aktif','arsip','dihapus') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif' COMMENT 'Status dokumen',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Keterangan tambahan dokumen',
  `metadata_dokumen` json DEFAULT NULL COMMENT 'Metadata tambahan dalam format JSON',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan',
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu pembaruan terakhir',
  PRIMARY KEY (`id`),
  KEY `idx_transaksi_id` (`transaksi_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_toko_id` (`toko_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_tipe_dokumen` (`tipe_dokumen`),
  KEY `idx_status_dokumen` (`status_dokumen`),
  KEY `idx_dibuat_pada` (`dibuat_pada`),
  CONSTRAINT `fk_dokument_retur_pembelian_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_retur_pembelian_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_retur_pembelian_transaksi` FOREIGN KEY (`transaksi_id`) REFERENCES `retur_pembelian` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_retur_pembelian_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dokument_retur_penjualan`
--

DROP TABLE IF EXISTS `dokument_retur_penjualan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dokument_retur_penjualan` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `transaksi_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Pembuat/pengunggah dokumen',
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lokasi transaksi',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Pemilik bisnis',
  `nama_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama file dokumen',
  `tipe_dokumen` enum('struk','invoice','nota','kwitansi','foto') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis dokumen',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipe MIME file',
  `ukuran_file` bigint DEFAULT NULL COMMENT 'Ukuran file dalam bytes',
  `path_minio` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path file di MinIO',
  `url_akses` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL akses publik',
  `is_public` tinyint(1) DEFAULT '0' COMMENT 'Apakah dokumen publik',
  `status_dokumen` enum('draft','aktif','arsip','dihapus') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif' COMMENT 'Status dokumen',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Keterangan tambahan dokumen',
  `metadata_dokumen` json DEFAULT NULL COMMENT 'Metadata tambahan dalam format JSON',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan',
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu pembaruan terakhir',
  PRIMARY KEY (`id`),
  KEY `idx_transaksi_id` (`transaksi_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_toko_id` (`toko_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_tipe_dokumen` (`tipe_dokumen`),
  KEY `idx_status_dokumen` (`status_dokumen`),
  KEY `idx_dibuat_pada` (`dibuat_pada`),
  CONSTRAINT `fk_dokument_retur_penjualan_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_retur_penjualan_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_retur_penjualan_transaksi` FOREIGN KEY (`transaksi_id`) REFERENCES `retur_penjualan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_retur_penjualan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dokument_transaksi_pembelian`
--

DROP TABLE IF EXISTS `dokument_transaksi_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dokument_transaksi_pembelian` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `transaksi_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Pembuat/pengunggah dokumen',
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lokasi transaksi',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Pemilik bisnis',
  `nama_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama file dokumen',
  `tipe_dokumen` enum('struk','invoice','nota','kwitansi','foto') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis dokumen',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipe MIME file',
  `ukuran_file` bigint DEFAULT NULL COMMENT 'Ukuran file dalam bytes',
  `path_minio` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path file di MinIO',
  `url_akses` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL akses publik',
  `is_public` tinyint(1) DEFAULT '0' COMMENT 'Apakah dokumen publik',
  `status_dokumen` enum('draft','aktif','arsip','dihapus') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif' COMMENT 'Status dokumen',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Keterangan tambahan dokumen',
  `metadata_dokumen` json DEFAULT NULL COMMENT 'Metadata tambahan dalam format JSON',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan',
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu pembaruan terakhir',
  PRIMARY KEY (`id`),
  KEY `idx_transaksi_id` (`transaksi_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_toko_id` (`toko_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_tipe_dokumen` (`tipe_dokumen`),
  KEY `idx_status_dokumen` (`status_dokumen`),
  KEY `idx_dibuat_pada` (`dibuat_pada`),
  CONSTRAINT `fk_dokument_pembelian_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_pembelian_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_pembelian_transaksi` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi_pembelian` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_pembelian_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dokument_transaksi_penjualan`
--

DROP TABLE IF EXISTS `dokument_transaksi_penjualan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dokument_transaksi_penjualan` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `transaksi_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Pembuat/pengunggah dokumen',
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lokasi transaksi',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Pemilik bisnis',
  `nama_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama file dokumen',
  `tipe_dokumen` enum('struk','invoice','nota','kwitansi','foto') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis dokumen',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipe MIME file',
  `ukuran_file` bigint DEFAULT NULL COMMENT 'Ukuran file dalam bytes',
  `path_minio` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path file di MinIO',
  `url_akses` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL akses publik',
  `is_public` tinyint(1) DEFAULT '0' COMMENT 'Apakah dokumen publik',
  `status_dokumen` enum('draft','aktif','arsip','dihapus') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif' COMMENT 'Status dokumen',
  `keterangan` text COLLATE utf8mb4_unicode_ci COMMENT 'Keterangan tambahan dokumen',
  `metadata_dokumen` json DEFAULT NULL COMMENT 'Metadata tambahan dalam format JSON',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan',
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu pembaruan terakhir',
  PRIMARY KEY (`id`),
  KEY `idx_transaksi_id` (`transaksi_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_toko_id` (`toko_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_tipe_dokumen` (`tipe_dokumen`),
  KEY `idx_status_dokumen` (`status_dokumen`),
  KEY `idx_dibuat_pada` (`dibuat_pada`),
  CONSTRAINT `fk_dokument_penjualan_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_penjualan_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_penjualan_transaksi` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi_penjualan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dokument_penjualan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventaris`
--

DROP TABLE IF EXISTS `inventaris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventaris` (
  `produk_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stok_tersedia` int NOT NULL DEFAULT '0',
  `stok_reserved` int NOT NULL DEFAULT '0',
  `harga_jual_toko` decimal(15,2) DEFAULT NULL,
  `stok_minimum_toko` int DEFAULT '0',
  `lokasi_rak` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `terakhir_update` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`produk_id`,`toko_id`),
  KEY `toko_id` (`toko_id`),
  KEY `idx_inventaris_stok` (`stok_tersedia`),
  KEY `idx_inventaris_update` (`terakhir_update`),
  CONSTRAINT `inventaris_ibfk_1` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventaris_ibfk_2` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `item_retur_pembelian`
--

DROP TABLE IF EXISTS `item_retur_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_retur_pembelian` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `retur_pembelian_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `produk_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kuantitas` int NOT NULL DEFAULT '1',
  `harga_satuan` decimal(15,2) NOT NULL,
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `subtotal` decimal(15,2) NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_retur_pembelian` (`retur_pembelian_id`),
  KEY `idx_produk` (`produk_id`),
  CONSTRAINT `fk_item_retur_pembelian_produk` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_item_retur_pembelian_retur` FOREIGN KEY (`retur_pembelian_id`) REFERENCES `retur_pembelian` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `item_retur_penjualan`
--

DROP TABLE IF EXISTS `item_retur_penjualan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_retur_penjualan` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `retur_penjualan_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `produk_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kuantitas` int NOT NULL DEFAULT '1',
  `harga_satuan` decimal(15,2) NOT NULL,
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `subtotal` decimal(15,2) NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_retur_penjualan` (`retur_penjualan_id`),
  KEY `idx_produk` (`produk_id`),
  CONSTRAINT `fk_item_retur_penjualan_produk` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_item_retur_penjualan_retur` FOREIGN KEY (`retur_penjualan_id`) REFERENCES `retur_penjualan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `item_transaksi_pembelian`
--

DROP TABLE IF EXISTS `item_transaksi_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_transaksi_pembelian` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `transaksi_pembelian_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `produk_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kuantitas` int NOT NULL DEFAULT '1',
  `harga_satuan` decimal(15,2) NOT NULL,
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `subtotal` decimal(15,2) NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transaksi_pembelian` (`transaksi_pembelian_id`),
  KEY `idx_produk` (`produk_id`),
  CONSTRAINT `fk_item_pembelian_produk` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_item_pembelian_transaksi` FOREIGN KEY (`transaksi_pembelian_id`) REFERENCES `transaksi_pembelian` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `item_transaksi_penjualan`
--

DROP TABLE IF EXISTS `item_transaksi_penjualan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_transaksi_penjualan` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `transaksi_penjualan_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `produk_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kuantitas` int NOT NULL DEFAULT '1',
  `harga_satuan` decimal(15,2) NOT NULL,
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `subtotal` decimal(15,2) NOT NULL,
  `promo_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID promo yang diterapkan pada item ini',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transaksi_penjualan` (`transaksi_penjualan_id`),
  KEY `idx_produk` (`produk_id`),
  KEY `idx_item_transaksi_promo` (`promo_id`),
  CONSTRAINT `fk_item_penjualan_produk` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_item_penjualan_transaksi` FOREIGN KEY (`transaksi_penjualan_id`) REFERENCES `transaksi_penjualan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_item_transaksi_promo` FOREIGN KEY (`promo_id`) REFERENCES `promo` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kategori`
--

DROP TABLE IF EXISTS `kategori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategori` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `icon_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `urutan` int DEFAULT '0',
  `status` enum('aktif','nonaktif') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kategori_tenant` (`tenant_id`),
  KEY `idx_kategori_status` (`status`),
  KEY `idx_kategori_toko_id` (`toko_id`),
  CONSTRAINT `fk_kategori_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_kategori_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `konfigurasi_sistem`
--

DROP TABLE IF EXISTS `konfigurasi_sistem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `konfigurasi_sistem` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pajak` decimal(5,2) DEFAULT '0.00',
  `is_pajak_aktif` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_config_tenant` (`tenant_id`),
  KEY `idx_config_toko` (`toko_id`),
  CONSTRAINT `fk_konfigurasi_sistem_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `konfigurasi_sistem_ibfk_2` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pelanggan`
--

DROP TABLE IF EXISTS `pelanggan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pelanggan` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telepon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('L','P') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pekerjaan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipe` enum('reguler','member','vip') COLLATE utf8mb4_unicode_ci DEFAULT 'reguler',
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `limit_kredit` decimal(15,2) DEFAULT '0.00',
  `saldo_poin` int DEFAULT '0',
  `status` enum('aktif','nonaktif','blacklist') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`),
  KEY `idx_pelanggan_tenant` (`tenant_id`),
  KEY `idx_pelanggan_toko` (`toko_id`),
  KEY `idx_pelanggan_kode` (`kode`),
  KEY `idx_pelanggan_tipe` (`tipe`),
  KEY `idx_pelanggan_status` (`status`),
  CONSTRAINT `fk_pelanggan_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pelanggan_ibfk_2` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `penggunaan_promo`
--

DROP TABLE IF EXISTS `penggunaan_promo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `penggunaan_promo` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()) COMMENT 'ID unik penggunaan promo',
  `promo_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID promo yang digunakan',
  `transaksi_penjualan_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID transaksi yang menggunakan promo',
  `pelanggan_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID pelanggan yang menggunakan promo',
  `kode_promo_digunakan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kode promo yang diinput saat transaksi',
  `nilai_diskon_diberikan` decimal(15,2) NOT NULL COMMENT 'Nilai diskon yang diberikan',
  `tanggal_digunakan` datetime NOT NULL COMMENT 'Waktu promo digunakan',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan record',
  PRIMARY KEY (`id`),
  KEY `idx_penggunaan_promo_promo` (`promo_id`),
  KEY `idx_penggunaan_promo_transaksi` (`transaksi_penjualan_id`),
  KEY `idx_penggunaan_promo_pelanggan` (`pelanggan_id`),
  KEY `idx_penggunaan_promo_tanggal` (`tanggal_digunakan`),
  KEY `idx_penggunaan_promo_kode` (`kode_promo_digunakan`),
  CONSTRAINT `fk_penggunaan_promo_pelanggan` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_penggunaan_promo_promo` FOREIGN KEY (`promo_id`) REFERENCES `promo` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_penggunaan_promo_transaksi` FOREIGN KEY (`transaksi_penjualan_id`) REFERENCES `transaksi_penjualan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_penggunaan_nilai_diskon` CHECK ((`nilai_diskon_diberikan` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel tracking penggunaan promo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `peran`
--

DROP TABLE IF EXISTS `peran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `peran` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `level` int DEFAULT '1',
  `status` enum('aktif','nonaktif') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_peran_tenant` (`tenant_id`),
  KEY `idx_peran_level` (`level`),
  KEY `idx_peran_status` (`status`),
  CONSTRAINT `fk_peran_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `produk`
--

DROP TABLE IF EXISTS `produk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produk` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kategori_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `satuan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pcs',
  `harga_beli` decimal(15,2) NOT NULL DEFAULT '0.00',
  `harga_jual` decimal(15,2) NOT NULL DEFAULT '0.00',
  `margin_persen` decimal(5,2) DEFAULT '0.00',
  `stok_minimum` int DEFAULT '0',
  `berat` decimal(8,2) DEFAULT '0.00',
  `dimensi` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gambar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_aktif` tinyint(1) DEFAULT '1',
  `is_dijual_online` tinyint(1) DEFAULT '0',
  `pajak_persen` decimal(5,2) DEFAULT '0.00',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`),
  KEY `idx_produk_tenant` (`tenant_id`),
  KEY `idx_produk_kategori` (`kategori_id`),
  KEY `idx_produk_brand` (`brand_id`),
  KEY `idx_produk_supplier` (`supplier_id`),
  KEY `idx_produk_kode` (`kode`),
  KEY `idx_produk_barcode` (`barcode`),
  KEY `idx_produk_aktif` (`is_aktif`),
  KEY `idx_produk_toko_id` (`toko_id`),
  CONSTRAINT `fk_produk_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_produk_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `produk_ibfk_2` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `produk_ibfk_3` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `produk_ibfk_4` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `promo`
--

DROP TABLE IF EXISTS `promo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()) COMMENT 'ID unik promo',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID tenant pemilik promo',
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID toko tempat promo berlaku',
  `kode_promo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kode unik promo untuk input manual',
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama promo yang ditampilkan',
  `deskripsi` text COLLATE utf8mb4_unicode_ci COMMENT 'Deskripsi detail promo',
  `tipe_promo` enum('produk','kategori','transaksi','pelanggan') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis scope promo',
  `tipe_diskon` enum('persen','nominal','beli_dapat') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis diskon yang diberikan',
  `nilai_diskon` decimal(15,2) NOT NULL COMMENT 'Besaran diskon (persen atau nominal)',
  `tanggal_mulai` datetime NOT NULL COMMENT 'Tanggal mulai berlaku promo',
  `tanggal_berakhir` datetime NOT NULL COMMENT 'Tanggal berakhir promo',
  `minimum_pembelian` decimal(15,2) DEFAULT '0.00' COMMENT 'Minimum pembelian untuk mendapat promo',
  `maksimum_penggunaan` int DEFAULT NULL COMMENT 'Batas maksimum penggunaan promo (NULL = unlimited)',
  `jumlah_terpakai` int DEFAULT '0' COMMENT 'Jumlah promo yang sudah digunakan',
  `status` enum('aktif','nonaktif','habis','expired') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif' COMMENT 'Status promo saat ini',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan record',
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu update terakhir',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promo_kode` (`tenant_id`,`kode_promo`),
  KEY `idx_promo_tenant` (`tenant_id`),
  KEY `idx_promo_toko` (`toko_id`),
  KEY `idx_promo_status` (`status`),
  KEY `idx_promo_periode` (`tanggal_mulai`,`tanggal_berakhir`),
  KEY `idx_promo_tipe` (`tipe_promo`),
  CONSTRAINT `fk_promo_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_promo_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_promo_jumlah_terpakai` CHECK ((`jumlah_terpakai` >= 0)),
  CONSTRAINT `chk_promo_maksimum_penggunaan` CHECK (((`maksimum_penggunaan` is null) or (`maksimum_penggunaan` > 0))),
  CONSTRAINT `chk_promo_minimum_pembelian` CHECK ((`minimum_pembelian` >= 0)),
  CONSTRAINT `chk_promo_nilai_diskon` CHECK ((`nilai_diskon` > 0)),
  CONSTRAINT `chk_promo_periode` CHECK ((`tanggal_berakhir` > `tanggal_mulai`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel master promo dan diskon';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `promo_kategori`
--

DROP TABLE IF EXISTS `promo_kategori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo_kategori` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()) COMMENT 'ID unik relasi promo-kategori',
  `promo_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID promo yang terkait',
  `kategori_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID kategori yang mendapat promo',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan relasi',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promo_kategori` (`promo_id`,`kategori_id`),
  KEY `idx_promo_kategori_promo` (`promo_id`),
  KEY `idx_promo_kategori_kategori` (`kategori_id`),
  CONSTRAINT `fk_promo_kategori_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_promo_kategori_promo` FOREIGN KEY (`promo_id`) REFERENCES `promo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel relasi promo dengan kategori produk';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `promo_pelanggan`
--

DROP TABLE IF EXISTS `promo_pelanggan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo_pelanggan` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()) COMMENT 'ID unik relasi promo-pelanggan',
  `promo_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID promo yang terkait',
  `pelanggan_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID pelanggan yang mendapat promo khusus',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan relasi',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promo_pelanggan` (`promo_id`,`pelanggan_id`),
  KEY `idx_promo_pelanggan_promo` (`promo_id`),
  KEY `idx_promo_pelanggan_pelanggan` (`pelanggan_id`),
  CONSTRAINT `fk_promo_pelanggan_pelanggan` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_promo_pelanggan_promo` FOREIGN KEY (`promo_id`) REFERENCES `promo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel relasi promo dengan pelanggan khusus';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `promo_produk`
--

DROP TABLE IF EXISTS `promo_produk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo_produk` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()) COMMENT 'ID unik relasi promo-produk',
  `promo_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID promo yang terkait',
  `produk_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID produk yang mendapat promo',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan relasi',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_promo_produk` (`promo_id`,`produk_id`),
  KEY `idx_promo_produk_promo` (`promo_id`),
  KEY `idx_promo_produk_produk` (`produk_id`),
  CONSTRAINT `fk_promo_produk_produk` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_promo_produk_promo` FOREIGN KEY (`promo_id`) REFERENCES `promo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel relasi promo dengan produk spesifik';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `retur_pembelian`
--

DROP TABLE IF EXISTS `retur_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retur_pembelian` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pengguna_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaksi_pembelian_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nomor_retur` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal` datetime NOT NULL,
  `alasan_retur` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `pajak_persen` decimal(5,2) DEFAULT '0.00',
  `pajak_nominal` decimal(15,2) DEFAULT '0.00',
  `total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `metode_pengembalian` enum('tunai','transfer','kartu','kredit','poin') COLLATE utf8mb4_unicode_ci DEFAULT 'tunai',
  `status` enum('draft','diproses','selesai','batal') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomor_retur` (`nomor_retur`),
  KEY `idx_tenant_toko` (`tenant_id`,`toko_id`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_status` (`status`),
  KEY `idx_transaksi_asli` (`transaksi_pembelian_id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_nomor` (`nomor_retur`),
  KEY `fk_retur_pembelian_toko` (`toko_id`),
  KEY `fk_retur_pembelian_pengguna` (`pengguna_id`),
  CONSTRAINT `fk_retur_pembelian_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_retur_pembelian_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_retur_pembelian_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_retur_pembelian_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_retur_pembelian_transaksi` FOREIGN KEY (`transaksi_pembelian_id`) REFERENCES `transaksi_pembelian` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `retur_penjualan`
--

DROP TABLE IF EXISTS `retur_penjualan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retur_penjualan` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pengguna_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaksi_penjualan_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pelanggan_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nomor_retur` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal` datetime NOT NULL,
  `alasan_retur` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `pajak_persen` decimal(5,2) DEFAULT '0.00',
  `pajak_nominal` decimal(15,2) DEFAULT '0.00',
  `total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `metode_pengembalian` enum('tunai','transfer','kartu','kredit','poin') COLLATE utf8mb4_unicode_ci DEFAULT 'tunai',
  `status` enum('draft','diproses','selesai','batal') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomor_retur` (`nomor_retur`),
  KEY `idx_tenant_toko` (`tenant_id`,`toko_id`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_status` (`status`),
  KEY `idx_transaksi_asli` (`transaksi_penjualan_id`),
  KEY `idx_nomor` (`nomor_retur`),
  KEY `fk_retur_penjualan_toko` (`toko_id`),
  KEY `fk_retur_penjualan_pengguna` (`pengguna_id`),
  KEY `fk_retur_penjualan_pelanggan` (`pelanggan_id`),
  CONSTRAINT `fk_retur_penjualan_pelanggan` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_retur_penjualan_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_retur_penjualan_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_retur_penjualan_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_retur_penjualan_transaksi` FOREIGN KEY (`transaksi_penjualan_id`) REFERENCES `transaksi_penjualan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kontak_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telepon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `npwp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_nama` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_rekening` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_atas_nama` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('aktif','nonaktif') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_tenant` (`tenant_id`),
  KEY `idx_supplier_status` (`status`),
  KEY `idx_supplier_toko_id` (`toko_id`),
  CONSTRAINT `fk_supplier_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telepon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `status` enum('aktif','nonaktif','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `paket` enum('basic','premium','enterprise') COLLATE utf8mb4_unicode_ci DEFAULT 'basic',
  `max_toko` int DEFAULT '1',
  `max_pengguna` int DEFAULT '5',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_tenants_status` (`status`),
  KEY `idx_tenants_paket` (`paket`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `toko`
--

DROP TABLE IF EXISTS `toko`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `toko` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `telepon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('aktif','nonaktif','maintenance') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Asia/Jakarta',
  `mata_uang` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'IDR',
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`),
  KEY `idx_toko_tenant` (`tenant_id`),
  KEY `idx_toko_status` (`status`),
  KEY `idx_toko_kode` (`kode`),
  CONSTRAINT `toko_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transaksi_pembelian`
--

DROP TABLE IF EXISTS `transaksi_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaksi_pembelian` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pengguna_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nomor_transaksi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nomor_po` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal` datetime NOT NULL,
  `jatuh_tempo` date DEFAULT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `pajak_persen` decimal(5,2) DEFAULT '0.00',
  `pajak_nominal` decimal(15,2) DEFAULT '0.00',
  `total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','diterima','sebagian','selesai','batal') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `status_pembayaran` enum('belum_bayar','sebagian','lunas') COLLATE utf8mb4_unicode_ci DEFAULT 'belum_bayar',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomor_transaksi` (`nomor_transaksi`),
  KEY `idx_tenant_toko` (`tenant_id`,`toko_id`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_status` (`status`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_jatuh_tempo` (`jatuh_tempo`),
  KEY `idx_nomor` (`nomor_transaksi`),
  KEY `fk_pembelian_toko` (`toko_id`),
  KEY `fk_pembelian_pengguna` (`pengguna_id`),
  CONSTRAINT `fk_pembelian_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pembelian_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pembelian_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pembelian_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transaksi_penjualan`
--

DROP TABLE IF EXISTS `transaksi_penjualan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaksi_penjualan` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pengguna_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pelanggan_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nomor_transaksi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal` datetime NOT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `pajak_persen` decimal(5,2) DEFAULT '0.00',
  `pajak_nominal` decimal(15,2) DEFAULT '0.00',
  `total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `bayar` decimal(15,2) NOT NULL DEFAULT '0.00',
  `kembalian` decimal(15,2) DEFAULT '0.00',
  `metode_bayar` enum('tunai','transfer','kartu','kredit','poin') COLLATE utf8mb4_unicode_ci DEFAULT 'tunai',
  `status` enum('draft','selesai','batal','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomor_transaksi` (`nomor_transaksi`),
  KEY `idx_tenant_toko` (`tenant_id`,`toko_id`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_status` (`status`),
  KEY `idx_pelanggan` (`pelanggan_id`),
  KEY `idx_nomor` (`nomor_transaksi`),
  KEY `fk_penjualan_toko` (`toko_id`),
  KEY `fk_penjualan_pengguna` (`pengguna_id`),
  CONSTRAINT `fk_penjualan_pelanggan` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_penjualan_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_penjualan_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_penjualan_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `expires_at` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  UNIQUE KEY `refresh_token` (`refresh_token`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_token` (`session_token`),
  KEY `idx_sessions_expires` (`expires_at`),
  KEY `idx_sessions_active` (`is_active`),
  KEY `fk_user_sessions_toko` (`toko_id`),
  KEY `fk_user_sessions_tenant` (`tenant_id`),
  CONSTRAINT `fk_user_sessions_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_user_sessions_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peran_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('aktif','nonaktif','suspended','cuti') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `last_login` timestamp NULL DEFAULT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_users_tenant` (`tenant_id`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_username` (`username`),
  KEY `fk_users_peran` (`peran_id`),
  KEY `fk_users_toko` (`toko_id`),
  CONSTRAINT `fk_users_peran` FOREIGN KEY (`peran_id`) REFERENCES `peran` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_users_toko` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'kasir'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `cleanup_sessions` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`arkan`@`localhost`*/ /*!50106 EVENT `cleanup_sessions` ON SCHEDULE EVERY 1 HOUR STARTS '2025-09-11 16:31:08' ON COMPLETION NOT PRESERVE ENABLE DO CALL CleanupExpiredSessions() */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'kasir'
--
/*!50003 DROP PROCEDURE IF EXISTS `CleanupExpiredSessions` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`arkan`@`localhost` PROCEDURE `CleanupExpiredSessions`()
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-18  6:49:41
