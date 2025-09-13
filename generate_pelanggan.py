#!/usr/bin/env python3
"""
Script untuk generate data mock pelanggan sebanyak 300 record
Dengan foreign key yang valid dan data realistis
"""

import mysql.connector
import uuid
import random
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

# Data template untuk generate nama Indonesia
NAMA_DEPAN_PRIA = [
    'Ahmad', 'Budi', 'Dedi', 'Eko', 'Fajar', 'Gunawan', 'Hadi', 'Indra',
    'Joko', 'Kurnia', 'Lukman', 'Made', 'Nanda', 'Oki', 'Putra', 'Rizki',
    'Sandi', 'Toni', 'Umar', 'Vino', 'Wahyu', 'Yudi', 'Zaki', 'Agus',
    'Bayu', 'Candra', 'Dimas', 'Edi', 'Feri', 'Galih', 'Hendra', 'Ivan'
]

NAMA_DEPAN_WANITA = [
    'Ani', 'Bela', 'Citra', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hani',
    'Indah', 'Jihan', 'Kartika', 'Lina', 'Maya', 'Novi', 'Okta', 'Putri',
    'Rina', 'Sari', 'Tina', 'Umi', 'Vera', 'Wati', 'Yani', 'Zara',
    'Ayu', 'Bunga', 'Cinta', 'Diah', 'Elsa', 'Farah', 'Gina', 'Hesti'
]

NAMA_BELAKANG = [
    'Pratama', 'Wijaya', 'Santoso', 'Kurniawan', 'Sari', 'Utomo', 'Handoko',
    'Setiawan', 'Rahayu', 'Susanto', 'Wibowo', 'Lestari', 'Nugroho', 'Safitri',
    'Permana', 'Maharani', 'Saputra', 'Anggraini', 'Firmansyah', 'Puspitasari',
    'Hidayat', 'Kusumawati', 'Ramadhan', 'Oktaviani', 'Suryanto', 'Fitriani'
]

# Data kota Indonesia
KOTA_INDONESIA = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar',
    'Palembang', 'Tangerang', 'Depok', 'Bekasi', 'Bogor', 'Yogyakarta',
    'Malang', 'Solo', 'Balikpapan', 'Banjarmasin', 'Pontianak', 'Samarinda',
    'Denpasar', 'Mataram', 'Kupang', 'Jayapura', 'Manado', 'Palu'
]

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

# Data referensi untuk generate data realistis
PEKERJAAN_LIST = [
    'Pegawai Swasta', 'PNS', 'Wiraswasta', 'Guru', 'Dokter', 'Perawat',
    'Polisi', 'TNI', 'Petani', 'Pedagang', 'Supir', 'Tukang',
    'Mahasiswa', 'Ibu Rumah Tangga', 'Pensiunan', 'Buruh',
    'Karyawan Bank', 'Teknisi', 'Sales', 'Marketing'
]

TIPE_PELANGGAN = ['reguler', 'member', 'vip']
JENIS_KELAMIN = ['L', 'P']
STATUS_PELANGGAN = ['aktif', 'nonaktif', 'blacklist']

def generate_kode_pelanggan(index):
    """Generate kode pelanggan unik"""
    return f"PLG{str(index + 1).zfill(4)}"

def generate_nama_pelanggan(jenis_kelamin):
    """Generate nama pelanggan Indonesia berdasarkan jenis kelamin"""
    if jenis_kelamin == 'L':
        nama_depan = random.choice(NAMA_DEPAN_PRIA)
    else:
        nama_depan = random.choice(NAMA_DEPAN_WANITA)
    
    nama_belakang = random.choice(NAMA_BELAKANG)
    return f"{nama_depan} {nama_belakang}"

def generate_email(nama):
    """Generate email berdasarkan nama"""
    if random.choice([True, False, False]):  # 33% kemungkinan punya email
        nama_clean = nama.lower().replace(' ', '').replace('.', '')
        domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
        return f"{nama_clean}{random.randint(1, 999)}@{random.choice(domains)}"
    return None

def generate_telepon():
    """Generate nomor telepon Indonesia"""
    if random.choice([True, True, False]):  # 67% kemungkinan punya telepon
        prefixes = ['0812', '0813', '0821', '0822', '0851', '0852', '0856']
        return f"{random.choice(prefixes)}{random.randint(10000000, 99999999)}"
    return None

def generate_alamat():
    """Generate alamat Indonesia"""
    if random.choice([True, True, False]):  # 67% kemungkinan punya alamat
        jalan = f"Jl. {random.choice(['Merdeka', 'Sudirman', 'Thamrin', 'Gatot Subroto', 'Ahmad Yani', 'Diponegoro', 'Veteran', 'Pahlawan'])}"
        nomor = random.randint(1, 999)
        rt_rw = f"RT {random.randint(1, 15):02d}/RW {random.randint(1, 10):02d}"
        kelurahan = f"Kel. {random.choice(['Menteng', 'Kebayoran', 'Senayan', 'Kuningan', 'Kemang', 'Pondok Indah'])}"
        kota = random.choice(KOTA_INDONESIA)
        return f"{jalan} No. {nomor}, {rt_rw}, {kelurahan}, {kota}"
    return None

def generate_tanggal_lahir():
    """Generate tanggal lahir realistis"""
    if random.choice([True, False]):  # 50% kemungkinan punya tanggal lahir
        # Generate umur antara 17-70 tahun
        umur = random.randint(17, 70)
        tahun_lahir = datetime.now().year - umur
        bulan = random.randint(1, 12)
        hari = random.randint(1, 28)  # Gunakan 28 untuk menghindari masalah februari
        return datetime(tahun_lahir, bulan, hari).date()
    return None

