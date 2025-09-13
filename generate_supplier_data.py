#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk generate data supplier dalam jumlah besar
Untuk keperluan development dan testing aplikasi kasir
"""

import random
import string

# Data template untuk generate supplier
NAMA_PERUSAHAAN = [
    'PT', 'CV', 'UD', 'Toko', 'Warung', 'Distributor', 'Supplier'
]

NAMA_USAHA = [
    'Maju Jaya', 'Berkah Sejahtera', 'Cahaya Terang', 'Sumber Rejeki',
    'Harapan Baru', 'Indah Karya', 'Sukses Mandiri', 'Bahagia Sentosa',
    'Aneka Ragam', 'Gemilang Utama', 'Harmoni Sejati', 'Jaya Abadi',
    'Fajar Harapan', 'Elang Mas', 'Damai Sejahtera', 'Cahaya Bintang',
    'Berkah Mulia', 'Indah Permai', 'Mitra Dagang', 'Sinar Terang'
]

SUFFIX_USAHA = [
    'Makmur', 'Perkasa', 'Sentosa', 'Abadi', 'Mandiri', 'Sejahtera',
    'Gemilang', 'Utama', 'Jaya', 'Bersama', 'Baru', 'Indah'
]

NAMA_KONTAK = [
    'Budi Santoso', 'Siti Rahayu', 'Ahmad Wijaya', 'Dewi Lestari',
    'Eko Prasetyo', 'Rini Susanti', 'Agus Setiawan', 'Lina Marlina',
    'Bambang Hartono', 'Maya Sari', 'Andi Pratama', 'Sari Indah',
    'Dedi Kurniawan', 'Rina Wati', 'Hendra Gunawan', 'Lilis Suryani',
    'Yudi Hermawan', 'Wulan Dari', 'Tono Sugiarto', 'Fitri Handayani'
]

JALAN_JAKARTA = [
    'Jl. Sudirman', 'Jl. Thamrin', 'Jl. Gatot Subroto', 'Jl. Kuningan',
    'Jl. Rasuna Said', 'Jl. Casablanca', 'Jl. Senayan', 'Jl. Kemang',
    'Jl. Blok M', 'Jl. Pancoran', 'Jl. Tebet', 'Jl. Cikini',
    'Jl. Menteng', 'Jl. Salemba', 'Jl. Cempaka Putih', 'Jl. Kemayoran'
]

BANK_NAMES = ['Bank BCA', 'Bank Mandiri', 'Bank BRI', 'Bank BNI', 'Bank CIMB']

def generate_supplier_data(count=200):
    """
    Generate data supplier dalam format SQL INSERT
    """
    tenant_id = '550e8400-e29b-41d4-a716-446655440001'
    sql_values = []
    
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
        email = f"{email_prefix}@{email_prefix}.com"
        
        # Generate alamat
        jalan = random.choice(JALAN_JAKARTA)
        nomor = random.randint(10, 999)
        area = random.choice(['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara'])
        alamat = f"{jalan} No. {nomor}, {area}"
        
        # Generate NPWP
        npwp = f"01.234.567.8-{900 + i:03d}.000"
        
        # Generate bank info
        bank_nama = random.choice(BANK_NAMES)
        bank_rekening = f"{random.randint(1000000000, 9999999999)}"
        bank_atas_nama = nama_perusahaan
        
        # Status
        status = 'aktif'
        
        # Format SQL value
        sql_value = f"('{tenant_id}', '{nama_perusahaan}', '{kontak_person}', '{telepon}', '{email}', '{alamat}', '{npwp}', '{bank_nama}', '{bank_rekening}', '{bank_atas_nama}', '{status}')"
        sql_values.append(sql_value)
    
    return sql_values

if __name__ == '__main__':
    # Generate 185 supplier lagi (sudah ada 15)
    suppliers = generate_supplier_data(185)
    
    # Bagi menjadi batch untuk menghindari query terlalu panjang
    batch_size = 20
    batches = [suppliers[i:i + batch_size] for i in range(0, len(suppliers), batch_size)]
    
    print("-- Data Supplier (185 record tambahan)")
    for i, batch in enumerate(batches):
        print(f"\n-- Batch {i + 1}")
        print("INSERT INTO supplier (tenant_id, nama, kontak_person, telepon, email, alamat, npwp, bank_nama, bank_rekening, bank_atas_nama, status) VALUES")
        print(',\n'.join(batch) + ';')