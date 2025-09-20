#!/bin/bash

# Script untuk generate 50 kategori sample untuk user admintoko
# Menggunakan API endpoint dan token autentikasi

# Konfigurasi
API_BASE="http://localhost:3000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4M2U4MGFmOS05NDc0LTExZjAtOWNjNy0wMDE1NWQxMmYzMDkiLCJ0ZW5hbnRJZCI6IjM1MjI4MjljLTc1MzUtNDViOS1hY2QwLTJmMjZkNDBmMzM4ZiIsInRva29JZCI6IjBmN2U3ZjcwLWY4M2YtNDA5Ni1iM2FjLTc1NGNhMjgxYmRkYSIsInVzZXJuYW1lIjoiYWRtaW50b2tvIiwicm9sZSI6ImFkbWluX3Rva28iLCJsZXZlbCI6MywicGVyYW5JZCI6IjYyY2I1YWFmLTk0NzQtMTFmMC05Y2M3LTAwMTU1ZDEyZjMwOSIsImlhdCI6MTc1ODM0OTc5MywiZXhwIjoxNzU4NDM2MTkzfQ.p7b96Y-kFPbEo6n-39OJa8FbeCQABYAefzu9LjNQ7yU"

# Data tenant dan toko user admintoko
TENANT_ID="3522829c-7535-45b9-acd0-2f26d40f338f"
TOKO_ID="0f7e7f70-f83f-4096-b3ac-754ca281bdda"

# Array nama kategori untuk TK DANIS 1 (Taman Kanak-kanak)
NAMA_KATEGORI=(
    "Alat Tulis Anak"
    "Buku Cerita Bergambar"
    "Mainan Edukatif"
    "Perlengkapan Seni & Kerajinan"
    "Tas & Tempat Pensil Karakter"
    "Perlengkapan Kelas TK"
    "Makanan & Minuman Sehat"
    "Perlengkapan Kebersihan Anak"
    "Seragam & Aksesoris TK"
    "Perlengkapan Olahraga Anak"
    "Puzzle & Permainan Logika"
    "Alat Musik Sederhana"
    "Buku Mewarnai & Aktivitas"
    "Stiker & Reward Chart"
    "Perlengkapan Tidur Siang"
    "Alat Peraga Pembelajaran"
    "Mainan Konstruksi"
    "Boneka & Karakter Favorit"
    "Perlengkapan Berkebun Mini"
    "Alat Masak-masakan"
    "Buku Panduan Guru"
    "Media Pembelajaran Digital"
    "Perlengkapan Eksperimen Sains"
    "Kostum & Properti Drama"
    "Alat Terapi Motorik"
    "Perlengkapan Outdoor Play"
    "Mainan Kendaraan"
    "Alat Hitung & Matematika"
    "Perlengkapan Menggambar"
    "Mainan Peran Profesi"
    "Buku Dongeng Audio"
    "Perlengkapan Tari & Gerak"
    "Mainan Sensori"
    "Alat Bantu Belajar Membaca"
    "Perlengkapan Praktik Agama"
    "Mainan Tradisional"
    "Perlengkapan Kesehatan Anak"
    "Alat Dokumentasi Kegiatan"
    "Mainan Air & Pasir"
    "Perlengkapan Pesta & Perayaan"
    "Alat Bantu Komunikasi"
    "Mainan Elektronik Edukatif"
    "Perlengkapan Keamanan Anak"
    "Buku Referensi Parenting"
    "Mainan Soft Play"
    "Perlengkapan Administrasi TK"
    "Alat Bantu Terapi Wicara"
    "Mainan Ramah Lingkungan"
    "Perlengkapan Event Sekolah"
    "Media Pembelajaran Interaktif"
)

