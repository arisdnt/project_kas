#!/bin/bash

# Script untuk generate 200 data produk sample
# Menggunakan API endpoint dan token autentikasi

# Konfigurasi
API_BASE="http://localhost:3000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4M2U4MGFmOS05NDc0LTExZjAtOWNjNy0wMDE1NWQxMmYzMDkiLCJ0ZW5hbnRJZCI6IjM1MjI4MjljLTc1MzUtNDViOS1hY2QwLTJmMjZkNDBmMzM4ZiIsInRva29JZCI6IjBmN2U3ZjcwLWY4M2YtNDA5Ni1iM2FjLTc1NGNhMjgxYmRkYSIsInVzZXJuYW1lIjoiYWRtaW50b2tvIiwicm9sZSI6ImFkbWluX3Rva28iLCJsZXZlbCI6MywicGVyYW5JZCI6IjYyY2I1YWFmLTk0NzQtMTFmMC05Y2M3LTAwMTU1ZDEyZjMwOSIsImlhdCI6MTc1ODM0OTc5MywiZXhwIjoxNzU4NDM2MTkzfQ.p7b96Y-kFPbEo6n-39OJa8FbeCQABYAefzu9LjNQ7yU"

# Array data master - menggunakan ID yang benar dari database
KATEGORI_IDS=("3566cffb-95e5-11f0-a707-00155d12fdf3" "35671511-95e5-11f0-a707-00155d12fdf3" "3567188d-95e5-11f0-a707-00155d12fdf3" "35671a5d-95e5-11f0-a707-00155d12fdf3" "35671b7d-95e5-11f0-a707-00155d12fdf3" "35671c99-95e5-11f0-a707-00155d12fdf3" "35671d86-95e5-11f0-a707-00155d12fdf3" "356721fd-95e5-11f0-a707-00155d12fdf3" "35672367-95e5-11f0-a707-00155d12fdf3" "35672466-95e5-11f0-a707-00155d12fdf3")

BRAND_IDS=("3562a57a-95e5-11f0-a707-00155d12fdf3" "3562b89d-95e5-11f0-a707-00155d12fdf3" "3562ecde-95e5-11f0-a707-00155d12fdf3" "3562fe03-95e5-11f0-a707-00155d12fdf3" "3562ff8d-95e5-11f0-a707-00155d12fdf3" "35633ff6-95e5-11f0-a707-00155d12fdf3" "356343ff-95e5-11f0-a707-00155d12fdf3" "356344d4-95e5-11f0-a707-00155d12fdf3" "3563457d-95e5-11f0-a707-00155d12fdf3" "35634612-95e5-11f0-a707-00155d12fdf3" "551eb2db-f677-4a38-bd35-601a36805a4a" "630f071f-9a16-4112-a7ee-88dd017fdcbd")

SUPPLIER_IDS=("2e7d7f58-95e5-11f0-a707-00155d12fdf3" "35611ba0-95e5-11f0-a707-00155d12fdf3")

