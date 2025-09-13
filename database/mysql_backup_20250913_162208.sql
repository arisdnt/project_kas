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
-- Current Database: `kasir`
--

/*!40000 DROP DATABASE IF EXISTS `kasir`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `kasir` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `kasir`;

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
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_log_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  CONSTRAINT `brand_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand`
--

LOCK TABLES `brand` WRITE;
/*!40000 ALTER TABLE `brand` DISABLE KEYS */;
INSERT INTO `brand` VALUES ('7f6cbd6d-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Generic','Brand umum untuk produk tanpa brand',NULL,NULL,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33'),('7f6cbeba-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','House Brand','Brand internal toko',NULL,NULL,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33');
/*!40000 ALTER TABLE `brand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dokumen_transaksi`
--

DROP TABLE IF EXISTS `dokumen_transaksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dokumen_transaksi` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `transaksi_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe_dokumen` enum('struk','invoice','nota','kwitansi','foto') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ukuran_file` bigint DEFAULT NULL,
  `path_minio` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_akses` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dokumen_transaksi` (`transaksi_id`),
  KEY `idx_dokumen_tipe` (`tipe_dokumen`),
  CONSTRAINT `dokumen_transaksi_ibfk_1` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dokumen_transaksi`
--

LOCK TABLES `dokumen_transaksi` WRITE;
/*!40000 ALTER TABLE `dokumen_transaksi` DISABLE KEYS */;
/*!40000 ALTER TABLE `dokumen_transaksi` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `inventaris`
--

LOCK TABLES `inventaris` WRITE;
/*!40000 ALTER TABLE `inventaris` DISABLE KEYS */;
INSERT INTO `inventaris` VALUES ('a8ed7f07-906f-11f0-8eff-00155d24a169','7f6af52b-9068-11f0-8eff-00155d24a169',75,0,NULL,0,NULL,'2025-09-13 07:40:22');
/*!40000 ALTER TABLE `inventaris` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_transaksi`
--

DROP TABLE IF EXISTS `item_transaksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_transaksi` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `transaksi_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `produk_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kuantitas` int NOT NULL DEFAULT '1',
  `harga_satuan` decimal(15,2) NOT NULL,
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `subtotal` decimal(15,2) NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_item_transaksi_transaksi` (`transaksi_id`),
  KEY `idx_item_transaksi_produk` (`produk_id`),
  CONSTRAINT `item_transaksi_ibfk_1` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi` (`id`) ON DELETE CASCADE,
  CONSTRAINT `item_transaksi_ibfk_2` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_transaksi`
--

LOCK TABLES `item_transaksi` WRITE;
/*!40000 ALTER TABLE `item_transaksi` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_transaksi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `izin`
--

DROP TABLE IF EXISTS `izin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `izin` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `modul` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aksi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_system_permission` tinyint(1) DEFAULT '0',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_izin_modul_aksi_resource` (`modul`,`aksi`,`resource`),
  KEY `idx_izin_modul` (`modul`),
  KEY `idx_izin_aksi` (`aksi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `izin`
--

LOCK TABLES `izin` WRITE;
/*!40000 ALTER TABLE `izin` DISABLE KEYS */;
INSERT INTO `izin` VALUES ('7f68c18d-9068-11f0-8eff-00155d24a169','Dashboard View','Melihat dashboard','dashboard','view','dashboard',1,'2025-09-13 06:11:33'),('7f68c622-9068-11f0-8eff-00155d24a169','User Management','Mengelola pengguna','users','manage','users',1,'2025-09-13 06:11:33'),('7f68c7d0-9068-11f0-8eff-00155d24a169','Store Management','Mengelola toko','stores','manage','stores',1,'2025-09-13 06:11:33'),('7f68c8b6-9068-11f0-8eff-00155d24a169','Product View','Melihat produk','products','view','products',1,'2025-09-13 06:11:33'),('7f68cef2-9068-11f0-8eff-00155d24a169','Product Manage','Mengelola produk','products','manage','products',1,'2025-09-13 06:11:33'),('7f68d049-9068-11f0-8eff-00155d24a169','Transaction View','Melihat transaksi','transactions','view','transactions',1,'2025-09-13 06:11:33'),('7f68d0e7-9068-11f0-8eff-00155d24a169','Transaction Create','Membuat transaksi','transactions','create','transactions',1,'2025-09-13 06:11:33'),('7f68d17b-9068-11f0-8eff-00155d24a169','Transaction Manage','Mengelola transaksi','transactions','manage','transactions',1,'2025-09-13 06:11:33'),('7f68d217-9068-11f0-8eff-00155d24a169','Inventory View','Melihat inventaris','inventory','view','inventory',1,'2025-09-13 06:11:33'),('7f68d2c4-9068-11f0-8eff-00155d24a169','Inventory Manage','Mengelola inventaris','inventory','manage','inventory',1,'2025-09-13 06:11:33'),('7f68d37b-9068-11f0-8eff-00155d24a169','Report View','Melihat laporan','reports','view','reports',1,'2025-09-13 06:11:33'),('7f68d411-9068-11f0-8eff-00155d24a169','Report Generate','Generate laporan','reports','generate','reports',1,'2025-09-13 06:11:33'),('7f68d58c-9068-11f0-8eff-00155d24a169','Settings Manage','Mengelola pengaturan','settings','manage','settings',1,'2025-09-13 06:11:33');
/*!40000 ALTER TABLE `izin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `izin_peran`
--

DROP TABLE IF EXISTS `izin_peran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `izin_peran` (
  `peran_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `izin_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`peran_id`,`izin_id`),
  KEY `izin_id` (`izin_id`),
  CONSTRAINT `izin_peran_ibfk_1` FOREIGN KEY (`peran_id`) REFERENCES `peran` (`id`) ON DELETE CASCADE,
  CONSTRAINT `izin_peran_ibfk_2` FOREIGN KEY (`izin_id`) REFERENCES `izin` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `izin_peran`
--

LOCK TABLES `izin_peran` WRITE;
/*!40000 ALTER TABLE `izin_peran` DISABLE KEYS */;
INSERT INTO `izin_peran` VALUES ('7f6b9700-9068-11f0-8eff-00155d24a169','7f68c18d-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68c622-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68c7d0-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68c8b6-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68cef2-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68d049-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68d0e7-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68d17b-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68d217-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68d2c4-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68d37b-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68d411-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06'),('7f6b9700-9068-11f0-8eff-00155d24a169','7f68d58c-9068-11f0-8eff-00155d24a169','2025-09-13 06:18:06');
/*!40000 ALTER TABLE `izin_peran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kategori`
--

DROP TABLE IF EXISTS `kategori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategori` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `parent_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `urutan` int DEFAULT '0',
  `status` enum('aktif','nonaktif') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kategori_tenant` (`tenant_id`),
  KEY `idx_kategori_parent` (`parent_id`),
  KEY `idx_kategori_status` (`status`),
  CONSTRAINT `kategori_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `kategori_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `kategori` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategori`
--

LOCK TABLES `kategori` WRITE;
/*!40000 ALTER TABLE `kategori` DISABLE KEYS */;
INSERT INTO `kategori` VALUES ('7f6c3bd6-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Makanan','Kategori produk makanan',NULL,NULL,0,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33'),('7f6c3ddf-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Minuman','Kategori produk minuman',NULL,NULL,0,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33'),('7f6c3f2d-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Elektronik','Kategori produk elektronik',NULL,NULL,0,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33'),('7f6c3fdc-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Fashion','Kategori produk fashion',NULL,NULL,0,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33');
/*!40000 ALTER TABLE `kategori` ENABLE KEYS */;
UNLOCK TABLES;

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
  `kunci` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nilai` text COLLATE utf8mb4_unicode_ci,
  `tipe_data` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `is_public` tinyint(1) DEFAULT '0',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_tenant_toko_kunci` (`tenant_id`,`toko_id`,`kunci`),
  KEY `idx_config_tenant` (`tenant_id`),
  KEY `idx_config_toko` (`toko_id`),
  KEY `idx_config_kunci` (`kunci`),
  CONSTRAINT `konfigurasi_sistem_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `konfigurasi_sistem_ibfk_2` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `konfigurasi_sistem`
--

LOCK TABLES `konfigurasi_sistem` WRITE;
/*!40000 ALTER TABLE `konfigurasi_sistem` DISABLE KEYS */;
/*!40000 ALTER TABLE `konfigurasi_sistem` ENABLE KEYS */;
UNLOCK TABLES;

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
  CONSTRAINT `pelanggan_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pelanggan_ibfk_2` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pelanggan`
