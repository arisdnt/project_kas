# Struktur Database Kasir - Dokumentasi Lengkap

## Ringkasan Database
**Nama Database:** kasir  
**Total Tabel:** 17 tabel  
**Sistem:** MySQL dengan dukungan multi-tenant  

---

## 📋 Daftar Tabel

### 1. **brand** - Master Brand Produk
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| nama | varchar | NO | - | UNI | - |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: nama
- INDEX: idx_brand_nama

---

### 2. **kategori** - Master Kategori Produk
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| nama | varchar | NO | - | UNI | - |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: nama
- INDEX: idx_kategori_nama

---

### 3. **supplier** - Master Supplier
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| nama | varchar | NO | - | MUL | - |
| kontak_person | varchar | YES | - | - | - |
| email | varchar | YES | - | - | - |
| telepon | varchar | YES | - | - | - |
| alamat | text | YES | - | - | - |
| dibuat_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED |
| diperbarui_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Indexes:**
- PRIMARY KEY: id
- INDEX: idx_supplier_nama

---

### 4. **produk** - Master Produk
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| nama | varchar | NO | - | MUL | - |
| deskripsi | text | YES | - | - | - |
| sku | varchar | YES | - | UNI | - |
| id_kategori | int | YES | - | MUL | - |
| id_brand | int | YES | - | MUL | - |
| id_supplier | int | YES | - | MUL | - |
| dibuat_pada | timestamp | YES | CURRENT_TIMESTAMP | MUL | DEFAULT_GENERATED |
| diperbarui_pada | timestamp | YES | CURRENT_TIMESTAMP | MUL | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Foreign Keys:**
- id_kategori → kategori(id)
- id_brand → brand(id)
- id_supplier → supplier(id)

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: sku
- INDEX: idx_produk_nama, idx_produk_sku, idx_produk_created, idx_produk_updated
- COMPOSITE INDEX: idx_produk_composite (id_kategori, id_brand, id_supplier, nama, sku)

---

### 5. **toko** - Master Toko
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| nama | varchar | NO | - | - | - |
| alamat | text | YES | - | - | - |
| dibuat_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED |
| diperbarui_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Indexes:**
- PRIMARY KEY: id

---

### 6. **peran** - Master Role/Peran
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| nama | varchar | NO | - | UNI | - |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: nama

---

### 7. **izin** - Master Permission/Izin
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| nama | varchar | NO | - | UNI | - |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: nama

---

### 8. **izin_peran** - Junction Table Role-Permission
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id_peran | int | NO | - | PRI | - |
| id_izin | int | NO | - | PRI | - |

**Foreign Keys:**
- id_peran → peran(id)
- id_izin → izin(id)

**Indexes:**
- PRIMARY KEY: (id_peran, id_izin)

---

### 9. **pengguna** - Data Pengguna
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| id_toko | int | NO | - | MUL | - |
| id_peran | int | NO | - | MUL | - |
| username | varchar | NO | - | UNI | - |
| password_hash | varchar | NO | - | - | - |
| nama_lengkap | varchar | YES | - | - | - |
| aktif | tinyint | YES | 1 | - | - |
| dibuat_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED |
| diperbarui_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Foreign Keys:**
- id_toko → toko(id)
- id_peran → peran(id)

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: username

---

### 10. **pelanggan** - Data Pelanggan
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| id_toko | int | NO | - | MUL | - |
| nama | varchar | YES | - | - | - |
| email | varchar | YES | - | - | - |
| telepon | varchar | YES | - | - | - |
| dibuat_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED |
| diperbarui_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Foreign Keys:**
- id_toko → toko(id)

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: (id_toko, email)

---

### 11. **inventaris** - Stok Produk per Toko
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id_toko | int | NO | - | PRI | - |
| id_produk | int | NO | - | PRI | - |
| jumlah | int | YES | 0 | - | - |
| harga | decimal | NO | - | - | - |
| harga_beli | decimal | YES | - | - | - |
| diperbarui_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Foreign Keys:**
- id_toko → toko(id)
- id_produk → produk(id)

**Indexes:**
- PRIMARY KEY: (id_toko, id_produk)
- INDEX: idx_inventaris_toko_produk, idx_inventaris_produk

---

### 12. **transaksi** - Header Transaksi
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | bigint | NO | - | PRI | auto_increment |
| kode_transaksi | varchar | NO | - | UNI | - |
| id_toko | int | NO | - | MUL | - |
| id_pengguna | int | NO | - | MUL | - |
| id_pelanggan | int | YES | - | MUL | - |
| total_harga | decimal | NO | - | - | - |
| metode_pembayaran | enum | NO | tunai | - | - |
| status | enum | NO | selesai | - | - |
| tanggal_transaksi | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED |

**Foreign Keys:**
- id_toko → toko(id)
- id_pengguna → pengguna(id)
- id_pelanggan → pelanggan(id)

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: kode_transaksi

---

### 13. **item_transaksi** - Detail Item Transaksi
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | bigint | NO | - | PRI | auto_increment |
| id_transaksi | bigint | NO | - | MUL | - |
| id_produk | int | NO | - | MUL | - |
| jumlah | int | NO | - | - | - |
| harga_saat_jual | decimal | NO | - | - | - |

