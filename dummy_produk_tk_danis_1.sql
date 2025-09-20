-- Script SQL untuk membuat 100 produk dummy untuk TK DANIS 1
-- Menggunakan brand_id dan kategori_id yang sudah dibuat sebelumnya

-- Menggunakan nilai langsung untuk UUID toko, tenant_id, dan supplier_id
-- Toko ID: 0f7e7f70-f83f-4096-b3ac-754ca281bdda
-- Tenant ID: 3522829c-7535-45b9-acd0-2f26d40f338f  
-- Supplier ID: 2e7d7f58-95e5-11f0-a707-00155d12fdf3

-- Ambil ID brand yang sudah dibuat (menggunakan subquery langsung)
-- Ambil ID kategori yang sudah dibuat (menggunakan subquery langsung)

-- Data 100 Produk untuk TK DANIS 1
INSERT INTO produk (id, tenant_id, toko_id, kategori_id, brand_id, supplier_id, kode, nama, deskripsi, satuan, harga_beli, harga_jual, margin_persen, stok_minimum, is_aktif) VALUES
-- Alat Tulis (20 produk)
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Faber-Castell'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'FC001', 'Pensil 2B Faber-Castell', 'Pensil grafit 2B untuk anak TK', 'pcs', 2500.00, 3500.00, 40.00, 50, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Faber-Castell'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'FC002', 'Pensil Warna 12 Faber-Castell', 'Set pensil warna 12 warna untuk mewarnai', 'set', 25000.00, 35000.00, 40.00, 20, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Stabilo'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'ST001', 'Spidol Warna Stabilo 8 Warna', 'Spidol warna washable untuk anak', 'set', 18000.00, 25000.00, 38.89, 25, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Pilot'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'PL001', 'Pulpen Pilot Biru', 'Pulpen tinta biru untuk latihan menulis', 'pcs', 3000.00, 4500.00, 50.00, 40, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Joyko'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'JY001', 'Penghapus Joyko', 'Penghapus putih lembut untuk anak', 'pcs', 1500.00, 2500.00, 66.67, 60, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Joyko'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'JY002', 'Rautan Pensil Joyko', 'Rautan pensil plastik warna-warni', 'pcs', 3500.00, 5000.00, 42.86, 30, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Snowman'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'SN001', 'Pensil Mekanik Snowman', 'Pensil mekanik 0.5mm untuk anak', 'pcs', 8000.00, 12000.00, 50.00, 20, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Deli'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'DL001', 'Penggaris Plastik 15cm', 'Penggaris plastik transparan 15cm', 'pcs', 2000.00, 3000.00, 50.00, 40, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Kenko'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'KN001', 'Lem Stick Kenko', 'Lem batang untuk kerajinan anak', 'pcs', 4000.00, 6000.00, 50.00, 35, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Faber-Castell'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'FC003', 'Crayon Faber-Castell 16 Warna', 'Crayon oil pastel 16 warna', 'set', 15000.00, 22000.00, 46.67, 25, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Stabilo'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'ST002', 'Highlighter Stabilo Kuning', 'Stabilo kuning untuk menandai', 'pcs', 5000.00, 7500.00, 50.00, 30, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Pilot'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'PL002', 'Correction Pen Pilot', 'Tip-ex untuk mengoreksi tulisan', 'pcs', 6000.00, 9000.00, 50.00, 25, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Joyko'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'JY003', 'Gunting Anak Joyko', 'Gunting tumpul aman untuk anak TK', 'pcs', 8000.00, 12000.00, 50.00, 20, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Deli'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'DL002', 'Stapler Mini Deli', 'Stapler kecil untuk anak', 'pcs', 12000.00, 18000.00, 50.00, 15, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Snowman'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'SN002', 'Pensil Warna Aquarel 12', 'Pensil warna yang bisa dicampur air', 'set', 30000.00, 45000.00, 50.00, 15, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Faber-Castell'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'FC004', 'Spidol Papan Tulis Hitam', 'Spidol untuk papan tulis hitam', 'pcs', 4500.00, 7000.00, 55.56, 30, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Kenko'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'KN002', 'Double Tape Kenko', 'Double tape kecil untuk kerajinan', 'pcs', 3000.00, 4500.00, 50.00, 40, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Pilot'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'PL003', 'Pulpen Gel Pilot Warna', 'Pulpen gel aneka warna', 'pcs', 5000.00, 7500.00, 50.00, 25, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Joyko'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'JY004', 'Pensil 2H Joyko', 'Pensil keras untuk sketsa', 'pcs', 2000.00, 3000.00, 50.00, 50, 1),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', (SELECT id FROM kategori WHERE nama = 'Alat Tulis'), (SELECT id FROM brand WHERE nama = 'Deli'), '2e7d7f58-95e5-11f0-a707-00155d12fdf3', 'DL003', 'Cutter Kecil Deli', 'Cutter kecil aman untuk anak', 'pcs', 6000.00, 9000.00, 50.00, 20, 1),