--

LOCK TABLES `pelanggan` WRITE;
/*!40000 ALTER TABLE `pelanggan` DISABLE KEYS */;
/*!40000 ALTER TABLE `pelanggan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengguna`
--

DROP TABLE IF EXISTS `pengguna`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengguna` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `peran_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telepon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('L','P') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('aktif','nonaktif','cuti') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `gaji_pokok` decimal(15,2) DEFAULT '0.00',
  `komisi_persen` decimal(5,2) DEFAULT '0.00',
  `tanggal_masuk` date DEFAULT NULL,
  `tanggal_keluar` date DEFAULT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_pengguna_tenant` (`tenant_id`),
  KEY `idx_pengguna_toko` (`toko_id`),
  KEY `idx_pengguna_peran` (`peran_id`),
  KEY `idx_pengguna_status` (`status`),
  CONSTRAINT `pengguna_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pengguna_ibfk_2` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pengguna_ibfk_3` FOREIGN KEY (`peran_id`) REFERENCES `peran` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `pengguna_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengguna`
--

LOCK TABLES `pengguna` WRITE;
/*!40000 ALTER TABLE `pengguna` DISABLE KEYS */;
/*!40000 ALTER TABLE `pengguna` ENABLE KEYS */;
UNLOCK TABLES;

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
  `is_system_role` tinyint(1) DEFAULT '0',
  `status` enum('aktif','nonaktif') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_peran_tenant` (`tenant_id`),
  KEY `idx_peran_level` (`level`),
  KEY `idx_peran_status` (`status`),
  CONSTRAINT `peran_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `peran`
