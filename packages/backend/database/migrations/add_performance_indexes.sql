-- Performance Optimization Indexes for Produk System
-- Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)

-- Note: Ignore errors if indexes already exist or don't exist

-- Index untuk tabel produk (composite index untuk pagination dan filtering)
CREATE INDEX idx_produk_composite 
ON produk (id_kategori, id_brand, id_supplier, nama, sku);

-- Index untuk pencarian nama produk
CREATE INDEX idx_produk_nama 
ON produk (nama);

-- Index untuk pencarian SKU (unique constraint sudah ada, tapi perlu index terpisah)
CREATE INDEX idx_produk_sku 
ON produk (sku);

-- Index untuk tabel inventaris (composite index untuk join dengan produk)
CREATE INDEX idx_inventaris_toko_produk 
ON inventaris (id_toko, id_produk);

-- Index untuk inventaris berdasarkan produk
CREATE INDEX idx_inventaris_produk 
ON inventaris (id_produk);

-- Index untuk kategori nama (untuk sorting)
CREATE INDEX idx_kategori_nama 
ON kategori (nama);

-- Index untuk brand nama (untuk sorting)
CREATE INDEX idx_brand_nama 
ON brand (nama);

-- Index untuk supplier nama (untuk sorting)
CREATE INDEX idx_supplier_nama 
ON supplier (nama);

-- Index untuk timestamp queries (untuk audit dan filtering)
CREATE INDEX idx_produk_created 
ON produk (dibuat_pada);

CREATE INDEX idx_produk_updated 
ON produk (diperbarui_pada);

-- Analyze tables untuk optimasi query planner
ANALYZE TABLE produk;
ANALYZE TABLE inventaris;
ANALYZE TABLE kategori;
ANALYZE TABLE brand;
ANALYZE TABLE supplier;

-- Show index usage untuk monitoring
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    CARDINALITY
FROM 
    INFORMATION_SCHEMA.STATISTICS 
WHERE 
    TABLE_SCHEMA = 'kasir' 
    AND TABLE_NAME IN ('produk', 'inventaris', 'kategori', 'brand', 'supplier')
ORDER BY 
    TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;