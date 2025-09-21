# API Contracts - Sistem Kasir POS

## Overview
Dokumentasi lengkap kontrak API untuk sistem kasir yang terintegrasi dengan database schema. Semua endpoint mendukung multi-tenant dan validasi stok real-time.

## Base Response Format
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}
```

## Authentication
Semua endpoint memerlukan:
- Header: `Authorization: Bearer <jwt_token>`
- Header: `X-Kasir-Session: <session_id>` (untuk operasi cart)

---

## 1. Session Management

### POST /api/kasir/session
Membuat atau mendapatkan session kasir aktif.

**Response:**
```json
{
  "success": true,
  "message": "Session kasir berhasil dibuat",
  "data": {
    "session": {
      "id": "session_123",
      "user_id": "uuid",
      "toko_id": "uuid",
      "tenant_id": "uuid",
      "cart_items": [],
      "total_items": 0,
      "subtotal": 0,
      "total_akhir": 0,
      "dibuat_pada": "2024-01-01T00:00:00Z"
    },
    "socket_room": "kasir_tenant_store_user"
  }
}
```

---

## 2. Product Search & Barcode

### GET /api/kasir/produk/search
Pencarian produk dengan real-time stock info.

**Query Parameters:**
```typescript
{
  search?: string;      // Nama, kode, atau barcode
  kategori_id?: string; // Filter kategori
  brand_id?: string;    // Filter brand
  aktif_only?: boolean; // Default: true
  limit?: number;       // Default: 20
  offset?: number;      // Default: 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ditemukan 5 produk",
  "data": {
    "total": 5,
    "page": 1,
    "totalPages": 1,
    "products": [
      {
        "id": "uuid",
        "kode": "PRD001",
        "barcode": "123456789",
        "nama": "Produk A",
        "harga_jual": 15000,
        "pajak_persen": 11,
        "stok_tersedia": 100,
        "stok_reserved": 5,
        "stok_minimum": 10,
        "kategori": {
          "id": "uuid",
          "nama": "Kategori A"
        },
        "brand": {
          "id": "uuid",
          "nama": "Brand A"
        }
      }
    ]
  }
}
```

### GET /api/kasir/produk/scan/:barcode
Scan barcode produk dengan validasi stok.

**Response Success:**
```json
{
  "success": true,
  "message": "Produk ditemukan",
  "data": {
    "id": "uuid",
    "nama": "Produk A",
    "kode": "PRD001",
    "barcode": "123456789",
    "harga_jual": 15000,
    "pajak_persen": 11,
    "stok_tersedia": 95,
    "stok_reserved": 0
  }
}
```

**Response Stok Habis:**
```json
{
  "success": false,
  "message": "Produk tidak tersedia (stok habis)",
  "data": {
    "id": "uuid",
    "nama": "Produk A",
    "stok_tersedia": 0
  }
}
```

---

## 3. Cart Management

### POST /api/kasir/cart/add
Tambah item ke cart dengan validasi stok real-time.

**Request Body:**
```json
{
  "produk_id": "uuid",
  "kuantitas": 2,
  "harga_satuan": 15000,
  "diskon_persen": 0,
  "diskon_nominal": 0,
  "catatan": "Catatan optional"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item berhasil ditambahkan ke cart",
  "data": {
    "produk_id": "uuid",
    "nama_produk": "Produk A",
    "kode_produk": "PRD001",
    "barcode": "123456789",
    "harga_satuan": 15000,
    "kuantitas": 2,
    "subtotal": 30000,
    "diskon_persen": 0,
    "diskon_nominal": 0,
    "stok_tersedia": 93,
    "stok_reserved": 2
  }
}
```

### PUT /api/kasir/cart/:produkId
Update kuantitas item di cart.

**Request Body:**
```json
{
  "kuantitas": 3
}
```

### DELETE /api/kasir/cart/:produkId
Hapus item dari cart dan release stock reservation.

---

## 4. Customer & Promo

### GET /api/kasir/pelanggan?search=nama
Cari pelanggan dengan info loyalty.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "kode": "PEL001",
      "nama": "John Doe",
      "telepon": "081234567890",
      "tipe": "member",
      "diskon_persen": 5,
      "saldo_poin": 1500,
      "limit_kredit": 5000000
    }
  ]
}
```

### POST /api/kasir/pelanggan
Set pelanggan untuk transaksi.

**Request Body:**
```json
{
  "pelanggan_id": "uuid"
}
```

### GET /api/kasir/promo/validate/:kodePromo
Validasi kode promo dengan cart context.

**Query Parameters:**
```typescript
{
  subtotal: number;
  pelanggan_id?: string;
}
```

**Response:**
```json
{
  "success": true,
  "message": "Promo valid",
  "data": {
    "promo_id": "uuid",
    "nama": "Diskon 10%",
    "tipe_diskon": "persen",
    "nilai_diskon": 10,
    "diskon_nominal": 5000,
    "minimum_pembelian": 50000,
    "sisa_penggunaan": 45
  }
}
```

---

## 5. Transaction Processing

### POST /api/kasir/bayar
Proses pembayaran dengan validasi komprehensif.