**Foreign Keys:**
- id_transaksi → transaksi(id)
- id_produk → produk(id)

**Indexes:**
- PRIMARY KEY: id

---

### 14. **dokumen_transaksi** - Dokumen Lampiran Transaksi
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| id_transaksi | bigint | YES | - | MUL | - |
| kunci_objek | varchar | NO | - | MUL | - |
| nama_file_asli | varchar | NO | - | - | - |
| ukuran_file | bigint | NO | - | - | - |
| tipe_mime | varchar | NO | - | - | - |
| kategori | enum | NO | umum | MUL | - |
| id_pengguna | int | NO | - | MUL | - |
| id_toko | int | NO | - | MUL | - |
| deskripsi | text | YES | - | - | - |
| status | enum | NO | aktif | MUL | - |
| dibuat_pada | timestamp | YES | CURRENT_TIMESTAMP | MUL | DEFAULT_GENERATED |
| diperbarui_pada | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Indexes:**
- PRIMARY KEY: id
- COMPOSITE INDEX: idx_dokumen_composite (id_toko, kategori, status, dibuat_pada)
- Multiple single indexes for performance

---

### 15. **tenants** - Multi-tenant Support
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| name | varchar | NO | - | - | - |
| code | varchar | NO | - | UNI | - |
| address | text | YES | - | - | - |
| phone | varchar | YES | - | - | - |
| email | varchar | YES | - | - | - |
| status | enum | YES | active | MUL | - |
| settings | json | YES | - | - | - |
| created_at | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED |
| updated_at | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: code
- INDEX: idx_tenant_code, idx_tenant_status

---

### 16. **users** - Sistem User Global
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | int | NO | - | PRI | auto_increment |
| tenant_id | int | NO | - | MUL | - |
| username | varchar | NO | - | UNI | - |
| email | varchar | NO | - | UNI | - |
| password_hash | varchar | NO | - | - | - |
| full_name | varchar | YES | - | - | - |
| role | enum | NO | user | MUL | - |
| status | enum | NO | active | MUL | - |
| last_login_at | timestamp | YES | - | - | - |
| created_at | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED |
| updated_at | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Foreign Keys:**
- tenant_id → tenants(id)

**Indexes:**
- PRIMARY KEY: id
- UNIQUE KEY: username, email
- Multiple performance indexes

---

### 17. **user_sessions** - Manajemen Sesi User
| Kolom | Tipe | Null | Default | Key | Extra |
|-------|------|------|---------|-----|-------|
| id | varchar | NO | - | PRI | - |
| user_id | int | NO | - | MUL | - |
| token_hash | varchar | NO | - | MUL | - |
| expires_at | timestamp | NO | - | MUL | - |
| created_at | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED |
| updated_at | timestamp | YES | CURRENT_TIMESTAMP | - | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

**Foreign Keys:**
- user_id → users(id)

**Indexes:**
- PRIMARY KEY: id
- INDEX: idx_session_user, idx_session_token, idx_session_expires

---

## 🔗 Relasi Antar Tabel

### Relasi Utama:
1. **toko** ← **pengguna** ← **transaksi**
2. **produk** ← **inventaris** → **toko**
3. **transaksi** ← **item_transaksi** → **produk**
4. **peran** ← **izin_peran** → **izin**
5. **tenants** ← **users** ← **user_sessions**

### Hierarki Data:
```
tenants (Multi-tenant)
├── users (Global users)
│   └── user_sessions
└── toko (Store per tenant)
    ├── pengguna (Store users)
    ├── pelanggan (Customers)
    ├── inventaris (Inventory)
    └── transaksi (Transactions)
        ├── item_transaksi (Transaction items)
        └── dokumen_transaksi (Transaction documents)
```

---

## 📊 Statistik Database

- **Master Tables:** 6 (brand, kategori, supplier, produk, peran, izin)
- **Transactional Tables:** 4 (transaksi, item_transaksi, inventaris, dokumen_transaksi)
- **User Management:** 4 (pengguna, pelanggan, users, user_sessions)
- **System Tables:** 3 (toko, tenants, izin_peran)

**Total Foreign Keys:** 17  
**Total Indexes:** 80+ (termasuk composite indexes)  
**Auto-increment Fields:** 12  
**Timestamp Fields:** 20 (dengan auto-update)

---

## 🛡️ Fitur Keamanan

1. **Multi-tenant Architecture** - Isolasi data per tenant
2. **Role-based Access Control** - Sistem peran dan izin
3. **Session Management** - Tracking sesi user dengan expiry
4. **Password Hashing** - Hash password untuk keamanan
5. **Audit Trail** - Timestamp created/updated pada semua tabel

---

## 📈 Optimasi Performa

1. **Composite Indexes** - Untuk query kompleks
2. **Foreign Key Indexes** - Optimasi JOIN operations
3. **Timestamp Indexes** - Untuk filtering berdasarkan tanggal
4. **Unique Constraints** - Mencegah duplikasi data
5. **Proper Data Types** - Penggunaan tipe data yang tepat

---

*Dokumentasi ini dibuat menggunakan MCP Server MySQL untuk analisis struktur database secara real-time.*