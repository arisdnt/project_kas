#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk generate data kategori dengan sub-kategori
Untuk keperluan development dan testing aplikasi kasir
"""

import mysql.connector
import random

# Konfigurasi database
DB_CONFIG = {
    'host': 'localhost',
    'user': 'arkan',
    'password': 'Arkan123!@#',
    'database': 'kasir',
    'ssl_disabled': True,
    'auth_plugin': 'mysql_native_password'
}

# Data kategori dan sub-kategori
KATEGORI_DATA = {
    'Makanan & Minuman': [
        'Makanan Ringan', 'Minuman Ringan', 'Makanan Beku', 'Roti & Kue',
        'Susu & Produk Susu', 'Bumbu & Rempah', 'Mie Instan', 'Kopi & Teh',
        'Buah-buahan', 'Sayuran Segar', 'Daging & Ikan', 'Makanan Kaleng'
    ],
    'Elektronik': [
        'Smartphone & Tablet', 'Laptop & Komputer', 'Audio & Video',
        'Kamera & Fotografi', 'Aksesoris Elektronik', 'Peralatan Rumah',
        'Gaming & Konsol', 'Komponen Komputer', 'Charger & Kabel',
        'Speaker & Headphone', 'Smart Home', 'Elektronik Mobil'
    ],
    'Pakaian & Fashion': [
        'Pakaian Pria', 'Pakaian Wanita', 'Pakaian Anak', 'Sepatu Pria',
        'Sepatu Wanita', 'Tas & Dompet', 'Aksesoris Fashion', 'Jam Tangan',
        'Kacamata', 'Perhiasan', 'Pakaian Dalam', 'Pakaian Olahraga'
    ],
    'Kesehatan & Kecantikan': [
        'Perawatan Wajah', 'Perawatan Rambut', 'Makeup & Kosmetik',
        'Perawatan Tubuh', 'Obat-obatan', 'Vitamin & Suplemen',
        'Alat Kesehatan', 'Perawatan Bayi', 'Parfum & Deodoran',
        'Perawatan Gigi', 'Alat Cukur', 'Perawatan Kuku'
    ],
    'Rumah Tangga': [
        'Peralatan Dapur', 'Peralatan Makan', 'Pembersih Rumah',
        'Peralatan Kebersihan', 'Dekorasi Rumah', 'Furniture Kecil',
        'Lampu & Penerangan', 'Tekstil Rumah', 'Peralatan Cuci',
        'Organizer & Storage', 'Peralatan Taman', 'Keamanan Rumah'
    ],
    'Olahraga & Outdoor': [
        'Pakaian Olahraga', 'Sepatu Olahraga', 'Alat Fitness',
        'Olahraga Air', 'Camping & Hiking', 'Sepeda & Aksesoris',
        'Olahraga Bola', 'Olahraga Raket', 'Martial Arts',
        'Perlengkapan Gym', 'Outdoor Gear', 'Nutrisi Olahraga'
    ],
    'Buku & Alat Tulis': [
        'Buku Pelajaran', 'Novel & Fiksi', 'Buku Non-Fiksi', 'Komik & Manga',
        'Alat Tulis', 'Kertas & Buku Tulis', 'Perlengkapan Kantor',
        'Kalkulator', 'Penggaris & Jangka', 'Tas Sekolah',
        'Perlengkapan Seni', 'Buku Anak-anak'
    ],
    'Mainan & Hobi': [
        'Mainan Anak', 'Action Figure', 'Puzzle & Board Game',
        'Mainan Edukatif', 'Boneka & Plushie', 'Mainan Remote Control',
        'Model Kit', 'Koleksi & Hobi', 'Mainan Outdoor',
        'Mainan Bayi', 'Craft & DIY', 'Trading Cards'
    ],
    'Otomotif': [
        'Oli & Pelumas', 'Spare Part Motor', 'Spare Part Mobil',
        'Aksesoris Interior', 'Aksesoris Exterior', 'Perawatan Kendaraan',
        'Ban & Velg', 'Audio Mobil', 'GPS & Navigasi',
        'Helm & Safety Gear', 'Tools & Equipment', 'Car Care'
    ],
    'Pertanian & Kebun': [
        'Bibit & Benih', 'Pupuk & Nutrisi', 'Pestisida & Herbisida',
        'Alat Berkebun', 'Pot & Planter', 'Sistem Irigasi',
        'Peralatan Pertanian', 'Tanaman Hias', 'Tanaman Buah',
        'Sayuran & Herbs', 'Media Tanam', 'Greenhouse & Shade'
    ]
}

def get_parent_categories():
    """
    Ambil kategori parent dari database
    """
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, nama FROM kategori WHERE parent_id IS NULL")
        return cursor.fetchall()
        
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return []
    finally:
        if conn and conn.is_connected():
            if cursor:
                cursor.close()
            conn.close()

def generate_sub_categories():
    """
    Generate sub-kategori berdasarkan parent kategori
    """
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Ambil parent categories
        parent_categories = get_parent_categories()
        
        tenant_id = '550e8400-e29b-41d4-a716-446655440001'
        sub_categories = []
        urutan = 1
        
        for parent_id, parent_nama in parent_categories:
            if parent_nama in KATEGORI_DATA:
                sub_kategori_list = KATEGORI_DATA[parent_nama]
                
                for sub_nama in sub_kategori_list:
                    deskripsi = f"Sub-kategori {sub_nama} dari {parent_nama}"
                    icon_url = f"{sub_nama.lower().replace(' ', '-').replace('&', 'and')}-icon.svg"
                    
                    sub_category = (
                        tenant_id, sub_nama, deskripsi, parent_id,
                        icon_url, urutan, 'aktif'
                    )
                    sub_categories.append(sub_category)
                    urutan += 1
        
        # Insert sub-categories
        if sub_categories:
            insert_sql = """
            INSERT INTO kategori (tenant_id, nama, deskripsi, parent_id, 
                                icon_url, urutan, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.executemany(insert_sql, sub_categories)
            conn.commit()
            
            print(f"Berhasil menambahkan {len(sub_categories)} sub-kategori")
        
        # Cek total kategori
        cursor.execute("SELECT COUNT(*) FROM kategori")
        total_count = cursor.fetchone()[0]
        print(f"Total kategori sekarang: {total_count}")
        
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
    generate_sub_categories()