**Request Body:**
```json
{
  "metode_bayar": "tunai",
  "jumlah_bayar": 100000,
  "cart_items": [
    {
      "produk_id": "uuid",
      "kuantitas": 2,
      "harga_satuan": 15000,
      "diskon_persen": 0,
      "diskon_nominal": 0
    }
  ],
  "pelanggan_id": "uuid",
  "diskon_persen": 0,
  "diskon_nominal": 0,
  "kode_promo": "DISKON10",
  "poin_digunakan": 100,
  "catatan": "Transaksi kasir"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Transaksi berhasil diproses",
  "data": {
    "transaksi": {
      "id": "uuid",
      "nomor_transaksi": "TKO-20240101-0001",
      "tanggal": "2024-01-01T10:00:00Z",
      "subtotal": 30000,
      "diskon_persen": 5,
      "diskon_nominal": 1500,
      "pajak_persen": 11,
      "pajak_nominal": 3135,
      "total": 31635,
      "bayar": 100000,
      "kembalian": 68365,
      "metode_bayar": "tunai",
      "status": "selesai",
      "pelanggan": {
        "id": "uuid",
        "nama": "John Doe",
        "tipe": "member"
      },
      "items": [
        {
          "id": "uuid",
          "produk_id": "uuid",
          "nama_produk": "Produk A",
          "kuantitas": 2,
          "harga_satuan": 15000,
          "subtotal": 30000
        }
      ]
    },
    "kembalian": 68365,
    "loyalty_update": {
      "poin_earned": 30,
      "poin_used": 100,
      "saldo_poin_baru": 1430
    },
    "promo_applied": {
      "kode": "DISKON10",
      "nama": "Diskon 10%",
      "diskon_nominal": 3000
    }
  }
}
```

**Response Error - Stok Tidak Cukup:**
```json
{
  "success": false,
  "message": "Stok Produk A tidak mencukupi. Tersedia: 1, Diminta: 2",
  "error": "INSUFFICIENT_STOCK"
}
```

**Response Error - Promo Invalid:**
```json
{
  "success": false,
  "message": "Minimum pembelian untuk promo ini adalah Rp 50.000",
  "error": "PROMO_MINIMUM_NOT_MET"
}
```

---

## 6. Transaction History

### GET /api/kasir/transaksi/:transaksiId
Detail transaksi dengan informasi lengkap.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nomor_transaksi": "TKO-20240101-0001",
    "tanggal": "2024-01-01T10:00:00Z",
    "subtotal": 30000,
    "total": 31635,
    "status": "selesai",
    "pelanggan": {
      "nama": "John Doe",
      "telepon": "081234567890"
    },
    "items": [...],
    "pembayaran": {
      "metode": "tunai",
      "jumlah": 100000,
      "kembalian": 68365
    }
  }
}
```

### GET /api/kasir/summary
Summary penjualan kasir hari ini.

**Response:**
```json
{
  "success": true,
  "data": {
    "tanggal": "2024-01-01",
    "total_transaksi": 25,
    "total_item_terjual": 150,
    "total_pendapatan": 2500000,
    "total_keuntungan": 500000,
    "metode_bayar": {
      "tunai": 1800000,
      "transfer": 500000,
      "kartu": 200000
    },
    "top_products": [
      {
        "nama": "Produk A",
        "kuantitas_terjual": 50,
        "total_pendapatan": 750000
      }
    ]
  }
}
```

---

## 7. Real-time Events (Socket.IO)

### Event: cart:item_added
```json
{
  "session_id": "session_123",
  "item": {
    "produk_id": "uuid",
    "nama_produk": "Produk A",
    "kuantitas": 2,
    "subtotal": 30000
  }
}
```

### Event: transaction:completed
```json
{
  "session_id": "session_123",
  "transaksi": {
    "id": "uuid",
    "nomor_transaksi": "TKO-20240101-0001",
    "total": 31635
  }
}
```

### Event: inventory:stock_updated
```json
{
  "produk_id": "uuid",
  "stok_tersedia": 95,
  "stok_reserved": 0
}
```

---

## Error Codes Reference

| Code | Message | Description |
|------|---------|-------------|
| `INSUFFICIENT_STOCK` | Stok tidak mencukupi | Stok produk habis atau tidak cukup |
| `PROMO_INVALID` | Promo tidak valid | Kode promo salah atau expired |
| `PROMO_MINIMUM_NOT_MET` | Minimum pembelian tidak terpenuhi | Subtotal kurang dari minimum promo |
| `CUSTOMER_NOT_FOUND` | Pelanggan tidak ditemukan | ID pelanggan tidak valid |
| `INSUFFICIENT_POINTS` | Saldo poin tidak mencukupi | Poin yang digunakan melebihi saldo |
| `CREDIT_LIMIT_EXCEEDED` | Limit kredit terlampaui | Total transaksi melebihi limit kredit |
| `PAYMENT_INSUFFICIENT` | Pembayaran tidak mencukupi | Jumlah bayar kurang dari total |

---

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per minute per tenant
- Special limit untuk barcode scanning: 200 per minute

## Caching Strategy
- Product data: 5 minutes TTL
- Customer data: 10 minutes TTL
- Promo validation: 1 minute TTL
- Stock info: Real-time (no cache)