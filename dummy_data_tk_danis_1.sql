-- Script SQL untuk membuat 100 data dummy untuk TK DANIS 1
-- UUID Toko: 0f7e7f70-f83f-4096-b3ac-754ca281bdda
-- Tenant ID: 3522829c-7535-45b9-acd0-2f26d40f338f

-- Membuat supplier dummy terlebih dahulu
INSERT INTO supplier (id, tenant_id, toko_id, nama, alamat, telepon, email, status) VALUES
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Supplier Umum TK DANIS 1', 'Jl. Pendidikan No. 1', '081234567890', 'supplier@tkdanis1.com', 'aktif');

-- Mendapatkan supplier_id untuk digunakan di produk
SET @supplier_id = (SELECT id FROM supplier WHERE nama = 'Supplier Umum TK DANIS 1' LIMIT 1);

-- Data Brand untuk TK (Taman Kanak-kanak)
INSERT INTO brand (id, tenant_id, toko_id, nama, deskripsi, status) VALUES
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Faber-Castell', 'Alat tulis dan menggambar berkualitas tinggi untuk anak-anak', 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Joyko', 'Perlengkapan sekolah dan alat tulis anak', 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Titi DJ', 'Mainan edukatif dan perlengkapan belajar', 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Stabilo', 'Spidol dan alat mewarnai untuk anak', 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Pilot', 'Pulpen dan alat tulis premium', 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Snowman', 'Alat tulis dan perlengkapan sekolah', 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Kenko', 'Perlengkapan sekolah dan alat tulis', 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Deli', 'Alat tulis kantor dan sekolah', 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Greebel', 'Mainan edukatif dan puzzle anak', 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Fisher Price', 'Mainan edukatif berkualitas tinggi', 'aktif');

-- Data Kategori untuk TK
INSERT INTO kategori (id, tenant_id, toko_id, nama, deskripsi, urutan, status) VALUES
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Alat Tulis', 'Pensil, pulpen, spidol, dan alat tulis lainnya', 1, 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Buku & Kertas', 'Buku tulis, buku gambar, kertas warna', 2, 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Mainan Edukatif', 'Puzzle, balok susun, mainan belajar', 3, 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Perlengkapan Seni', 'Cat air, kuas, crayon, oil pastel', 4, 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Tas & Tempat Pensil', 'Tas sekolah, kotak pensil, tempat alat tulis', 5, 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Perlengkapan Kelas', 'Papan tulis kecil, penggaris, jangka', 6, 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Makanan & Minuman', 'Snack sehat, susu, air mineral', 7, 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Perlengkapan Kebersihan', 'Tisu, hand sanitizer, sabun cuci tangan', 8, 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Seragam & Aksesoris', 'Seragam TK, topi, kaos kaki', 9, 'aktif'),
(UUID(), '3522829c-7535-45b9-acd0-2f26d40f338f', '0f7e7f70-f83f-4096-b3ac-754ca281bdda', 'Perlengkapan Olahraga', 'Bola kecil, hulahoop, matras', 10, 'aktif');