-- Buku & Kertas (15 produk)
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_joyko, @supplier_id, 'JY005', 'Buku Tulis 38 Lembar', 'Buku tulis garis untuk latihan menulis', 'pcs', 3000.00, 4500.00, 50.00, 100, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_joyko, @supplier_id, 'JY006', 'Buku Gambar A4', 'Buku gambar polos A4 untuk menggambar', 'pcs', 5000.00, 7500.00, 50.00, 80, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_kenko, @supplier_id, 'KN003', 'Kertas Warna A4 10 Lembar', 'Kertas warna-warni untuk kerajinan', 'pack', 8000.00, 12000.00, 50.00, 50, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_deli, @supplier_id, 'DL004', 'Buku Mewarnai Hewan', 'Buku mewarnai dengan gambar hewan', 'pcs', 6000.00, 9000.00, 50.00, 40, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_joyko, @supplier_id, 'JY007', 'Buku Tulis Bergaris 3 Garis', 'Buku tulis 3 garis untuk belajar menulis', 'pcs', 3500.00, 5000.00, 42.86, 80, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_snowman, @supplier_id, 'SN003', 'Kertas Origami 15x15', 'Kertas lipat warna-warni', 'pack', 10000.00, 15000.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_kenko, @supplier_id, 'KN004', 'Buku Cerita Bergambar', 'Buku cerita pendek dengan ilustrasi', 'pcs', 12000.00, 18000.00, 50.00, 25, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_deli, @supplier_id, 'DL005', 'Sticky Notes Warna', 'Kertas tempel warna-warni kecil', 'pack', 5000.00, 7500.00, 50.00, 40, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_joyko, @supplier_id, 'JY008', 'Buku Latihan Huruf', 'Buku latihan menulis huruf A-Z', 'pcs', 8000.00, 12000.00, 50.00, 35, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_pilot, @supplier_id, 'PL004', 'Kertas Karton A4', 'Kertas karton tebal untuk kerajinan', 'lembar', 2000.00, 3000.00, 50.00, 100, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_snowman, @supplier_id, 'SN004', 'Buku Aktivitas TK', 'Buku aktivitas dengan stiker', 'pcs', 15000.00, 22000.00, 46.67, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_kenko, @supplier_id, 'KN005', 'Kertas Crepe Warna', 'Kertas krep untuk dekorasi', 'lembar', 3000.00, 4500.00, 50.00, 60, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_deli, @supplier_id, 'DL006', 'Buku Stiker Edukatif', 'Buku dengan stiker angka dan huruf', 'pcs', 10000.00, 15000.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_joyko, @supplier_id, 'JY009', 'Amplop Warna Kecil', 'Amplop warna-warni untuk kerajinan', 'pack', 6000.00, 9000.00, 50.00, 25, 1),
(UUID(), @tenant_id, @toko_id, @kat_buku, @brand_faber, @supplier_id, 'FC005', 'Kertas Gambar A3', 'Kertas gambar ukuran A3', 'lembar', 4000.00, 6000.00, 50.00, 50, 1),

