# Kasir API - Point of Sales Backend System

Backend API komprehensif untuk sistem Point of Sales (POS) modern dengan dukungan real-time, multi-tenant, dan manajemen inventori terintegrasi.

## 🌟 Fitur Utama

### ✅ **Multi-tenant & Store Isolation**
- Setiap operasi kasir terisolasi berdasarkan tenant dan toko
- Automatic access scope enforcement
- Multi-store support untuk franchise/chain stores

### ✅ **Real-time Operations**
- Socket.IO untuk update real-time
- Live inventory tracking
- Multi-device synchronization
- Real-time cart updates

### ✅ **Modern POS Features**
- Barcode scanning support
- Customer management integration
- Discount & promotion system
- Multiple payment methods
- Receipt generation ready
- Offline-mode support (frontend)

### ✅ **Inventory Management**
- Real-time stock tracking
- Stock reservation system
- Low stock alerts
- Automatic stock updates after transactions

### ✅ **Security & Performance**
- JWT-based authentication
- Role-based permissions (RBAC)
- Rate limiting
- Input validation with Zod
- Database transaction safety

---

## 🔧 API Endpoints

### **Base URL**: `/api/kasir`

### 🏥 **Health & Session Management**

#### `GET /health`
Status check untuk kasir system
- **Auth**: Required (kasir/admin permission)
- **Response**: System health status

#### `GET /session`
Membuat atau mendapatkan session kasir aktif
- **Auth**: Required (kasir permission)
- **Response**: `KasirSession` object + Socket.IO room ID

#### `GET /summary`
Summary penjualan kasir hari ini
- **Auth**: Required (transaction read)
- **Response**: `SummaryKasir` dengan total transaksi, pendapatan, breakdown per jam

---

### 🔍 **Product Operations**

#### `GET /produk/search`
Pencarian produk dengan inventory real-time

**Query Parameters:**
```typescript
{
  query?: string;           // Nama, kode, atau barcode
  kategori_id?: UUID;       // Filter kategori
  brand_id?: UUID;          // Filter brand
  barcode?: string;         // Exact barcode match
  stok_minimum?: boolean;   // Filter stok <= minimum
  aktif_only?: boolean;     // Default: true
  limit?: number;           // Default: 20, max: 100
  offset?: number;          // Default: 0
}
```

**Response:**
```typescript
{
  products: ProdukKasir[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}
```

#### `POST /produk/scan`
Scan barcode produk untuk kasir

**Request Body:**
```typescript
{
  barcode: string;          // Required
  kuantitas?: number;       // Default: 1
}
```

**Response:**
- `200`: `ProdukKasir` dengan stock info
- `404`: Barcode tidak ditemukan
- `400`: Produk stok habis

---

### 🛒 **Cart Operations**

#### `POST /cart/add`
Tambah item ke cart kasir

**Headers:**
- `x-kasir-session`: string (optional, auto-generated)

**Request Body:**
```typescript
{
  produk_id: UUID;          // Required
  kuantitas: number;        // 1-1000
  harga_satuan?: number;    // Override harga default
  diskon_persen?: number;   // 0-100%
  diskon_nominal?: number;  // >= 0
  catatan?: string;         // Max 255 chars
}
```

**Response:** `KasirCartItem`
**Real-time:** Emit `cart:item_added` event

#### `PUT /cart/:produkId`
Update item di cart

**Request Body:**
```typescript
{
  kuantitas: number;        // 0 untuk hapus item
  diskon_persen?: number;
  diskon_nominal?: number;
  catatan?: string;
}
```

**Real-time:** Emit `cart:item_updated` atau `cart:item_removed`

#### `DELETE /cart/:produkId`
Hapus item dari cart

**Real-time:** Emit `cart:item_removed` event

#### `DELETE /cart`
Kosongkan seluruh cart

**Real-time:** Emit `cart:cleared` event

---

### 👤 **Customer Operations**

#### `POST /pelanggan`
Set pelanggan untuk transaksi

**Request Body:**
```typescript
{
  pelanggan_id?: UUID;      // null untuk remove
  kode_pelanggan?: string;  // Alternative selection
}
```

**Response:** `PelangganKasir` dengan diskon info

---

### 💳 **Transaction Processing**

#### `POST /bayar`
Proses pembayaran dan selesaikan transaksi

**Headers:**
- `x-kasir-session`: string (required)

**Request Body:**
```typescript
{
  metode_bayar: 'tunai' | 'transfer' | 'kartu' | 'kredit' | 'poin';
  jumlah_bayar: number;
  cart_items: KasirCartItem[];
  pelanggan_id?: UUID;
  diskon_persen?: number;
  diskon_nominal?: number;
  catatan?: string;
}
```

**Response:** `TransaksiPenjualanData` dengan nomor transaksi

**Real-time Events:**
- `transaction:completed` - Data transaksi selesai
- `inventory:stock_updated` - Update stok untuk setiap produk
- `cart:cleared` - Reset session cart

**Database Operations:**
- Insert `transaksi_penjualan` & `item_transaksi_penjualan`
- Update stok inventari (reduce available, release reserved)
- Generate nomor transaksi otomatis
- Clear cart session

#### `GET /transaksi/:transaksiId`
Get detail transaksi by ID

**Response:** `TransaksiPenjualanData` lengkap dengan items

---

## 🔄 Real-time Events (Socket.IO)

### **Namespace**: `/kasir` (optional, atau main namespace)

### Client Events (From Client)

#### `kasir:join_room`
Join kasir room untuk real-time updates
```typescript
{
  user_id: string;
  tenant_id: string;
  store_id: string;
  session_id?: string;
}
```

