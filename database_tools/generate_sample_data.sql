-- Script untuk generate data sampel database kasir
-- Dibuat untuk keperluan development dan testing

-- Data Supplier (200 record)
INSERT INTO supplier (tenant_id, nama, kontak_person, telepon, email, alamat, npwp, bank_nama, bank_rekening, bank_atas_nama, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'PT Aneka Ragam Jaya', 'Andi Pratama', '021-5551244', 'andi@anekaragam.com', 'Jl. Pancoran No. 852, Jakarta Selatan', '01.234.567.8-911.000', 'Bank BRI', '1234567891', 'PT Aneka Ragam Jaya', 'aktif'),
('550e8400-e29b-41d4-a716-446655440001', 'CV Berkah Mulia Sejahtera', 'Sari Indah', '021-5551245', 'sari@berkahmulia.com', 'Jl. Tebet No. 963, Jakarta Selatan', '01.234.567.8-912.000', 'Bank BNI', '2345678902', 'CV Berkah Mulia Sejahtera', 'aktif'),
('550e8400-e29b-41d4-a716-446655440001', 'UD Cahaya Bintang', 'Dedi Kurniawan', '021-5551246', 'dedi@cahayabintang.com', 'Jl. Cikini No. 174, Jakarta Pusat', '01.234.567.8-913.000', 'Bank BCA', '3456789013', 'UD Cahaya Bintang', 'aktif'),
('550e8400-e29b-41d4-a716-446655440001', 'PT Damai Sejahtera Abadi', 'Rina Wati', '021-5551247', 'rina@damaisejahtera.com', 'Jl. Menteng No. 285, Jakarta Pusat', '01.234.567.8-914.000', 'Bank Mandiri', '4567890124', 'PT Damai Sejahtera Abadi', 'aktif'),
('550e8400-e29b-41d4-a716-446655440001', 'CV Elang Mas Perkasa', 'Hendra Gunawan', '021-5551248', 'hendra@elangmas.com', 'Jl. Salemba No. 396, Jakarta Pusat', '01.234.567.8-915.000', 'Bank BRI', '5678901235', 'CV Elang Mas Perkasa', 'aktif'),
('550e8400-e29b-41d4-a716-446655440001', 'UD Fajar Harapan Baru', 'Lilis Suryani', '021-5551249', 'lilis@fajarharapan.com', 'Jl. Cempaka Putih No. 407, Jakarta Pusat', '01.234.567.8-916.000', 'Bank BNI', '6789012346', 'UD Fajar Harapan Baru', 'aktif'),
('550e8400-e29b-41d4-a716-446655440001', 'PT Gemilang Utama Mandiri', 'Yudi Hermawan', '021-5551250', 'yudi@gemilangutama.com', 'Jl. Kemayoran No. 518, Jakarta Pusat', '01.234.567.8-917.000', 'Bank BCA', '7890123457', 'PT Gemilang Utama Mandiri', 'aktif'),
('550e8400-e29b-41d4-a716-446655440001', 'CV Harmoni Sejati', 'Wulan Dari', '021-5551251', 'wulan@harmonisejati.com', 'Jl. Senen No. 629, Jakarta Pusat', '01.234.567.8-918.000', 'Bank Mandiri', '8901234568', 'CV Harmoni Sejati', 'aktif'),
('550e8400-e29b-41d4-a716-446655440001', 'UD Indah Permai Jaya', 'Tono Sugiarto', '021-5551252', 'tono@indahpermai.com', 'Jl. Gambir No. 730, Jakarta Pusat', '01.234.567.8-919.000', 'Bank BRI', '9012345679', 'UD Indah Permai Jaya', 'aktif'),
('550e8400-e29b-41d4-a716-446655440001', 'PT Jaya Abadi Sentosa', 'Fitri Handayani', '021-5551253', 'fitri@jayaabadi.com', 'Jl. Tanah Abang No. 841, Jakarta Pusat', '01.234.567.8-920.000', 'Bank BNI', '0123456780', 'PT Jaya Abadi Sentosa', 'aktif');

-- Lanjutan data supplier akan ditambahkan secara bertahap