-- Mainan Edukatif (15 produk)
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_titi, @supplier_id, 'TD001', 'Puzzle Angka 1-10', 'Puzzle kayu angka untuk belajar', 'set', 25000.00, 37500.00, 50.00, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_greebel, @supplier_id, 'GB001', 'Balok Susun Warna', 'Balok kayu warna-warni 20 pcs', 'set', 35000.00, 52500.00, 50.00, 15, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_fisher, @supplier_id, 'FP001', 'Mainan Edukasi Huruf', 'Mainan huruf magnetik', 'set', 45000.00, 67500.00, 50.00, 12, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_titi, @supplier_id, 'TD002', 'Puzzle Hewan 12 Keping', 'Puzzle kayu gambar hewan', 'set', 20000.00, 30000.00, 50.00, 25, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_greebel, @supplier_id, 'GB002', 'Lego Duplo Set Kecil', 'Lego ukuran besar untuk anak TK', 'set', 50000.00, 75000.00, 50.00, 10, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_fisher, @supplier_id, 'FP002', 'Mainan Bentuk Geometri', 'Mainan bentuk untuk belajar geometri', 'set', 30000.00, 45000.00, 50.00, 18, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_titi, @supplier_id, 'TD003', 'Abakus Kayu', 'Alat hitung tradisional kayu', 'pcs', 28000.00, 42000.00, 50.00, 15, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_greebel, @supplier_id, 'GB003', 'Puzzle Transportasi', 'Puzzle kendaraan 16 keping', 'set', 22000.00, 33000.00, 50.00, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_fisher, @supplier_id, 'FP003', 'Mainan Musik Mini', 'Piano mini untuk anak', 'pcs', 40000.00, 60000.00, 50.00, 12, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_titi, @supplier_id, 'TD004', 'Domino Warna', 'Domino kayu warna-warni', 'set', 18000.00, 27000.00, 50.00, 25, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_greebel, @supplier_id, 'GB004', 'Mainan Susun Ring', 'Mainan susun cincin warna', 'pcs', 15000.00, 22500.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_fisher, @supplier_id, 'FP004', 'Bola Sensori', 'Bola dengan tekstur berbeda', 'pcs', 25000.00, 37500.00, 50.00, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_titi, @supplier_id, 'TD005', 'Puzzle Profesi', 'Puzzle berbagai profesi', 'set', 24000.00, 36000.00, 50.00, 18, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_greebel, @supplier_id, 'GB005', 'Mainan Hammer Ball', 'Mainan palu dan bola warna', 'set', 32000.00, 48000.00, 50.00, 15, 1),
(UUID(), @tenant_id, @toko_id, @kat_mainan, @brand_fisher, @supplier_id, 'FP005', 'Mainan Sorting Box', 'Kotak sortir bentuk dan warna', 'set', 38000.00, 57000.00, 50.00, 12, 1),

-- Perlengkapan Seni (10 produk)
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_faber, @supplier_id, 'FC006', 'Cat Air 12 Warna', 'Cat air untuk melukis anak', 'set', 20000.00, 30000.00, 50.00, 25, 1),
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_stabilo, @supplier_id, 'ST003', 'Kuas Lukis Set 3', 'Set kuas berbagai ukuran', 'set', 12000.00, 18000.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_joyko, @supplier_id, 'JY010', 'Palet Cat Plastik', 'Palet untuk mencampur cat', 'pcs', 5000.00, 7500.00, 50.00, 40, 1),
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_faber, @supplier_id, 'FC007', 'Oil Pastel 24 Warna', 'Crayon minyak 24 warna', 'set', 35000.00, 52500.00, 50.00, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_pilot, @supplier_id, 'PL005', 'Spons Lukis', 'Spons untuk teknik melukis', 'pcs', 3000.00, 4500.00, 50.00, 50, 1),
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_deli, @supplier_id, 'DL007', 'Canvas Mini 10x10', 'Kanvas kecil untuk melukis', 'pcs', 8000.00, 12000.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_stabilo, @supplier_id, 'ST004', 'Crayon Jumbo 8 Warna', 'Crayon besar untuk anak kecil', 'set', 18000.00, 27000.00, 50.00, 25, 1),
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_kenko, @supplier_id, 'KN006', 'Glitter Powder Set', 'Bubuk glitter aneka warna', 'set', 15000.00, 22500.00, 50.00, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_faber, @supplier_id, 'FC008', 'Pensil Arang', 'Pensil arang untuk sketsa', 'pcs', 4000.00, 6000.00, 50.00, 35, 1),
(UUID(), @tenant_id, @toko_id, @kat_seni, @brand_joyko, @supplier_id, 'JY011', 'Celemek Lukis Anak', 'Celemek plastik untuk melukis', 'pcs', 12000.00, 18000.00, 50.00, 25, 1),

