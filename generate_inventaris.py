#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk generate data inventaris dengan relasi ke produk
Untuk keperluan development dan testing aplikasi kasir
"""

import mysql.connector
import random
from decimal import Decimal
from datetime import datetime, timedelta

# Konfigurasi database
DB_CONFIG = {
    'host': 'localhost',
    'user': 'arkan',
    'password': 'Arkan123!@#',
    'database': 'kasir',
    'ssl_disabled': True,
    'auth_plugin': 'mysql_native_password'
}

def get_produk_data():
    """
    Ambil data produk dari database
    """
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Ambil data produk aktif
        cursor.execute("""
            SELECT id, kode, nama, harga_beli, satuan 
            FROM produk 
            WHERE is_aktif = 1 
            ORDER BY id
        """)
        produk_data = cursor.fetchall()
        
        return produk_data
        
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return []
    finally:
        if conn and conn.is_connected():
            if cursor:
                cursor.close()
            conn.close()

def generate_inventaris_data(count=100):
    """
    Generate data inventaris dalam jumlah besar
    """
    toko_id = '660e8400-e29b-41d4-a716-446655440001'  # Toko Maju Jaya Pusat
    produk_data = get_produk_data()
    
    if not produk_data:
        print("Error: Data produk tidak ditemukan")
        return []
    
    # Pilih produk secara random untuk inventaris
    selected_products = random.sample(produk_data, min(count, len(produk_data)))
    
    inventaris_list = []
    
    for i, (produk_id, kode_produk, nama_produk, harga_beli, satuan) in enumerate(selected_products):
        # Generate stok tersedia
        stok_tersedia = random.randint(10, 500)
        
        # Generate stok reserved (biasanya lebih kecil)
        stok_reserved = random.randint(0, min(50, stok_tersedia // 4))
        
        # Generate harga jual toko (markup dari harga beli)
        margin_persen = Decimal(random.randint(20, 100))
        harga_jual_toko = harga_beli + (harga_beli * margin_persen / 100)
        
        # Generate stok minimum toko
        stok_minimum_toko = random.randint(5, 50)
        
        # Generate lokasi rak
        lokasi_list = [
            'A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3',
            'D1', 'D2', 'DISPLAY-1', 'DISPLAY-2', 'GUDANG', 'FREEZER'
        ]
        lokasi_rak = random.choice(lokasi_list)
        
        inventaris_data = (
            produk_id, toko_id, stok_tersedia, stok_reserved,
            harga_jual_toko, stok_minimum_toko, lokasi_rak
        )
        inventaris_list.append(inventaris_data)
    
    return inventaris_list

def bulk_insert_inventaris():
    """
    Bulk insert inventaris ke database
    """
    conn = None
    cursor = None
    try:
        # Koneksi ke database
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Cek jumlah inventaris yang sudah ada
        cursor.execute("SELECT COUNT(*) FROM inventaris")
        current_count = cursor.fetchone()[0]
        print(f"Inventaris saat ini: {current_count}")
        
        # Hitung berapa yang perlu ditambahkan
        target_count = 100
        remaining = target_count - current_count
        
        if remaining <= 0:
            print(f"Target {target_count} inventaris sudah tercapai!")
            return
        
        print(f"Menambahkan {remaining} inventaris...")
        
        # Generate data inventaris
        inventaris_list = generate_inventaris_data(remaining)
        
        if not inventaris_list:
            print("Gagal generate data inventaris")
            return
        
        # SQL insert statement
        insert_sql = """
        INSERT INTO inventaris (produk_id, toko_id, stok_tersedia, stok_reserved,
                              harga_jual_toko, stok_minimum_toko, lokasi_rak) 
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        # Bulk insert dengan batch
        batch_size = 25
        total_inserted = 0
        
        for i in range(0, len(inventaris_list), batch_size):
            batch = inventaris_list[i:i + batch_size]
            cursor.executemany(insert_sql, batch)
            conn.commit()
            total_inserted += len(batch)
            print(f"Inserted batch {i//batch_size + 1}: {len(batch)} records")
        
        print(f"\nTotal inventaris berhasil ditambahkan: {total_inserted}")
        
        # Verifikasi total
        cursor.execute("SELECT COUNT(*) FROM inventaris")
        final_count = cursor.fetchone()[0]
        print(f"Total inventaris sekarang: {final_count}")
        
        # Tampilkan ringkasan stok per lokasi
        print("\nRingkasan inventaris per lokasi:")
        cursor.execute("""
            SELECT lokasi_rak, COUNT(*) as jumlah, SUM(stok_tersedia) as total_stok
            FROM inventaris 
            GROUP BY lokasi_rak
            ORDER BY total_stok DESC
        """)
        
        for lokasi, jumlah, total_stok in cursor.fetchall():
            print(f"- {lokasi}: {jumlah} item, total stok: {total_stok}")
        
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
    bulk_insert_inventaris()