# Array deskripsi kategori
DESKRIPSI_KATEGORI=(
    "Peralatan tulis khusus untuk anak-anak usia TK dengan desain menarik dan aman"
    "Koleksi buku cerita bergambar untuk mengembangkan minat baca anak"
    "Mainan yang dirancang khusus untuk mengembangkan kemampuan kognitif anak"
    "Perlengkapan untuk kegiatan seni dan kerajinan tangan anak TK"
    "Tas sekolah dan tempat pensil dengan karakter favorit anak-anak"
    "Perlengkapan dan peralatan yang dibutuhkan untuk kegiatan di kelas TK"
    "Makanan dan minuman sehat yang cocok untuk anak usia TK"
    "Perlengkapan kebersihan khusus untuk menjaga kesehatan anak TK"
    "Seragam sekolah dan aksesoris pelengkap untuk siswa TK"
    "Peralatan olahraga yang aman dan sesuai untuk anak usia TK"
    "Permainan puzzle dan logika untuk mengasah kemampuan berpikir anak"
    "Alat musik sederhana untuk mengenalkan musik pada anak TK"
    "Buku mewarnai dan aktivitas untuk mengembangkan kreativitas anak"
    "Stiker reward dan chart motivasi untuk sistem penghargaan anak"
    "Perlengkapan untuk kegiatan tidur siang di sekolah"
    "Alat peraga untuk membantu proses pembelajaran di TK"
    "Mainan konstruksi untuk mengembangkan kemampuan motorik halus"
    "Boneka dan karakter favorit anak untuk bermain peran"
    "Perlengkapan berkebun mini untuk mengenalkan alam pada anak"
    "Mainan alat masak-masakan untuk bermain peran profesi"
    "Buku panduan dan referensi untuk guru TK"
    "Media pembelajaran berbasis teknologi untuk TK modern"
    "Alat sederhana untuk eksperimen sains anak TK"
    "Kostum dan properti untuk kegiatan drama dan pertunjukan"
    "Alat terapi untuk mengembangkan kemampuan motorik anak"
    "Perlengkapan untuk kegiatan bermain di luar ruangan"
    "Mainan kendaraan seperti mobil, pesawat, dan kapal"
    "Alat bantu untuk belajar berhitung dan matematika dasar"
    "Perlengkapan lengkap untuk kegiatan menggambar anak"
    "Mainan untuk bermain peran berbagai profesi"
    "Buku dongeng dalam format audio untuk mendengarkan cerita"
    "Perlengkapan untuk kegiatan tari dan gerak tubuh"
    "Mainan yang merangsang perkembangan sensori anak"
    "Alat bantu untuk belajar membaca dan mengenal huruf"
    "Perlengkapan untuk praktik kegiatan keagamaan"
    "Mainan tradisional Indonesia untuk mengenalkan budaya"
    "Perlengkapan kesehatan dan P3K khusus untuk anak TK"
    "Alat untuk mendokumentasikan kegiatan dan perkembangan anak"
    "Mainan untuk bermain air dan pasir yang aman"
    "Perlengkapan untuk berbagai pesta dan perayaan di TK"
    "Alat bantu komunikasi untuk anak dengan kebutuhan khusus"
    "Mainan elektronik edukatif yang aman untuk anak TK"
    "Perlengkapan keamanan untuk menjaga keselamatan anak"
    "Buku referensi parenting untuk orang tua siswa TK"
    "Mainan soft play yang aman dan nyaman untuk anak"
    "Perlengkapan administrasi dan tata usaha TK"
    "Alat bantu untuk terapi wicara dan komunikasi anak"
    "Mainan ramah lingkungan dari bahan daur ulang"
    "Perlengkapan untuk berbagai event dan acara sekolah"
    "Media pembelajaran interaktif dengan teknologi terkini"
)

# Fungsi untuk generate random number dalam range
random_range() {
    local min=$1
    local max=$2
    echo $((RANDOM % (max - min + 1) + min))
}

# Counter untuk tracking progress
counter=0
success_count=0
error_count=0

echo "Memulai pembuatan 50 kategori sample untuk TK DANIS 1..."
echo "Tenant: PT KETUA DANIS ($TENANT_ID)"
echo "Toko: TK DANIS 1 ($TOKO_ID)"
echo "Token: ${TOKEN:0:50}..."
echo "=================================="

# Loop untuk membuat 50 kategori
for i in {0..49}; do
    # Ambil nama dan deskripsi kategori
    nama="${NAMA_KATEGORI[$i]}"
    deskripsi="${DESKRIPSI_KATEGORI[$i]}"
    
    # Generate urutan random
    urutan=$(random_range 1 100)
    
    # JSON payload
    json_data=$(cat <<EOF
{
    "nama": "$nama",
    "deskripsi": "$deskripsi",
    "urutan": $urutan
}
EOF
)
    
    # Kirim request ke API
    response=$(curl -s -X POST "$API_BASE/produk/master/categories" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$json_data")
    
    # Check response
    if echo "$response" | grep -q '"success":true'; then
        ((success_count++))
        echo "✓ Kategori $((i+1)): $nama - Berhasil"
    else
        ((error_count++))
        echo "✗ Kategori $((i+1)): $nama - Gagal"
        echo "  Error: $response"
    fi
    
    ((counter++))
    
    # Progress indicator setiap 10 kategori
    if [ $((counter % 10)) -eq 0 ]; then
        echo "Progress: $counter/50 kategori (Success: $success_count, Error: $error_count)"
    fi
    
    # Delay kecil untuk menghindari rate limiting
    sleep 0.1
done

echo "=================================="
echo "Pembuatan kategori selesai!"
echo "Total: $counter kategori"
echo "Berhasil: $success_count kategori"
echo "Gagal: $error_count kategori"
echo "=================================="