-- Tas & Tempat Pensil (10 produk)
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_joyko, @supplier_id, 'JY012', 'Tas Ransel TK Kecil', 'Tas ransel warna-warni untuk TK', 'pcs', 45000.00, 67500.00, 50.00, 15, 1),
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_kenko, @supplier_id, 'KN007', 'Kotak Pensil Plastik', 'Kotak pensil dengan sekat', 'pcs', 15000.00, 22500.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_deli, @supplier_id, 'DL008', 'Tempat Pensil Gulung', 'Tempat pensil kain bisa digulung', 'pcs', 20000.00, 30000.00, 50.00, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_snowman, @supplier_id, 'SN005', 'Tas Selempang Mini', 'Tas kecil untuk jalan-jalan', 'pcs', 35000.00, 52500.00, 50.00, 18, 1),
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_joyko, @supplier_id, 'JY013', 'Kotak Makan Plastik', 'Lunch box dengan sekat', 'pcs', 25000.00, 37500.00, 50.00, 25, 1),
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_pilot, @supplier_id, 'PL006', 'Tempat Botol Minum', 'Holder botol minum anak', 'pcs', 18000.00, 27000.00, 50.00, 22, 1),
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_kenko, @supplier_id, 'KN008', 'Dompet Anak Kecil', 'Dompet kecil dengan tali', 'pcs', 12000.00, 18000.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_deli, @supplier_id, 'DL009', 'Organizer Meja Kecil', 'Tempat alat tulis meja', 'pcs', 22000.00, 33000.00, 50.00, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_snowman, @supplier_id, 'SN006', 'Tas Serut Olahraga', 'Tas serut untuk perlengkapan OR', 'pcs', 28000.00, 42000.00, 50.00, 18, 1),
(UUID(), @tenant_id, @toko_id, @kat_tas, @brand_joyko, @supplier_id, 'JY014', 'Kotak Krayon Besar', 'Kotak khusus untuk menyimpan krayon', 'pcs', 16000.00, 24000.00, 50.00, 25, 1),

-- Perlengkapan Kelas (10 produk)
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_deli, @supplier_id, 'DL010', 'Papan Tulis Mini A4', 'Papan tulis kecil untuk anak', 'pcs', 15000.00, 22500.00, 50.00, 25, 1),
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_pilot, @supplier_id, 'PL007', 'Penggaris Kayu 30cm', 'Penggaris kayu natural', 'pcs', 5000.00, 7500.00, 50.00, 40, 1),
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_joyko, @supplier_id, 'JY015', 'Busur Derajat Plastik', 'Busur 180 derajat untuk anak', 'pcs', 6000.00, 9000.00, 50.00, 35, 1),
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_kenko, @supplier_id, 'KN009', 'Jam Dinding Edukatif', 'Jam untuk belajar waktu', 'pcs', 35000.00, 52500.00, 50.00, 12, 1),
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_snowman, @supplier_id, 'SN007', 'Papan Magnet Kecil', 'Papan magnet dengan huruf', 'set', 40000.00, 60000.00, 50.00, 10, 1),
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_deli, @supplier_id, 'DL011', 'Penjepit Kertas Warna', 'Paper clip warna-warni', 'pack', 8000.00, 12000.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_faber, @supplier_id, 'FC009', 'Kompas Plastik Anak', 'Kompas sederhana untuk anak', 'pcs', 12000.00, 18000.00, 50.00, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_pilot, @supplier_id, 'PL008', 'Segitiga Siku Plastik', 'Segitiga siku untuk menggambar', 'pcs', 7000.00, 10500.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_joyko, @supplier_id, 'JY016', 'Binder Clip Mini', 'Penjepit kertas kecil', 'pack', 5000.00, 7500.00, 50.00, 40, 1),
(UUID(), @tenant_id, @toko_id, @kat_kelas, @brand_kenko, @supplier_id, 'KN010', 'Papan Nama Meja', 'Name tag untuk meja anak', 'pcs', 3000.00, 4500.00, 50.00, 50, 1),

-- Makanan & Minuman (10 produk)
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_pilot, @supplier_id, 'MK001', 'Biskuit Sehat Anak', 'Biskuit bergizi untuk anak TK', 'pack', 8000.00, 12000.00, 50.00, 50, 1),
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_joyko, @supplier_id, 'MK002', 'Susu UHT Kotak Kecil', 'Susu UHT rasa coklat 125ml', 'pcs', 4000.00, 6000.00, 50.00, 100, 1),
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_kenko, @supplier_id, 'MK003', 'Air Mineral 330ml', 'Air mineral kemasan kecil', 'pcs', 2000.00, 3000.00, 50.00, 150, 1),
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_snowman, @supplier_id, 'MK004', 'Jus Buah Kotak', 'Jus buah asli tanpa pengawet', 'pcs', 5000.00, 7500.00, 50.00, 80, 1),
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_deli, @supplier_id, 'MK005', 'Crackers Gandum', 'Kerupuk gandum sehat', 'pack', 6000.00, 9000.00, 50.00, 60, 1),
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_faber, @supplier_id, 'MK006', 'Yogurt Cup Anak', 'Yogurt rasa buah untuk anak', 'cup', 7000.00, 10500.00, 50.00, 40, 1),
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_pilot, @supplier_id, 'MK007', 'Buah Potong Segar', 'Buah potong dalam cup', 'cup', 10000.00, 15000.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_joyko, @supplier_id, 'MK008', 'Roti Tawar Mini', 'Roti tawar ukuran mini', 'pack', 8000.00, 12000.00, 50.00, 35, 1),
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_kenko, @supplier_id, 'MK009', 'Permen Vitamin C', 'Permen dengan vitamin C', 'pack', 5000.00, 7500.00, 50.00, 70, 1),
(UUID(), @tenant_id, @toko_id, @kat_makanan, @brand_snowman, @supplier_id, 'MK010', 'Madu Sachet Anak', 'Madu murni kemasan sachet', 'pcs', 3000.00, 4500.00, 50.00, 100, 1),

