#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk bulk insert data supplier ke database MySQL
Menggunakan batch insert untuk efisiensi
"""

import mysql.connector
import random
from datetime import datetime

# Konfigurasi database
DB_CONFIG = {
    'host': 'localhost',
    'user': 'arkan',
    'password': 'Arkan123!@#',
    'database': 'kasir',
    'ssl_disabled': True,
    'auth_plugin': 'mysql_native_password'
}

# Data template untuk generate supplier
NAMA_PERUSAHAAN = ['PT', 'CV', 'UD', 'Toko', 'Warung', 'Distributor', 'Supplier']
NAMA_USAHA = [
    'Maju Jaya', 'Berkah Sejahtera', 'Cahaya Terang', 'Sumber Rejeki',
    'Harapan Baru', 'Indah Karya', 'Sukses Mandiri', 'Bahagia Sentosa',
    'Aneka Ragam', 'Gemilang Utama', 'Harmoni Sejati', 'Jaya Abadi',
    'Fajar Harapan', 'Elang Mas', 'Damai Sejahtera', 'Cahaya Bintang',
    'Berkah Mulia', 'Indah Permai', 'Mitra Dagang', 'Sinar Terang',
    'Karya Mandiri', 'Bintang Terang', 'Rezeki Barokah', 'Surya Gemilang'
]

SUFFIX_USAHA = [
    'Makmur', 'Perkasa', 'Sentosa', 'Abadi', 'Mandiri', 'Sejahtera',
    'Gemilang', 'Utama', 'Jaya', 'Bersama', 'Baru', 'Indah', 'Prima'
]

NAMA_KONTAK = [
    'Budi Santoso', 'Siti Rahayu', 'Ahmad Wijaya', 'Dewi Lestari',
    'Eko Prasetyo', 'Rini Susanti', 'Agus Setiawan', 'Lina Marlina',
    'Bambang Hartono', 'Maya Sari', 'Andi Pratama', 'Sari Indah',
    'Dedi Kurniawan', 'Rina Wati', 'Hendra Gunawan', 'Lilis Suryani',
    'Yudi Hermawan', 'Wulan Dari', 'Tono Sugiarto', 'Fitri Handayani',
    'Joko Widodo', 'Sari Dewi', 'Andi Susanto', 'Rina Sari'
]

JALAN_JAKARTA = [
    'Jl. Sudirman', 'Jl. Thamrin', 'Jl. Gatot Subroto', 'Jl. Kuningan',
    'Jl. Rasuna Said', 'Jl. Casablanca', 'Jl. Senayan', 'Jl. Kemang',
    'Jl. Blok M', 'Jl. Pancoran', 'Jl. Tebet', 'Jl. Cikini',
    'Jl. Menteng', 'Jl. Salemba', 'Jl. Cempaka Putih', 'Jl. Kemayoran',
    'Jl. Kelapa Gading', 'Jl. Sunter', 'Jl. Pluit', 'Jl. Ancol'
]

BANK_NAMES = ['Bank BCA', 'Bank Mandiri', 'Bank BRI', 'Bank BNI', 'Bank CIMB']

def generate_supplier_batch(start_id, count):
    """
    Generate batch data supplier untuk insert
    """
    tenant_id = '550e8400-e29b-41d4-a716-446655440001'
    suppliers = []
    
    for i in range(count):
        # Generate nama perusahaan
        prefix = random.choice(NAMA_PERUSAHAAN)
        nama_usaha = random.choice(NAMA_USAHA)
        suffix = random.choice(SUFFIX_USAHA)
        nama_perusahaan = f"{prefix} {nama_usaha} {suffix}"
        
        # Generate kontak person
        kontak_person = random.choice(NAMA_KONTAK)
        
        # Generate telepon
        telepon = f"021-555{random.randint(1000, 9999)}"
        
        # Generate email
        email_prefix = nama_usaha.lower().replace(' ', '')
        email = f"{email_prefix}{i}@{email_prefix}.com"
        
        # Generate alamat
        jalan = random.choice(JALAN_JAKARTA)
        nomor = random.randint(10, 999)
        area = random.choice(['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur'])
        alamat = f"{jalan} No. {nomor}, {area}"
        
        # Generate NPWP
        npwp = f"01.234.567.8-{(start_id + i):03d}.000"
        
        # Generate bank info
        bank_nama = random.choice(BANK_NAMES)
        bank_rekening = f"{random.randint(1000000000, 9999999999)}"
        bank_atas_nama = nama_perusahaan
        
        # Status
        status = 'aktif'
        
        supplier_data = (
            tenant_id, nama_perusahaan, kontak_person, telepon, email,
            alamat, npwp, bank_nama, bank_rekening, bank_atas_nama, status
        )
        suppliers.append(supplier_data)
    
    return suppliers

def bulk_insert_suppliers():
    """
    Bulk insert suppliers ke database
    """
    conn = None
    cursor = None
    try:
        # Koneksi ke database
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Cek jumlah supplier yang sudah ada
        cursor.execute("SELECT COUNT(*) FROM supplier")
        current_count = cursor.fetchone()[0]
        print(f"Supplier saat ini: {current_count}")
        
        # Hitung berapa yang perlu ditambahkan
        target_count = 200
        remaining = target_count - current_count
        
        if remaining <= 0:
            print(f"Target {target_count} supplier sudah tercapai!")
            return
        
        print(f"Menambahkan {remaining} supplier...")
        
        # Generate data supplier
        suppliers = generate_supplier_batch(current_count + 1, remaining)
        
        # SQL insert statement
        insert_sql = """
        INSERT INTO supplier (tenant_id, nama, kontak_person, telepon, email, 
                            alamat, npwp, bank_nama, bank_rekening, bank_atas_nama, status) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Bulk insert dengan batch
        batch_size = 50
        total_inserted = 0
        
        for i in range(0, len(suppliers), batch_size):
            batch = suppliers[i:i + batch_size]
            cursor.executemany(insert_sql, batch)
            conn.commit()
            total_inserted += len(batch)
            print(f"Inserted batch {i//batch_size + 1}: {len(batch)} records")
        
        print(f"\nTotal supplier berhasil ditambahkan: {total_inserted}")
        
        # Verifikasi total
        cursor.execute("SELECT COUNT(*) FROM supplier")
        final_count = cursor.fetchone()[0]
        print(f"Total supplier sekarang: {final_count}")
        
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
    except Exception as err:
        print(f"General Error: {err}")
    finally:
        if conn and conn.is_connected():
            if cursor:
                cursor.close()
            conn.close()
            print("Koneksi database ditutup.")

if __name__ == '__main__':
    bulk_insert_suppliers()