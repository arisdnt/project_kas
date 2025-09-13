#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk generate data item transaksi dengan relasi ke produk dan transaksi
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

def get_reference_data():
    """
    Ambil data referensi dari database
    """
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Ambil data produk aktif
        cursor.execute("""
            SELECT id, nama, harga_jual, satuan 
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

def create_sample_transaksi():
    """
    Buat beberapa transaksi sampel untuk relasi item transaksi
    """
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Cek apakah sudah ada transaksi
        cursor.execute("SELECT COUNT(*) FROM transaksi")
        transaksi_count = cursor.fetchone()[0]
        
        if transaksi_count >= 200:
            print(f"Transaksi sudah ada: {transaksi_count}")
            return
        
        tenant_id = '550e8400-e29b-41d4-a716-446655440001'
        toko_id = '550e8400-e29b-41d4-a716-446655440002'
        pengguna_id = '550e8400-e29b-41d4-a716-446655440003'
        
        # Generate 200 transaksi sampel
        transaksi_list = []
        for i in range(200):
            nomor_transaksi = f"TRX{datetime.now().strftime('%Y%m%d')}{i+1:04d}"
            tanggal = datetime.now() - timedelta(days=random.randint(0, 30))
            tipe = 'penjualan'
            
            # Generate total transaksi
            subtotal = Decimal(random.randint(50000, 1000000))
            diskon_persen = Decimal(random.choice([0, 5, 10]))
            diskon_nominal = subtotal * diskon_persen / 100
            pajak_persen = Decimal('10.0')
            pajak_nominal = (subtotal - diskon_nominal) * pajak_persen / 100
            total = subtotal - diskon_nominal + pajak_nominal
            
            # Pembayaran
            bayar = total + Decimal(random.randint(0, 50000))
            kembalian = bayar - total
            
            # Status dan metode pembayaran
            status = random.choice(['selesai', 'selesai', 'selesai', 'pending'])
            metode_bayar = random.choice(['tunai', 'kartu', 'transfer', 'kredit'])
            
            transaksi_data = (
                tenant_id, toko_id, pengguna_id, nomor_transaksi, tipe, tanggal,
                subtotal, diskon_persen, diskon_nominal, pajak_persen, pajak_nominal,
                total, bayar, kembalian, metode_bayar, status
            )
            transaksi_list.append(transaksi_data)
        
        # Insert transaksi
        insert_sql = """
        INSERT INTO transaksi (tenant_id, toko_id, pengguna_id, nomor_transaksi, tipe, tanggal,
                             subtotal, diskon_persen, diskon_nominal, pajak_persen, pajak_nominal,
                             total, bayar, kembalian, metode_bayar, status) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.executemany(insert_sql, transaksi_list)
        conn.commit()
        print(f"Berhasil membuat {len(transaksi_list)} transaksi sampel")
        
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
    finally:
        if conn and conn.is_connected():
            if cursor:
                cursor.close()
            conn.close()

def get_transaksi_ids():
    """
    Ambil ID transaksi yang sudah ada
    """
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM transaksi ORDER BY id")
        transaksi_ids = [row[0] for row in cursor.fetchall()]
        
        return transaksi_ids
        
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return []
    finally:
        if conn and conn.is_connected():
            if cursor:
                cursor.close()
            conn.close()

def generate_item_transaksi_data(count=1000):
    """
    Generate data item transaksi dalam jumlah besar
    """
    produk_data = get_reference_data()
    transaksi_ids = get_transaksi_ids()
    
    if not produk_data or not transaksi_ids:
        print("Error: Data referensi tidak lengkap")
        return []
    
    item_list = []
    
    for i in range(count):
        # Pilih transaksi dan produk secara random
        transaksi_id = random.choice(transaksi_ids)
        produk_id, nama_produk, harga_jual, satuan = random.choice(produk_data)
        
        # Generate kuantitas
        kuantitas = random.randint(1, 10)
        
        # Harga satuan (bisa ada diskon)
        diskon_persen = random.choice([0, 0, 0, 5, 10, 15])  # Kebanyakan tanpa diskon
        harga_satuan = harga_jual
        diskon_nominal = harga_satuan * kuantitas * Decimal(diskon_persen) / 100
        
        # Hitung subtotal
        subtotal = (harga_satuan * kuantitas) - diskon_nominal
        
        # Generate catatan (opsional)
        catatan_list = [
            None, None, None,  # Kebanyakan tanpa catatan
            'Promo spesial', 'Diskon member', 'Paket bundling',
            'Cashback', 'Buy 1 Get 1', 'Flash sale'
        ]
        catatan = random.choice(catatan_list)
        
        item_data = (
            transaksi_id, produk_id, kuantitas, harga_satuan,
            diskon_persen, diskon_nominal, subtotal, catatan
        )
        item_list.append(item_data)
    
    return item_list

def bulk_insert_item_transaksi():
    """
    Bulk insert item transaksi ke database
    """
    conn = None
    cursor = None
    try:
        # Pastikan ada transaksi sampel
        create_sample_transaksi()
        
        # Koneksi ke database
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Cek jumlah item transaksi yang sudah ada
        cursor.execute("SELECT COUNT(*) FROM item_transaksi")
        current_count = cursor.fetchone()[0]
        print(f"Item transaksi saat ini: {current_count}")
        
        # Hitung berapa yang perlu ditambahkan
        target_count = 1000
        remaining = target_count - current_count
        
        if remaining <= 0:
            print(f"Target {target_count} item transaksi sudah tercapai!")
            return
        
        print(f"Menambahkan {remaining} item transaksi...")
        
        # Generate data item transaksi
        item_list = generate_item_transaksi_data(remaining)
        
        if not item_list:
            print("Gagal generate data item transaksi")
            return
        
        # SQL insert statement
        insert_sql = """
        INSERT INTO item_transaksi (transaksi_id, produk_id, kuantitas, 
                                  harga_satuan, diskon_persen, diskon_nominal, subtotal, catatan) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Bulk insert dengan batch
        batch_size = 100
        total_inserted = 0
        
        for i in range(0, len(item_list), batch_size):
            batch = item_list[i:i + batch_size]
            cursor.executemany(insert_sql, batch)
            conn.commit()
            total_inserted += len(batch)
            print(f"Inserted batch {i//batch_size + 1}: {len(batch)} records")
        
        print(f"\nTotal item transaksi berhasil ditambahkan: {total_inserted}")
        
        # Verifikasi total
        cursor.execute("SELECT COUNT(*) FROM item_transaksi")
        final_count = cursor.fetchone()[0]
        print(f"Total item transaksi sekarang: {final_count}")
        
        # Update subtotal di tabel transaksi berdasarkan item
        print("\nMengupdate subtotal di tabel transaksi...")
        cursor.execute("""
            UPDATE transaksi t 
            SET subtotal = (
                SELECT COALESCE(SUM(subtotal), 0) 
                FROM item_transaksi it 
                WHERE it.transaksi_id = t.id
            )
        """)
        conn.commit()
        print("Subtotal transaksi berhasil diupdate")
        
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
    bulk_insert_item_transaksi()