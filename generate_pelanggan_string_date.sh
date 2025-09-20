#!/bin/bash

# Script untuk generate data pelanggan dengan format yang benar
# Menggunakan format tanggal YYYY-MM-DD (string) dan enum jenis_kelamin yang valid

BASE_URL="http://localhost:3000/api"
TENANT_ID="3522829c-7535-45b9-acd0-2f26d40f338f"
TOKO_ID="0f7e7f70-f83f-4096-b3ac-754ca281bdda"

# Login untuk mendapatkan token
echo "Login sebagai admintoko..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admintoko",
    "password": "123123123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login gagal!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Login berhasil, token diperoleh"

# Counter untuk tracking
SUCCESS_COUNT=0
FAILED_COUNT=0

# Array nama depan dan belakang untuk variasi
NAMA_DEPAN=("Ahmad" "Budi" "Citra" "Dewi" "Eko" "Fitri" "Gunawan" "Hani" "Indra" "Joko" "Kartika" "Lina" "Maya" "Nanda" "Oka" "Putri" "Qori" "Rina" "Sari" "Tono" "Umar" "Vina" "Wati" "Yani" "Zaki")
NAMA_BELAKANG=("Pratama" "Sari" "Wijaya" "Putri" "Santoso" "Lestari" "Kurniawan" "Dewi" "Setiawan" "Maharani" "Nugroho" "Anggraini" "Susanto" "Permata" "Hidayat" "Kusuma" "Rahayu" "Saputra" "Indah" "Cahaya")

# Array pekerjaan
PEKERJAAN=("Karyawan" "Wiraswasta" "PNS" "Guru" "Dokter" "Perawat" "Pedagang" "Petani" "Sopir" "Tukang" "Mahasiswa" "Ibu Rumah Tangga" "Pensiunan" "Buruh" "Teknisi")

# Array alamat
ALAMAT=("Jl. Merdeka No. 123" "Jl. Sudirman No. 456" "Jl. Thamrin No. 789" "Jl. Gatot Subroto No. 321" "Jl. Ahmad Yani No. 654" "Jl. Diponegoro No. 987" "Jl. Veteran No. 147" "Jl. Pahlawan No. 258" "Jl. Pemuda No. 369" "Jl. Kartini No. 741")

echo "Mulai membuat data pelanggan..."

for i in {1..10}; do
  # Generate data random
  NAMA_DEPAN_IDX=$((RANDOM % ${#NAMA_DEPAN[@]}))
  NAMA_BELAKANG_IDX=$((RANDOM % ${#NAMA_BELAKANG[@]}))
  NAMA="${NAMA_DEPAN[$NAMA_DEPAN_IDX]} ${NAMA_BELAKANG[$NAMA_BELAKANG_IDX]}"
  
  KODE="PLG$(printf "%04d" $i)"
  
  # Generate email
  EMAIL_PREFIX=$(echo "${NAMA_DEPAN[$NAMA_DEPAN_IDX]}" | tr '[:upper:]' '[:lower:]')
  EMAIL="${EMAIL_PREFIX}${i}@email.com"
  
  # Generate telepon
  TELEPON="08$(printf "%010d" $((RANDOM % 10000000000)))"
  
  # Generate alamat
  ALAMAT_IDX=$((RANDOM % ${#ALAMAT[@]}))
  ALAMAT_LENGKAP="${ALAMAT[$ALAMAT_IDX]}, RT.0${i}/RW.0$((i % 5 + 1))"
  
  # Generate tanggal lahir (format YYYY-MM-DD sebagai string)
  TAHUN=$((1970 + RANDOM % 40))  # 1970-2009
  BULAN=$(printf "%02d" $((RANDOM % 12 + 1)))
  HARI=$(printf "%02d" $((RANDOM % 28 + 1)))
  TANGGAL_LAHIR="${TAHUN}-${BULAN}-${HARI}"
  
  # Generate jenis kelamin (harus 'pria' atau 'wanita')
  if [ $((RANDOM % 2)) -eq 0 ]; then
    JENIS_KELAMIN="pria"
  else
    JENIS_KELAMIN="wanita"
  fi
  
  # Generate pekerjaan
  PEKERJAAN_IDX=$((RANDOM % ${#PEKERJAAN[@]}))
  PEKERJAAN_SELECTED="${PEKERJAAN[$PEKERJAAN_IDX]}"
  
  # Generate tipe pelanggan
  TIPE_OPTIONS=("reguler" "vip" "member" "wholesale")
  TIPE_IDX=$((RANDOM % ${#TIPE_OPTIONS[@]}))
  TIPE="${TIPE_OPTIONS[$TIPE_IDX]}"
  
  # Generate diskon (0-15%)
  DISKON=$((RANDOM % 16))
  
  # Generate limit kredit
  LIMIT_KREDIT=$((RANDOM % 10000000))
  
  echo "Membuat pelanggan $i: $NAMA..."
  
  # Buat request JSON tanpa tanggal_lahir untuk test
  JSON_DATA=$(cat <<EOF
{
  "kode": "$KODE",
  "nama": "$NAMA",
  "email": "$EMAIL",
  "telepon": "$TELEPON",
  "alamat": "$ALAMAT_LENGKAP",
  "jenis_kelamin": "$JENIS_KELAMIN",
  "pekerjaan": "$PEKERJAAN_SELECTED",
  "tipe": "$TIPE",
  "diskon_persen": $DISKON,
  "limit_kredit": $LIMIT_KREDIT,
  "status": "aktif"
}
EOF
)
  
  # Kirim request
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/pelanggan" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$JSON_DATA")
  
  # Pisahkan response body dan status code
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
  
  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Pelanggan $i berhasil dibuat"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "✗ Pelanggan $i gagal dibuat (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi
  
  # Delay kecil untuk menghindari rate limiting
  sleep 0.1
done

echo ""
echo "=== RINGKASAN ==="
echo "Berhasil: $SUCCESS_COUNT"
echo "Gagal: $FAILED_COUNT"
echo "Total: $((SUCCESS_COUNT + FAILED_COUNT))"

if [ $SUCCESS_COUNT -gt 0 ]; then
  echo ""
  echo "Verifikasi data pelanggan di database..."
  echo "Silakan cek di frontend atau database untuk memastikan data tersimpan dengan benar."
fi