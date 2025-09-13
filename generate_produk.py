#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk generate data produk dengan relasi ke tabel referensi
Untuk keperluan development dan testing aplikasi kasir
"""

import mysql.connector
import random
from decimal import Decimal

# Konfigurasi database
DB_CONFIG = {
    'host': 'localhost',
    'user': 'arkan',
    'password': 'Arkan123!@#',
    'database': 'kasir',
    'ssl_disabled': True,
    'auth_plugin': 'mysql_native_password'
}

# Data template untuk generate produk
NAMA_PRODUK_ELEKTRONIK = [
    'Smartphone Android', 'iPhone Terbaru', 'Laptop Gaming', 'Tablet 10 inch',
    'Headphone Wireless', 'Speaker Bluetooth', 'Smartwatch', 'Power Bank',
    'Kamera Digital', 'Mouse Gaming', 'Keyboard Mechanical', 'Monitor LED',
    'Hard Drive External', 'Flash Drive USB', 'Charger Fast Charging'
]

NAMA_PRODUK_MAKANAN = [
    'Mie Instan Goreng', 'Biskuit Coklat', 'Kopi Sachet', 'Teh Celup',
    'Susu UHT', 'Yogurt Drink', 'Keripik Kentang', 'Permen Mint',
    'Coklat Batang', 'Wafer Vanilla', 'Jus Buah', 'Air Mineral',
    'Roti Tawar', 'Selai Strawberry', 'Madu Murni'
]

NAMA_PRODUK_FASHION = [
    'Kaos Polos', 'Kemeja Formal', 'Celana Jeans', 'Jaket Hoodie',
    'Sepatu Sneakers', 'Sandal Jepit', 'Tas Ransel', 'Dompet Kulit',
    'Jam Tangan Digital', 'Kacamata Hitam', 'Topi Baseball', 'Ikat Pinggang'
]

NAMA_PRODUK_KESEHATAN = [
    'Vitamin C', 'Masker Wajah', 'Sabun Mandi', 'Shampoo Anti Ketombe',
    'Pasta Gigi', 'Sikat Gigi', 'Hand Sanitizer', 'Lotion Pelembab',
    'Obat Batuk', 'Plester Luka', 'Termometer Digital', 'Kapas Steril'
]

SATUAN_PRODUK = ['pcs', 'box', 'pack', 'botol', 'tube', 'kg', 'gram', 'liter', 'ml']

def get_reference_data():
    """
    Ambil data referensi dari database
    """
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Ambil data kategori
        cursor.execute("SELECT id FROM kategori WHERE status = 'aktif'")
        kategori_ids = [row[0] for row in cursor.fetchall()]
        
        # Ambil data brand
        cursor.execute("SELECT id FROM brand WHERE status = 'aktif'")
        brand_ids = [row[0] for row in cursor.fetchall()]
        
        # Ambil data supplier
        cursor.execute("SELECT id FROM supplier WHERE status = 'aktif'")
        supplier_ids = [row[0] for row in cursor.fetchall()]
        
        return kategori_ids, brand_ids, supplier_ids
        
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return [], [], []
    finally:
        if conn and conn.is_connected():
            if cursor:
                cursor.close()
            conn.close()

def generate_produk_name(kategori_type):
    """
    Generate nama produk berdasarkan kategori
    """
    if 'elektronik' in kategori_type.lower():
        return random.choice(NAMA_PRODUK_ELEKTRONIK)
    elif 'makanan' in kategori_type.lower() or 'minuman' in kategori_type.lower():
        return random.choice(NAMA_PRODUK_MAKANAN)
    elif 'fashion' in kategori_type.lower() or 'pakaian' in kategori_type.lower():
        return random.choice(NAMA_PRODUK_FASHION)
    elif 'kesehatan' in kategori_type.lower() or 'kecantikan' in kategori_type.lower():
        return random.choice(NAMA_PRODUK_KESEHATAN)
    else:
        # Default random dari semua kategori
        all_products = (NAMA_PRODUK_ELEKTRONIK + NAMA_PRODUK_MAKANAN + 
                       NAMA_PRODUK_FASHION + NAMA_PRODUK_KESEHATAN)
        return random.choice(all_products)

def generate_produk_data(count=500):
    """
    Generate data produk dalam jumlah besar
    """
    tenant_id = '550e8400-e29b-41d4-a716-446655440001'
    kategori_ids, brand_ids, supplier_ids = get_reference_data()
    
    if not kategori_ids or not brand_ids or not supplier_ids:
        print("Error: Data referensi tidak lengkap")
        return []
    
    produk_list = []
    
    for i in range(count):
        # Pilih referensi secara random
        kategori_id = random.choice(kategori_ids)
        brand_id = random.choice(brand_ids)
        supplier_id = random.choice(supplier_ids)
        
        # Generate kode produk
        kode = f"PRD{i+1:05d}"
        
        # Generate barcode
        barcode = f"890{random.randint(1000000000, 9999999999)}"
        
        # Generate nama produk
        nama = generate_produk_name("general")
        nama_produk = f"{nama} - Model {random.choice(['A', 'B', 'C', 'X', 'Y', 'Z'])}{random.randint(1, 99)}"
        
        # Generate deskripsi
        deskripsi = f"Produk {nama_produk} berkualitas tinggi dengan fitur terdepan dan harga terjangkau"
        
        # Generate satuan
        satuan = random.choice(SATUAN_PRODUK)
        
        # Generate harga
        harga_beli = Decimal(random.randint(10000, 500000))
        margin_persen = Decimal(random.randint(20, 100))
        harga_jual = harga_beli + (harga_beli * margin_persen / 100)
        
        # Generate stok minimum
        stok_minimum = random.randint(5, 50)
        
        # Generate berat (dalam gram)
        berat = random.randint(50, 5000)
        
        # Generate dimensi (panjang x lebar x tinggi dalam cm)
        dimensi = f"{random.randint(5, 50)}x{random.randint(5, 50)}x{random.randint(2, 30)}"
        
        # Generate gambar URL
        gambar_url = f"products/{kode.lower()}-{nama.lower().replace(' ', '-')}.jpg"
        
        # Generate status
        is_aktif = random.choice([True, True, True, False])  # 75% aktif
        is_dijual_online = random.choice([True, False])
        
        # Generate pajak
        pajak_persen = Decimal(random.choice([0, 10, 11]))
        
        produk_data = (
            tenant_id, kategori_id, brand_id, supplier_id, kode, barcode,
            nama_produk, deskripsi, satuan, harga_beli, harga_jual,
            margin_persen, stok_minimum, berat, dimensi, gambar_url,
            is_aktif, is_dijual_online, pajak_persen
        )
        produk_list.append(produk_data)
    
    return produk_list

def bulk_insert_produk():
    """
    Bulk insert produk ke database
    """
    conn = None
    cursor = None
    try:
        # Koneksi ke database
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Cek jumlah produk yang sudah ada
        cursor.execute("SELECT COUNT(*) FROM produk")
        current_count = cursor.fetchone()[0]
        print(f"Produk saat ini: {current_count}")
        
        # Hitung berapa yang perlu ditambahkan
        target_count = 500
        remaining = target_count - current_count
        
        if remaining <= 0:
            print(f"Target {target_count} produk sudah tercapai!")
            return
        
        print(f"Menambahkan {remaining} produk...")
        
        # Generate data produk
        produk_list = generate_produk_data(remaining)
        
        if not produk_list:
            print("Gagal generate data produk")
            return
        
        # SQL insert statement
        insert_sql = """
        INSERT INTO produk (tenant_id, kategori_id, brand_id, supplier_id, 
                          kode, barcode, nama, deskripsi, satuan, harga_beli, 
                          harga_jual, margin_persen, stok_minimum, berat, 
                          dimensi, gambar_url, is_aktif, is_dijual_online, pajak_persen) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Bulk insert dengan batch
        batch_size = 50
        total_inserted = 0
        
        for i in range(0, len(produk_list), batch_size):
            batch = produk_list[i:i + batch_size]
            cursor.executemany(insert_sql, batch)
            conn.commit()
            total_inserted += len(batch)
            print(f"Inserted batch {i//batch_size + 1}: {len(batch)} records")
        
        print(f"\nTotal produk berhasil ditambahkan: {total_inserted}")
        
        # Verifikasi total
        cursor.execute("SELECT COUNT(*) FROM produk")
        final_count = cursor.fetchone()[0]
        print(f"Total produk sekarang: {final_count}")
        
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
    bulk_insert_produk()