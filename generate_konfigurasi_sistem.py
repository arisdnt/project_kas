#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Generate Data Mock Konfigurasi Sistem
Membuat data mock untuk tabel konfigurasi_sistem dengan 100 record
Tanpa menggunakan library eksternal seperti faker
"""

import mysql.connector
import random
import uuid
from datetime import datetime, timedelta

# Konfigurasi database
DB_CONFIG = {
    'host': 'localhost',
    'user': 'arkan',
    'password': 'Arkan123!@#',
    'database': 'kasir',
    'charset': 'utf8mb4',
    'ssl_disabled': True,
    'auth_plugin': 'mysql_native_password'
}

# Data referensi untuk foreign key
TENANT_IDS = [
    '550e8400-e29b-41d4-a716-446655440001',  # PT Maju Jaya
    '550e8400-e29b-41d4-a716-446655440002',  # CV Berkah Sejahtera
    '550e8400-e29b-41d4-a716-446655440003',  # UD Sumber Rezeki
    '7f69ce68-9068-11f0-8eff-00155d24a169'   # Default Tenant
]

TOKO_IDS = [
    '660e8400-e29b-41d4-a716-446655440001',  # Toko Maju Jaya Pusat
    '660e8400-e29b-41d4-a716-446655440002',  # Toko Maju Jaya Cabang
    '660e8400-e29b-41d4-a716-446655440003',  # Toko Berkah Sejahtera
    '660e8400-e29b-41d4-a716-446655440004',  # Toko Sumber Rezeki
    '7f6af52b-9068-11f0-8eff-00155d24a169'   # Toko Utama
]

# Template konfigurasi sistem untuk aplikasi kasir
KONFIGURASI_GLOBAL = [
    # Pengaturan Pajak
    {'kunci': 'pajak_ppn_persen', 'nilai': '11', 'tipe_data': 'number', 'is_public': True},
    {'kunci': 'pajak_termasuk_harga', 'nilai': 'false', 'tipe_data': 'boolean', 'is_public': True},
    {'kunci': 'pajak_otomatis', 'nilai': 'true', 'tipe_data': 'boolean', 'is_public': False},
    
    # Pengaturan Mata Uang
    {'kunci': 'mata_uang_kode', 'nilai': 'IDR', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'mata_uang_simbol', 'nilai': 'Rp', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'mata_uang_posisi', 'nilai': 'prefix', 'tipe_data': 'string', 'is_public': True},
    
    # Pengaturan Aplikasi
    {'kunci': 'nama_aplikasi', 'nilai': 'Kasir Pro', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'versi_aplikasi', 'nilai': '1.0.0', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'timezone', 'nilai': 'Asia/Jakarta', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'bahasa_default', 'nilai': 'id', 'tipe_data': 'string', 'is_public': True},
]

KONFIGURASI_TOKO = [
    # Pengaturan Printer
    {'kunci': 'printer_nama', 'nilai': 'EPSON TM-T82', 'tipe_data': 'string', 'is_public': False},
    {'kunci': 'printer_tipe', 'nilai': 'network', 'tipe_data': 'string', 'is_public': False},
    {'kunci': 'printer_ip', 'nilai': '192.168.1.100', 'tipe_data': 'string', 'is_public': False},
    {'kunci': 'printer_port', 'nilai': '9100', 'tipe_data': 'number', 'is_public': False},
    
    # Pengaturan Struk
    {'kunci': 'struk_header_1', 'nilai': 'SELAMAT DATANG', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'struk_header_2', 'nilai': 'Terima kasih atas kunjungan Anda', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'struk_footer_1', 'nilai': 'Barang yang sudah dibeli tidak dapat dikembalikan', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'struk_footer_2', 'nilai': 'Simpan struk sebagai bukti pembayaran', 'tipe_data': 'string', 'is_public': True},
    
    # Pengaturan Operasional
    {'kunci': 'jam_buka', 'nilai': '08:00', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'jam_tutup', 'nilai': '22:00', 'tipe_data': 'string', 'is_public': True},
    {'kunci': 'hari_libur', 'nilai': '["minggu"]', 'tipe_data': 'json', 'is_public': True},
    {'kunci': 'maksimal_diskon_persen', 'nilai': '50', 'tipe_data': 'number', 'is_public': False},
    {'kunci': 'minimal_transaksi', 'nilai': '1000', 'tipe_data': 'number', 'is_public': True},
    
    # Pengaturan Stok
    {'kunci': 'peringatan_stok_minimum', 'nilai': 'true', 'tipe_data': 'boolean', 'is_public': False},
    {'kunci': 'auto_kurangi_stok', 'nilai': 'true', 'tipe_data': 'boolean', 'is_public': False},
    {'kunci': 'izinkan_stok_negatif', 'nilai': 'false', 'tipe_data': 'boolean', 'is_public': False},
]

def generate_konfigurasi_data():
    """
    Generate data konfigurasi sistem dengan distribusi yang realistis
    """
    konfigurasi_list = []
    
    # Generate konfigurasi global (berlaku untuk semua tenant)
    for tenant_id in TENANT_IDS:
        for config in KONFIGURASI_GLOBAL:
            konfigurasi_data = {
                'id': str(uuid.uuid4()),
                'tenant_id': tenant_id,
                'toko_id': None,  # Konfigurasi global tidak terikat toko
                'kunci': config['kunci'],
                'nilai': config['nilai'],
                'tipe_data': config['tipe_data'],
                'is_public': config['is_public']
            }
            konfigurasi_list.append(konfigurasi_data)
    
    # Generate konfigurasi per toko
    for toko_id in TOKO_IDS:
        # Pilih tenant_id secara acak untuk toko ini
        tenant_id = random.choice(TENANT_IDS)
        
        for config in KONFIGURASI_TOKO:
            # Variasi nilai berdasarkan toko
            nilai = config['nilai']
            if config['kunci'] == 'printer_ip':
                # Generate IP printer yang berbeda untuk setiap toko
                nilai = f"192.168.1.{random.randint(100, 199)}"
            elif config['kunci'] == 'maksimal_diskon_persen':
                nilai = str(random.choice([10, 15, 20, 25, 30, 50]))
            elif config['kunci'] == 'minimal_transaksi':
                nilai = str(random.choice([500, 1000, 2000, 5000]))
            
            konfigurasi_data = {
                'id': str(uuid.uuid4()),
                'tenant_id': tenant_id,
                'toko_id': toko_id,
                'kunci': config['kunci'],
                'nilai': nilai,
                'tipe_data': config['tipe_data'],
                'is_public': config['is_public']
            }
            konfigurasi_list.append(konfigurasi_data)
    
    return konfigurasi_list

def bulk_insert_konfigurasi(konfigurasi_list):
    """
    Insert data konfigurasi ke database secara batch
    """
    try:
        # Koneksi ke database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print(f"Memulai insert {len(konfigurasi_list)} data konfigurasi sistem...")
        
        # Cek jumlah data yang sudah ada
        cursor.execute("SELECT COUNT(*) FROM konfigurasi_sistem")
        existing_count = cursor.fetchone()[0]
        print(f"Data konfigurasi yang sudah ada: {existing_count}")
        
        # Query insert
        insert_query = """
        INSERT INTO konfigurasi_sistem 
        (id, tenant_id, toko_id, kunci, nilai, tipe_data, is_public, dibuat_pada, diperbarui_pada)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Siapkan data untuk insert
        current_time = datetime.now()
        insert_data = []
        
        for config in konfigurasi_list:
            insert_data.append((
                config['id'],
                config['tenant_id'],
                config['toko_id'],
                config['kunci'],
                config['nilai'],
                config['tipe_data'],
                config['is_public'],
                current_time,
                current_time
            ))
        
        # Insert data dalam batch
        batch_size = 50
        total_inserted = 0
        
        for i in range(0, len(insert_data), batch_size):
            batch = insert_data[i:i + batch_size]
            cursor.executemany(insert_query, batch)
            connection.commit()
            total_inserted += len(batch)
            print(f"Batch {i//batch_size + 1}: {len(batch)} konfigurasi berhasil ditambahkan")
        
        # Verifikasi hasil
        cursor.execute("SELECT COUNT(*) FROM konfigurasi_sistem")
        final_count = cursor.fetchone()[0]
        
        print(f"\n=== RINGKASAN GENERATE KONFIGURASI SISTEM ===")
        print(f"Total konfigurasi berhasil ditambahkan: {total_inserted}")
        print(f"Total konfigurasi di database: {final_count}")
        
        # Tampilkan distribusi per tenant dan toko
        cursor.execute("""
        SELECT 
            CASE WHEN toko_id IS NULL THEN 'Global' ELSE 'Per Toko' END as scope,
            COUNT(*) as jumlah,
            COUNT(DISTINCT tenant_id) as jumlah_tenant,
            COUNT(DISTINCT toko_id) as jumlah_toko
        FROM konfigurasi_sistem 
        GROUP BY CASE WHEN toko_id IS NULL THEN 'Global' ELSE 'Per Toko' END
        """)
        
        distribusi = cursor.fetchall()
        print(f"\n=== DISTRIBUSI KONFIGURASI ===")
        for row in distribusi:
            scope, jumlah, tenant, toko = row
            print(f"{scope}: {jumlah} konfigurasi, {tenant} tenant, {toko or 0} toko")
        
        cursor.close()
        connection.close()
        print("\nKoneksi database ditutup.")
        
    except mysql.connector.Error as error:
        print(f"Error saat insert data: {error}")
        if connection.is_connected():
            connection.rollback()
            cursor.close()
            connection.close()

def main():
    """
    Fungsi utama untuk menjalankan generate data konfigurasi sistem
    """
    print("=== GENERATE DATA KONFIGURASI SISTEM ===")
    print("Membuat data mock untuk tabel konfigurasi_sistem...\n")
    
    # Generate data konfigurasi
    konfigurasi_list = generate_konfigurasi_data()
    
    print(f"Berhasil generate {len(konfigurasi_list)} data konfigurasi sistem")
    print(f"- Konfigurasi global: {len(KONFIGURASI_GLOBAL) * len(TENANT_IDS)}")
    print(f"- Konfigurasi per toko: {len(KONFIGURASI_TOKO) * len(TOKO_IDS)}")
    print(f"- Total tenant: {len(TENANT_IDS)}")
    print(f"- Total toko: {len(TOKO_IDS)}\n")
    
    # Insert ke database
    bulk_insert_konfigurasi(konfigurasi_list)

if __name__ == "__main__":
    main()