-- Perlengkapan Kebersihan (5 produk)
(UUID(), @tenant_id, @toko_id, @kat_kebersihan, @brand_deli, @supplier_id, 'KB001', 'Tisu Basah Anak', 'Tisu basah khusus anak', 'pack', 8000.00, 12000.00, 50.00, 50, 1),
(UUID(), @tenant_id, @toko_id, @kat_kebersihan, @brand_pilot, @supplier_id, 'KB002', 'Hand Sanitizer Mini', 'Hand sanitizer 50ml untuk anak', 'pcs', 12000.00, 18000.00, 50.00, 40, 1),
(UUID(), @tenant_id, @toko_id, @kat_kebersihan, @brand_joyko, @supplier_id, 'KB003', 'Sabun Cuci Tangan Cair', 'Sabun cair aroma buah', 'btl', 15000.00, 22500.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_kebersihan, @brand_kenko, @supplier_id, 'KB004', 'Tisu Kering Lembut', 'Tisu kering untuk wajah anak', 'pack', 6000.00, 9000.00, 50.00, 60, 1),
(UUID(), @tenant_id, @toko_id, @kat_kebersihan, @brand_snowman, @supplier_id, 'KB005', 'Masker Anak Motif', 'Masker anak dengan motif lucu', 'pcs', 3000.00, 4500.00, 50.00, 100, 1),

-- Seragam & Aksesoris (5 produk)
(UUID(), @tenant_id, @toko_id, @kat_seragam, @brand_joyko, @supplier_id, 'SR001', 'Kaos Seragam TK', 'Kaos seragam warna merah', 'pcs', 25000.00, 37500.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_seragam, @brand_pilot, @supplier_id, 'SR002', 'Topi Seragam TK', 'Topi seragam dengan logo', 'pcs', 15000.00, 22500.00, 50.00, 40, 1),
(UUID(), @tenant_id, @toko_id, @kat_seragam, @brand_kenko, @supplier_id, 'SR003', 'Kaos Kaki Putih', 'Kaos kaki putih panjang', 'pasang', 8000.00, 12000.00, 50.00, 50, 1),
(UUID(), @tenant_id, @toko_id, @kat_seragam, @brand_deli, @supplier_id, 'SR004', 'Dasi Seragam Anak', 'Dasi clip-on untuk seragam', 'pcs', 12000.00, 18000.00, 50.00, 35, 1),
(UUID(), @tenant_id, @toko_id, @kat_seragam, @brand_snowman, @supplier_id, 'SR005', 'Sepatu Sekolah Hitam', 'Sepatu sekolah warna hitam', 'pasang', 85000.00, 127500.00, 50.00, 15, 1),

-- Perlengkapan Olahraga (5 produk)
(UUID(), @tenant_id, @toko_id, @kat_olahraga, @brand_fisher, @supplier_id, 'OR001', 'Bola Karet Kecil', 'Bola karet untuk bermain', 'pcs', 15000.00, 22500.00, 50.00, 30, 1),
(UUID(), @tenant_id, @toko_id, @kat_olahraga, @brand_greebel, @supplier_id, 'OR002', 'Hulahoop Anak', 'Hulahoop ukuran anak TK', 'pcs', 25000.00, 37500.00, 50.00, 20, 1),
(UUID(), @tenant_id, @toko_id, @kat_olahraga, @brand_titi, @supplier_id, 'OR003', 'Matras Senam Mini', 'Matras kecil untuk senam', 'pcs', 45000.00, 67500.00, 50.00, 15, 1),
(UUID(), @tenant_id, @toko_id, @kat_olahraga, @brand_fisher, @supplier_id, 'OR004', 'Cone Latihan Kecil', 'Cone untuk latihan motorik', 'set', 35000.00, 52500.00, 50.00, 18, 1),
(UUID(), @tenant_id, @toko_id, @kat_olahraga, @brand_greebel, @supplier_id, 'OR005', 'Tali Skipping Anak', 'Tali lompat untuk anak TK', 'pcs', 20000.00, 30000.00, 50.00, 25, 1);