# Array nama produk sample
NAMA_PRODUK=("Pensil 2B" "Penghapus Putih" "Buku Tulis 38 Lembar" "Pulpen Biru" "Spidol Hitam" "Penggaris 30cm" "Lem Stick" "Gunting Kecil" "Stapler Mini" "Kertas A4" "Map Plastik" "Amplop Putih" "Tinta Printer" "Correction Pen" "Highlighter Kuning" "Binder Clip" "Paper Clip" "Sticky Notes" "Kalkulator" "Perforator" "Crayon 12 Warna" "Cat Air" "Kuas Lukis" "Kanvas Mini" "Plastisin" "Origami Paper" "Stiker Bintang" "Label Nama" "Karton Manila" "Double Tape" "Isolasi Bening" "Cutter Kecil" "Refill Pulpen" "Tipe-X" "Stabilo Boss" "Marker Permanent" "Buku Gambar A4" "Kertas Karbon" "Amplop Coklat" "Map Snelhecter" "Buku Agenda" "Kalender Meja" "Papan Tulis Mini" "Spons Papan Tulis" "Kapur Tulis" "Magnet Bulat" "Pin Board" "Jepit Kertas" "Rubber Band" "Tempat Pensil" "Tas Sekolah" "Botol Minum" "Kotak Bekal" "Seragam Putih" "Dasi Merah" "Sepatu Hitam" "Kaos Kaki" "Topi Sekolah" "Jaket Olahraga" "Celana Olahraga" "Bola Pingpong" "Raket Badminton" "Shuttlecock" "Bola Voli" "Net Voli" "Cone Latihan" "Peluit" "Stopwatch" "Matras Yoga" "Dumbbell 1kg" "Sabun Cuci Tangan" "Tissue Basah" "Hand Sanitizer" "Masker Kain" "Sarung Tangan" "Cairan Pembersih" "Lap Microfiber" "Sapu Lidi" "Kemoceng" "Tempat Sampah" "Susu Kotak" "Biskuit" "Permen" "Coklat Batang" "Keripik" "Jus Buah" "Air Mineral" "Roti Tawar" "Selai Kacang" "Mie Instan" "Mainan Puzzle" "Lego Mini" "Boneka Kecil" "Mobil-mobilan" "Robot Transformer" "Yoyo" "Kelereng" "Congklak" "Ular Tangga" "Monopoli Mini")

# Fungsi untuk generate random number dalam range
random_range() {
    local min=$1
    local max=$2
    echo $((RANDOM % (max - min + 1) + min))
}

# Fungsi untuk get random element dari array
get_random_element() {
    local arr=("$@")
    local index=$((RANDOM % ${#arr[@]}))
    echo "${arr[$index]}"
}

# Counter untuk tracking progress
counter=0
success_count=0
error_count=0

echo "Memulai pembuatan 200 data produk sample..."
echo "Token: ${TOKEN:0:50}..."
echo "=================================="

# Loop untuk membuat 200 data produk
for i in {1..200}; do
    # Generate data random
    nama=$(get_random_element "${NAMA_PRODUK[@]}")
    kategori_id=$(get_random_element "${KATEGORI_IDS[@]}")
    brand_id=$(get_random_element "${BRAND_IDS[@]}")
    supplier_id=$(get_random_element "${SUPPLIER_IDS[@]}")
    
    # Generate harga dan stok random
    harga_beli=$(random_range 5000 50000)
    harga_jual=$((harga_beli + (harga_beli * $(random_range 20 50) / 100)))
    stok_minimum=$(random_range 5 15)
    
    # Generate kode produk unik
    kode_produk="PRD$(printf "%03d" $i)"
    
    # Buat nama produk unik dengan nomor
    nama_unik="${nama} ${i}"
    
    # JSON payload
    json_data=$(cat <<EOF
{
    "kode": "$kode_produk",
    "nama": "$nama_unik",
    "deskripsi": "Produk sample $nama_unik untuk testing",
    "kategori_id": "$kategori_id",
    "brand_id": "$brand_id",
    "supplier_id": "$supplier_id",
    "harga_beli": $harga_beli,
    "harga_jual": $harga_jual,
    "stok_minimum": $stok_minimum,
    "satuan": "pcs",
    "is_aktif": 1
}
EOF
)
    
    # Kirim request ke API
    response=$(curl -s -X POST "$API_BASE/produk" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$json_data")
    
    # Check response
    if echo "$response" | grep -q '"success":true'; then
        ((success_count++))
        echo "✓ Produk $i: $nama_unik - Berhasil"
    else
        ((error_count++))
        echo "✗ Produk $i: $nama_unik - Gagal"
        echo "  Error: $response"
    fi
    
    ((counter++))
    
    # Progress indicator setiap 10 produk
    if [ $((counter % 10)) -eq 0 ]; then
        echo "Progress: $counter/200 produk (Success: $success_count, Error: $error_count)"
    fi
    
    # Delay kecil untuk menghindari rate limiting
    sleep 0.1
done

echo "=================================="
echo "Pembuatan data produk selesai!"
echo "Total: $counter produk"
echo "Berhasil: $success_count produk"
echo "Gagal: $error_count produk"
echo "=================================="