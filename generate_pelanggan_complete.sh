#!/bin/bash

# Script untuk generate data pelanggan dengan format yang benar
# Menggunakan tenant_id dan toko_id yang valid dari database

API_BASE="http://localhost:3000/api"
TENANT_ID="3522829c-7535-45b9-acd0-2f26d40f338f"
TOKO_ID="0f7e7f70-f83f-4096-b3ac-754ca281bdda"

echo "=== Generate Data Pelanggan ==="
echo "Tenant ID: $TENANT_ID"
echo "Toko ID: $TOKO_ID"

# Login untuk mendapatkan token
echo "Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"admintoko\",
    \"password\": \"123123123\",
    \"tenantId\": \"$TENANT_ID\"
  }")

echo "Login response: $LOGIN_RESPONSE"

# Ekstrak token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Login gagal! Token tidak ditemukan."
    exit 1
fi

echo "Token berhasil diperoleh: ${TOKEN:0:20}..."

# Counter untuk tracking
SUCCESS_COUNT=0
FAILED_COUNT=0
TOTAL_COUNT=50

# Array nama depan dan belakang
NAMA_DEPAN=("Andi" "Budi" "Citra" "Dewi" "Eko" "Fitri" "Gita" "Hadi" "Indra" "Joko" "Kartika" "Lina" "Maya" "Nanda" "Oka" "Putri" "Qori" "Rina" "Sari" "Tono")
NAMA_BELAKANG=("Pratama" "Sari" "Wijaya" "Kusuma" "Santoso" "Lestari" "Permana" "Anggraini" "Setiawan" "Maharani" "Putra" "Dewi" "Hakim" "Safitri" "Rahman" "Wulandari" "Firmansyah" "Oktavia" "Nugroho" "Puspita")

# Array alamat
ALAMAT=("Jl. Merdeka No. 123" "Jl. Sudirman No. 456" "Jl. Thamrin No. 789" "Jl. Gatot Subroto No. 321" "Jl. Ahmad Yani No. 654" "Jl. Diponegoro No. 987" "Jl. Veteran No. 147" "Jl. Pahlawan No. 258" "Jl. Kemerdekaan No. 369" "Jl. Proklamasi No. 741")

# Array pekerjaan
PEKERJAAN=("Karyawan Swasta" "Wiraswasta" "PNS" "Guru" "Dokter" "Petani" "Pedagang" "Mahasiswa" "Ibu Rumah Tangga" "Pensiunan")

echo "Mulai membuat $TOTAL_COUNT pelanggan..."

for i in $(seq 1 $TOTAL_COUNT); do
    # Generate data random
    NAMA_DEPAN_IDX=$((RANDOM % ${#NAMA_DEPAN[@]}))
    NAMA_BELAKANG_IDX=$((RANDOM % ${#NAMA_BELAKANG[@]}))
    ALAMAT_IDX=$((RANDOM % ${#ALAMAT[@]}))
    PEKERJAAN_IDX=$((RANDOM % ${#PEKERJAAN[@]}))
    
    NAMA="${NAMA_DEPAN[$NAMA_DEPAN_IDX]} ${NAMA_BELAKANG[$NAMA_BELAKANG_IDX]}"
    ALAMAT_FULL="${ALAMAT[$ALAMAT_IDX]}, RT 0$((RANDOM % 9 + 1))/RW 0$((RANDOM % 9 + 1))"
    PEKERJAAN_FULL="${PEKERJAAN[$PEKERJAAN_IDX]}"
    
    # Generate nomor telepon
    TELEPON="08$((RANDOM % 9 + 1))$(printf "%08d" $((RANDOM % 100000000)))"
    
    # Generate email
    EMAIL_PREFIX=$(echo "$NAMA" | tr '[:upper:]' '[:lower:]' | tr ' ' '.')
    EMAIL="${EMAIL_PREFIX}${i}@email.com"
    
    # Generate tanggal lahir (1970-2000)
    TAHUN=$((1970 + RANDOM % 31))
    BULAN=$(printf "%02d" $((RANDOM % 12 + 1)))
    HARI=$(printf "%02d" $((RANDOM % 28 + 1)))
    TANGGAL_LAHIR="${TAHUN}-${BULAN}-${HARI}"
    
    # Generate jenis kelamin
    if [ $((RANDOM % 2)) -eq 0 ]; then
        JENIS_KELAMIN="pria"
    else
        JENIS_KELAMIN="wanita"
    fi
    
    # Generate tipe pelanggan
    RAND_TIPE=$((RANDOM % 100))
    if [ $RAND_TIPE -lt 70 ]; then
        TIPE="reguler"
    elif [ $RAND_TIPE -lt 90 ]; then
        TIPE="member"
    else
        TIPE="vip"
    fi
    
    # Generate diskon (0-10%)
    DISKON=$((RANDOM % 11))
    
    # Generate limit kredit (100000-5000000)
    LIMIT_KREDIT=$((100000 + RANDOM % 4900000))
    
    # Generate kode pelanggan
    KODE="CUST$(printf "%04d" $i)"
    
    echo "Membuat pelanggan $i: $NAMA"
    
    # Buat request dengan format yang benar
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_BASE/pelanggan" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"tenant_id\": \"$TENANT_ID\",
        \"toko_id\": \"$TOKO_ID\",
        \"kode\": \"$KODE\",
        \"nama\": \"$NAMA\",
        \"email\": \"$EMAIL\",
        \"telepon\": \"$TELEPON\",
        \"alamat\": \"$ALAMAT_FULL\",
        \"tanggal_lahir\": \"$TANGGAL_LAHIR\",
        \"jenis_kelamin\": \"$JENIS_KELAMIN\",
        \"pekerjaan\": \"$PEKERJAAN_FULL\",
        \"tipe\": \"$TIPE\",
        \"diskon_persen\": $DISKON,
        \"limit_kredit\": $LIMIT_KREDIT,
        \"status\": \"aktif\"
      }")
    
    # Pisahkan response dan HTTP code
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1 | cut -d: -f2)
    RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "201" ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo "✓ Berhasil membuat pelanggan: $NAMA"
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
        echo "✗ Gagal membuat pelanggan $i: $NAMA"
        echo "  HTTP Code: $HTTP_CODE"
        echo "  Response: $RESPONSE_BODY"
    fi
    
    # Delay kecil untuk menghindari rate limiting
    sleep 0.1
done

echo ""
echo "=== RINGKASAN ==="
echo "Berhasil: $SUCCESS_COUNT"
echo "Gagal: $FAILED_COUNT"
echo "Total: $TOTAL_COUNT"
echo "==================="