#### `kasir:barcode_scanned`
Broadcast scan barcode ke device lain
```typescript
{
  barcode: string;
  session_id: string;
}
```

#### `kasir:toggle_offline`
Toggle mode offline untuk kasir
```typescript
{
  enabled: boolean;
}
```

### Server Events (To Client)

#### `cart:item_added`
Item ditambahkan ke cart
```typescript
{
  session_id: string;
  item: KasirCartItem;
  timestamp: string;
}
```

#### `cart:item_updated`
Item di cart diupdate
```typescript
{
  session_id: string;
  produk_id: string;
  item: Partial<KasirCartItem>;
  timestamp: string;
}
```

#### `cart:item_removed`
Item dihapus dari cart
```typescript
{
  session_id: string;
  produk_id: string;
  timestamp: string;
}
```

#### `cart:cleared`
Cart dikosongkan
```typescript
{
  session_id: string;
  timestamp: string;
}
```

#### `transaction:completed`
Transaksi selesai
```typescript
{
  session_id: string;
  transaksi: TransaksiPenjualanData;
  timestamp: string;
}
```

#### `inventory:stock_updated`
Stok produk berubah
```typescript
{
  produk_id: string;
  stok_tersedia: number;
  stok_reserved: number;
  timestamp: string;
}
```

#### `inventory:low_stock_alert`
Alert stok menipis
```typescript
{
  produk_id: string;
  nama_produk: string;
  stok_tersedia: number;
  stok_minimum: number;
  timestamp: string;
}
```

---

## 🗄️ Database Schema Integration

### **Tables Used:**

1. **`transaksi_penjualan`** - Header transaksi penjualan
2. **`item_transaksi_penjualan`** - Item detail transaksi
3. **`inventaris`** - Real-time stock tracking
4. **`produk`** - Product master dengan join ke kategori, brand
5. **`pelanggan`** - Customer data dengan diskon info
6. **`user_sessions`** - Session management kasir
7. **`konfigurasi_sistem`** - Tax configuration per toko
8. **`promo`** & related - Promotion system integration

### **Multi-tenant Isolation:**
- Semua query automatic filtered by `tenant_id` & `toko_id`
- Access scope middleware enforcement
- Store-level inventory isolation

---

## 🛡️ Security & Permissions

### **Required Permissions:**
- `TRANSACTION_READ` - View transaksi, summary
- `TRANSACTION_CREATE` - Cart operations, payment processing
- `PRODUCT_READ` - Product search, barcode scan
- `CUSTOMER_READ` - Customer selection

### **Security Features:**
- JWT token validation
- Multi-tenant data isolation
- Input validation dengan Zod schemas
- Rate limiting untuk API calls
- SQL injection protection
- Real-time event authorization

---

## 🚀 Performance Optimizations

### **Database:**
- Indexed queries untuk product search
- Connection pooling
- Transaction batching untuk cart operations
- Optimized inventory updates

### **Real-time:**
- Efficient Socket.IO room management
- Event debouncing untuk inventory updates
- Selective event broadcasting

### **Caching Strategy:**
- Session-based cart caching
- Product info caching
- Inventory state caching

---

## 📊 Monitoring & Analytics

### **Built-in Metrics:**
- Active kasir sessions count
- Real-time transaction volume
- Stock movement tracking
- Payment method distribution
- Hourly sales breakdown

### **Performance Monitoring:**
- API response times
- Database query performance
- Socket.IO connection health
- Error rate tracking

---

## 🔧 Development & Testing

### **Environment Setup:**
```bash
# Install dependencies
npm install --workspace=backend

# Setup database
mysql -u user -p database < schema.sql

# Environment variables
cp .env.example .env
# Configure: DB_HOST, DB_USER, JWT_SECRET, etc.

# Run development server
npm run dev --workspace=backend
```

### **API Testing:**
```bash
# Health check
curl http://localhost:3000/api/kasir/health

# Product search
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/kasir/produk/search?query=kopi

# Barcode scan
curl -X POST -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"barcode":"1234567890"}' \
     http://localhost:3000/api/kasir/produk/scan
```

### **Socket.IO Testing:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/kasir');

// Join kasir room
socket.emit('kasir:join_room', {
  user_id: 'user-uuid',
  tenant_id: 'tenant-uuid',
  store_id: 'store-uuid'
});

// Listen for cart updates
socket.on('cart:item_added', (data) => {
  console.log('Item added to cart:', data);
});
```

---

## 📝 Error Handling

### **Standard Response Format:**
```typescript
{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
```

### **Common Error Codes:**
- `400` - Validation error, business rule violation
- `401` - Authentication required
- `403` - Insufficient permissions
- `404` - Resource tidak ditemukan
- `409` - Conflict (contoh: stok tidak mencukupi)
- `429` - Rate limit exceeded
- `500` - Internal server error

---

## 🎯 Future Enhancements

### **Planned Features:**
- [ ] Offline transaction support dengan sync
- [ ] Advanced promotion engine
- [ ] Loyalty points integration
- [ ] Multi-currency support
- [ ] Receipt printing service integration
- [ ] Cash drawer control API
- [ ] Shift management system
- [ ] Advanced reporting engine
- [ ] Tax calculation flexibility
- [ ] Integration dengan e-commerce platforms

---

## 📞 Support & Documentation

Untuk pertanyaan teknis atau issue reporting:
- **GitHub Issues**: Repository issue tracker
- **API Documentation**: Auto-generated Swagger docs
- **Database Schema**: `DATABASE_STRUCTURE_COMPLETE.md`
- **Architecture**: `CLAUDE.md` sistem overview

---

**🏷️ Version:** 1.0.0
**🗓️ Last Updated:** September 2025
**👨‍💻 Maintainer:** POS Development Team