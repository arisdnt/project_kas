#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk generate data brand dalam jumlah besar
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

# Data template untuk generate brand
BRAND_PREFIXES = [
    'Super', 'Ultra', 'Mega', 'Prime', 'Elite', 'Royal', 'Golden',
    'Silver', 'Diamond', 'Platinum', 'Premium', 'Deluxe', 'Supreme',
    'Master', 'Pro', 'Max', 'Plus', 'Star', 'Crown', 'King'
]

BRAND_NAMES = [
    'Tech', 'Smart', 'Digital', 'Modern', 'Classic', 'Fresh', 'Pure',
    'Natural', 'Organic', 'Eco', 'Green', 'Blue', 'Red', 'Gold',
    'Silver', 'Crystal', 'Pearl', 'Diamond', 'Ruby', 'Emerald',
    'Sapphire', 'Jade', 'Amber', 'Coral', 'Ivory', 'Onyx'
]

BRAND_SUFFIXES = [
    'Corp', 'Industries', 'Solutions', 'Systems', 'Products', 'Brands',
    'Group', 'International', 'Global', 'Worldwide', 'Enterprise',
    'Company', 'Manufacturing', 'Trading', 'Distribution', 'Supply'
]

# Brand terkenal untuk referensi
FAMOUS_BRANDS = [
    'Samsung', 'Apple', 'Sony', 'LG', 'Panasonic', 'Philips', 'Sharp',
    'Toshiba', 'Canon', 'Nikon', 'HP', 'Dell', 'Asus', 'Acer',
    'Lenovo', 'Microsoft', 'Intel', 'AMD', 'Nvidia', 'Logitech',
    'Nike', 'Adidas', 'Puma', 'Reebok', 'Converse', 'Vans',
    'Unilever', 'Procter & Gamble', 'Johnson & Johnson', 'Nestle',
    'Coca Cola', 'Pepsi', 'Danone', 'Kraft', 'Kelloggs', 'General Mills',
    'Toyota', 'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Mitsubishi',
    'Maybelline', 'Loreal', 'Revlon', 'MAC', 'Clinique', 'Estee Lauder'
]

# Brand lokal Indonesia
LOCAL_BRANDS = [
    'Indofood', 'Teh Botol Sosro', 'Aqua', 'Indomie', 'Sarimi',
    'ABC', 'Bango', 'Royco', 'Masako', 'Kecap Bango',
    'Polytron', 'Cosmos', 'Miyako', 'Sanken', 'Denpoo',
    'Wardah', 'Mustika Ratu', 'Sariayu', 'Emina', 'Pigeon',
    'Cussons', 'Lifebuoy', 'Lux', 'Dove', 'Sunsilk',
    'Garnier', 'Pantene', 'Head & Shoulders', 'Clear', 'TRESemme'
]

def generate_brand_name():
    """
    Generate nama brand yang unik
    """
    brand_type = random.choice(['famous', 'local', 'generated'])
    
    if brand_type == 'famous' and FAMOUS_BRANDS:
        return random.choice(FAMOUS_BRANDS)
    elif brand_type == 'local' and LOCAL_BRANDS:
        return random.choice(LOCAL_BRANDS)
    else:
        # Generate brand name
        if random.choice([True, False]):
            # Format: Prefix + Name
            prefix = random.choice(BRAND_PREFIXES)
            name = random.choice(BRAND_NAMES)
            return f"{prefix} {name}"
        else:
            # Format: Name + Suffix
            name = random.choice(BRAND_NAMES)
            suffix = random.choice(BRAND_SUFFIXES)
            return f"{name} {suffix}"

def generate_brand_data(count=300):
    """
    Generate data brand dalam jumlah besar
    """
    tenant_id = '550e8400-e29b-41d4-a716-446655440001'
    brands = []
    used_names = set()
    
    for i in range(count):
        # Generate nama brand yang unik
        attempts = 0
        while attempts < 10:
            nama_brand = generate_brand_name()
            if nama_brand not in used_names:
                used_names.add(nama_brand)
                break
            attempts += 1
        else:
            # Jika tidak bisa generate unik, tambahkan nomor
            nama_brand = f"{generate_brand_name()} {i+1}"
        
        # Generate deskripsi
        deskripsi = f"Brand {nama_brand} - Produk berkualitas tinggi dengan inovasi terdepan"
        
        # Generate logo URL
        logo_url = f"logos/{nama_brand.lower().replace(' ', '-').replace('&', 'and')}-logo.png"
        
        # Generate website
        website_name = nama_brand.lower().replace(' ', '').replace('&', 'and')
        website = f"https://www.{website_name}.com"
        
        # Status
        status = 'aktif'
        
        brand_data = (
            tenant_id, nama_brand, deskripsi, logo_url, website, status
        )
        brands.append(brand_data)
    
    return brands

def bulk_insert_brands():
    """
    Bulk insert brands ke database
    """
    conn = None
    cursor = None
    try:
        # Koneksi ke database
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Cek jumlah brand yang sudah ada
        cursor.execute("SELECT COUNT(*) FROM brand")
        current_count = cursor.fetchone()[0]
        print(f"Brand saat ini: {current_count}")
        
        # Hitung berapa yang perlu ditambahkan
        target_count = 300
        remaining = target_count - current_count
        
        if remaining <= 0:
            print(f"Target {target_count} brand sudah tercapai!")
            return
        
        print(f"Menambahkan {remaining} brand...")
        
        # Generate data brand
        brands = generate_brand_data(remaining)
        
        # SQL insert statement
        insert_sql = """
        INSERT INTO brand (tenant_id, nama, deskripsi, logo_url, website, status) 
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        # Bulk insert dengan batch
        batch_size = 50
        total_inserted = 0
        
        for i in range(0, len(brands), batch_size):
            batch = brands[i:i + batch_size]
            cursor.executemany(insert_sql, batch)
            conn.commit()
            total_inserted += len(batch)
            print(f"Inserted batch {i//batch_size + 1}: {len(batch)} records")
        
        print(f"\nTotal brand berhasil ditambahkan: {total_inserted}")
        
        # Verifikasi total
        cursor.execute("SELECT COUNT(*) FROM brand")
        final_count = cursor.fetchone()[0]
        print(f"Total brand sekarang: {final_count}")
        
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
    bulk_insert_brands()