--

LOCK TABLES `peran` WRITE;
/*!40000 ALTER TABLE `peran` DISABLE KEYS */;
INSERT INTO `peran` VALUES ('7f6b9700-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Super Admin','Administrator sistem dengan akses penuh',1,1,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33'),('7f6b9875-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Admin Toko','Administrator toko dengan akses manajemen',2,1,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33'),('7f6b99cd-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Kasir','Kasir dengan akses transaksi',3,1,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33'),('7f6b9a7e-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Staff','Staff dengan akses terbatas',4,1,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33');
/*!40000 ALTER TABLE `peran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produk`
--

DROP TABLE IF EXISTS `produk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produk` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  CONSTRAINT `produk_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `produk_ibfk_2` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `produk_ibfk_3` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `produk_ibfk_4` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produk`
--

LOCK TABLES `produk` WRITE;
/*!40000 ALTER TABLE `produk` DISABLE KEYS */;
INSERT INTO `produk` VALUES ('a8ed7f07-906f-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','7f6c3bd6-9068-11f0-8eff-00155d24a169','7f6cbd6d-9068-11f0-8eff-00155d24a169','7f6d5025-9068-11f0-8eff-00155d24a169','PRD-1757746969837',NULL,'Test Produk Updated',NULL,'box',12000.00,18000.00,0.00,0,0.00,NULL,NULL,1,0,0.00,'2025-09-13 07:02:49','2025-09-13 07:08:57');
/*!40000 ALTER TABLE `produk` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  CONSTRAINT `supplier_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES ('7f6d5025-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Supplier Umum','Admin Supplier','081234567890','supplier@kasir.com','Jakarta',NULL,NULL,NULL,NULL,'aktif','2025-09-13 06:11:33','2025-09-13 06:11:33');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('7f69ce68-9068-11f0-8eff-00155d24a169','Default Tenant','admin@kasir.com','081234567890','Jakarta, Indonesia','aktif','enterprise',10,50,'2025-09-13 06:11:33','2025-09-13 06:11:33');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `toko`
--

LOCK TABLES `toko` WRITE;
/*!40000 ALTER TABLE `toko` DISABLE KEYS */;
INSERT INTO `toko` VALUES ('7f6af52b-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','Toko Utama','TK001','Jakarta Pusat','021-1234567','toko@kasir.com','aktif','Asia/Jakarta','IDR',NULL,'2025-09-13 06:11:33','2025-09-13 06:11:33');
/*!40000 ALTER TABLE `toko` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaksi`
--

DROP TABLE IF EXISTS `transaksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaksi` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toko_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pengguna_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pelanggan_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nomor_transaksi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe` enum('penjualan','pembelian','retur_jual','retur_beli') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal` datetime NOT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `diskon_persen` decimal(5,2) DEFAULT '0.00',
  `diskon_nominal` decimal(15,2) DEFAULT '0.00',
  `pajak_persen` decimal(5,2) DEFAULT '0.00',
  `pajak_nominal` decimal(15,2) DEFAULT '0.00',
  `total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `bayar` decimal(15,2) DEFAULT '0.00',
  `kembalian` decimal(15,2) DEFAULT '0.00',
  `metode_bayar` enum('tunai','transfer','kartu','kredit','poin') COLLATE utf8mb4_unicode_ci DEFAULT 'tunai',
  `status` enum('draft','selesai','batal','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `referensi_transaksi` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomor_transaksi` (`nomor_transaksi`),
  KEY `referensi_transaksi` (`referensi_transaksi`),
  KEY `idx_transaksi_tenant` (`tenant_id`),
  KEY `idx_transaksi_toko` (`toko_id`),
  KEY `idx_transaksi_pengguna` (`pengguna_id`),
  KEY `idx_transaksi_pelanggan` (`pelanggan_id`),
  KEY `idx_transaksi_nomor` (`nomor_transaksi`),
  KEY `idx_transaksi_tipe` (`tipe`),
  KEY `idx_transaksi_tanggal` (`tanggal`),
  KEY `idx_transaksi_status` (`status`),
  CONSTRAINT `transaksi_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transaksi_ibfk_2` FOREIGN KEY (`toko_id`) REFERENCES `toko` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transaksi_ibfk_3` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `transaksi_ibfk_4` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transaksi_ibfk_5` FOREIGN KEY (`referensi_transaksi`) REFERENCES `transaksi` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaksi`
--

LOCK TABLES `transaksi` WRITE;
/*!40000 ALTER TABLE `transaksi` DISABLE KEYS */;
/*!40000 ALTER TABLE `transaksi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_lengkap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telepon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('aktif','nonaktif','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `is_super_admin` tinyint(1) DEFAULT '0',
  `last_login` timestamp NULL DEFAULT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `diperbarui_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_tenant` (`tenant_id`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_username` (`username`),
  KEY `idx_users_email` (`email`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('7f6a7716-9068-11f0-8eff-00155d24a169','7f69ce68-9068-11f0-8eff-00155d24a169','admin','admin@kasir.com','$2b$10$DOCoh8UYGm.wQ7Wwlkaum.gWo3/QgfOGKw/p6K9WbyIpMAoz04AX.','Super Administrator',NULL,NULL,'aktif',1,'2025-09-13 09:00:57','2025-09-13 06:11:33','2025-09-13 09:00:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

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

-- Dump completed on 2025-09-13 16:22:08