def generate_diskon_persen(tipe):
    """Generate diskon berdasarkan tipe pelanggan"""
    if tipe == 'reguler':
        return round(random.uniform(0, 2), 2)
    elif tipe == 'member':
        return round(random.uniform(2, 5), 2)
    else:  # vip
        return round(random.uniform(5, 15), 2)

def generate_limit_kredit(tipe):
    """Generate limit kredit berdasarkan tipe pelanggan"""
    if tipe == 'reguler':
        return round(random.uniform(0, 1000000), 2)
    elif tipe == 'member':
        return round(random.uniform(500000, 5000000), 2)
    else:  # vip
        return round(random.uniform(2000000, 20000000), 2)

def generate_saldo_poin(tipe):
    """Generate saldo poin berdasarkan tipe pelanggan"""
    if tipe == 'reguler':
        return random.randint(0, 100)
    elif tipe == 'member':
        return random.randint(50, 500)
    else:  # vip
        return random.randint(200, 2000)

def generate_pelanggan_data(jumlah=300):
    """Generate data pelanggan"""
    pelanggan_list = []
    
    for i in range(jumlah):
        # Distribusi tipe pelanggan: 60% reguler, 30% member, 10% vip
        tipe = random.choices(TIPE_PELANGGAN, weights=[60, 30, 10])[0]
        
        # Distribusi status: 85% aktif, 10% nonaktif, 5% blacklist
        status = random.choices(STATUS_PELANGGAN, weights=[85, 10, 5])[0]
        
        # Generate jenis kelamin dulu
        jenis_kelamin = random.choice(JENIS_KELAMIN)
        nama = generate_nama_pelanggan(jenis_kelamin)
        
        pelanggan = {
            'id': str(uuid.uuid4()),
            'tenant_id': random.choice(TENANT_IDS),
            'toko_id': random.choice(TOKO_IDS),
            'kode': generate_kode_pelanggan(i),
            'nama': nama,
            'email': generate_email(nama),
            'telepon': generate_telepon(),
            'alamat': generate_alamat(),
            'tanggal_lahir': generate_tanggal_lahir(),
            'jenis_kelamin': jenis_kelamin,
            'pekerjaan': random.choice(PEKERJAAN_LIST) if random.choice([True, False]) else None,
            'tipe': tipe,
            'diskon_persen': generate_diskon_persen(tipe),
            'limit_kredit': generate_limit_kredit(tipe),
            'saldo_poin': generate_saldo_poin(tipe),
            'status': status
        }
        
        pelanggan_list.append(pelanggan)
    
    return pelanggan_list

def bulk_insert_pelanggan(pelanggan_list, batch_size=50):
    """Insert data pelanggan ke database dengan batch"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        insert_query = """
        INSERT INTO pelanggan (
            id, tenant_id, toko_id, kode, nama, email, telepon, alamat,
            tanggal_lahir, jenis_kelamin, pekerjaan, tipe, diskon_persen,
            limit_kredit, saldo_poin, status
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        """
        
        total_inserted = 0
        
        for i in range(0, len(pelanggan_list), batch_size):
            batch = pelanggan_list[i:i + batch_size]
            batch_data = []
            
            for pelanggan in batch:
                batch_data.append((
                    pelanggan['id'],
                    pelanggan['tenant_id'],
                    pelanggan['toko_id'],
                    pelanggan['kode'],
                    pelanggan['nama'],
                    pelanggan['email'],
                    pelanggan['telepon'],
                    pelanggan['alamat'],
                    pelanggan['tanggal_lahir'],
                    pelanggan['jenis_kelamin'],
                    pelanggan['pekerjaan'],
                    pelanggan['tipe'],
                    pelanggan['diskon_persen'],
                    pelanggan['limit_kredit'],
                    pelanggan['saldo_poin'],
                    pelanggan['status']
                ))
            
            cursor.executemany(insert_query, batch_data)
            conn.commit()
            
            batch_inserted = len(batch)
            total_inserted += batch_inserted
            print(f"Batch {i//batch_size + 1}: {batch_inserted} pelanggan berhasil ditambahkan")
        
        print(f"\nTotal {total_inserted} pelanggan berhasil ditambahkan ke database")
        
        # Tampilkan ringkasan data
        cursor.execute("""
            SELECT tipe, COUNT(*) as jumlah 
            FROM pelanggan 
            GROUP BY tipe 
            ORDER BY jumlah DESC
        """)
        
        print("\nRingkasan pelanggan per tipe:")
        for row in cursor.fetchall():
            print(f"- {row[0]}: {row[1]} pelanggan")
        
        cursor.execute("""
            SELECT status, COUNT(*) as jumlah 
            FROM pelanggan 
            GROUP BY status 
            ORDER BY jumlah DESC
        """)
        
        print("\nRingkasan pelanggan per status:")
        for row in cursor.fetchall():
            print(f"- {row[0]}: {row[1]} pelanggan")
        
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
        print("Koneksi database ditutup")

def main():
    """Fungsi utama"""
    print("Memulai generate data pelanggan...")
    
    # Generate data pelanggan
    pelanggan_data = generate_pelanggan_data(300)
    print(f"Berhasil generate {len(pelanggan_data)} data pelanggan")
    
    # Insert ke database
    bulk_insert_pelanggan(pelanggan_data)

if __name__ == "__main__":
    main()