-- ===================================================================
-- PATCH 1: Stock Management Constraints & Triggers
-- Memastikan stok tidak bisa negatif dan konsistensi data inventaris
-- ===================================================================

-- 1. Tambah constraint untuk mencegah stok negatif
ALTER TABLE inventaris
ADD CONSTRAINT chk_stok_tersedia_positive
CHECK (stok_tersedia >= 0);

ALTER TABLE inventaris
ADD CONSTRAINT chk_stok_reserved_positive
CHECK (stok_reserved >= 0);

-- 2. Tambah constraint untuk validasi total stok
ALTER TABLE inventaris
ADD CONSTRAINT chk_total_stok_logical
CHECK (stok_tersedia >= stok_reserved);

-- 3. Index untuk performa query stok
CREATE INDEX idx_inventaris_stok_low
ON inventaris (stok_tersedia, stok_minimum_toko)
WHERE stok_tersedia <= stok_minimum_toko;

-- 4. Trigger untuk update timestamp inventory
DELIMITER $$
CREATE TRIGGER tr_inventaris_update_timestamp
BEFORE UPDATE ON inventaris
FOR EACH ROW
BEGIN
    SET NEW.terakhir_update = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- 5. View untuk stok rendah
CREATE OR REPLACE VIEW v_stok_rendah AS
SELECT
    i.produk_id,
    p.nama as nama_produk,
    p.kode as kode_produk,
    i.toko_id,
    t.nama as nama_toko,
    i.stok_tersedia,
    i.stok_minimum_toko,
    (i.stok_minimum_toko - i.stok_tersedia) as kekurangan_stok,
    i.terakhir_update
FROM inventaris i
JOIN produk p ON i.produk_id = p.id
JOIN toko t ON i.toko_id = t.id
WHERE i.stok_tersedia <= i.stok_minimum_toko
  AND p.is_aktif = 1
ORDER BY (i.stok_minimum_toko - i.stok_tersedia) DESC;