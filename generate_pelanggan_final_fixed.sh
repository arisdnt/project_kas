#!/bin/bash

# Konfigurasi API
API_BASE="http://localhost:3000/api"
TENANT_ID="3522829c-7535-45b9-acd0-2f26d40f338f"
TOKO_ID="0f7e7f70-f83f-4096-b3ac-754ca281bdda"

# Fungsi untuk autentikasi
authenticate() {
    echo "Melakukan autentikasi..."
    
    AUTH_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"admintoko\",
            \"password\": \"123123123\",
            \"tenantId\": \"${TENANT_ID}\"
        }")
    
    if [ $? -ne 0 ]; then
        echo "Error: Gagal melakukan request autentikasi"
        exit 1
    fi
    
    # Parse token menggunakan grep dan sed
    ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
    
    if [ -z "$ACCESS_TOKEN" ]; then
        echo "Error: Gagal mendapatkan access token"
        echo "Response: $AUTH_RESPONSE"
        exit 1
    fi
    
    echo "Autentikasi berhasil!"
    echo "Token: ${ACCESS_TOKEN:0:20}..."
}

# Fungsi untuk generate data pelanggan
generate_pelanggan_data() {
    local index=$1
    local kode=$(printf "PLG%04d" $index)
    
    # Array nama depan dan belakang
    local nama_depan=("Andi" "Budi" "Citra" "Dewi" "Eko" "Fitri" "Gita" "Hadi" "Indra" "Joko" "Kartika" "Lina" "Maya" "Nina" "Oscar" "Putri" "Qori" "Rina" "Sari" "Tono")
    local nama_belakang=("Pratama" "Sari" "Wijaya" "Kusuma" "Santoso" "Wati" "Putra" "Dewi" "Utomo" "Lestari" "Handoko" "Maharani" "Setiawan" "Anggraini" "Nugroho" "Permata" "Hakim" "Safitri" "Rahman" "Indah")
    
    # Generate nama random
    local idx_depan=$((index % 20))
    local idx_belakang=$(((index + 7) % 20))
    local nama="${nama_depan[$idx_depan]} ${nama_belakang[$idx_belakang]}"
    
    # Generate email
    local email="${nama_depan[$idx_depan],,}.${nama_belakang[$idx_belakang],,}${index}@email.com"
    
    # Generate telepon
    local telepon="08$(printf "%010d" $((1000000000 + index)))"
    
    # Generate alamat
    local alamat="Jl. Merdeka No. ${index}, Jakarta Selatan"
    
    # Generate tanggal lahir dalam format ISO 8601 dengan timezone
    local tahun=$((1980 + (index % 25)))
    local bulan=$(printf "%02d" $((1 + (index % 12))))
    local hari=$(printf "%02d" $((1 + (index % 28))))
    local tanggal_lahir="${tahun}-${bulan}-${hari}T00:00:00.000Z"
    
    # Generate jenis kelamin dengan enum yang benar
    local jenis_kelamin="pria"
    if [ $((index % 2)) -eq 0 ]; then
        jenis_kelamin="wanita"
    fi
    
    # Generate pekerjaan
    local pekerjaan_list=("Karyawan" "Wiraswasta" "PNS" "Guru" "Dokter" "Pengacara" "Insinyur" "Petani" "Pedagang" "Mahasiswa")
    local pekerjaan="${pekerjaan_list[$((index % 10))]}"
    
    # Return JSON data
    cat << EOF
{
    "tenant_id": "${TENANT_ID}",
    "toko_id": "${TOKO_ID}",
    "kode": "${kode}",
    "nama": "${nama}",
    "email": "${email}",
    "telepon": "${telepon}",
    "alamat": "${alamat}",
    "tanggal_lahir": "${tanggal_lahir}",
    "jenis_kelamin": "${jenis_kelamin}",
    "pekerjaan": "${pekerjaan}",
    "tipe": "reguler",
    "diskon_persen": 0,
    "limit_kredit": 0,
    "status": "aktif"
}
EOF
}

# Fungsi untuk membuat pelanggan
create_pelanggan() {
    local data="$1"
    local index="$2"
    
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "${API_BASE}/pelanggan" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -d "$data")
    
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')
    
    if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Pelanggan $index berhasil dibuat"
        return 0
    else
        echo "✗ Pelanggan $index gagal dibuat (HTTP $HTTP_CODE)"
        echo "Response: $BODY"
        return 1
    fi
}

# Main script
echo "=== GENERATOR PELANGGAN UNTUK ADMINTOKO ==="
echo "Tenant: PT KETUA DANIS (${TENANT_ID})"
echo "Toko: TK DANIS 1 (${TOKO_ID})"
echo "Target: 200 pelanggan"
echo

# Autentikasi
authenticate

echo
echo "Mulai membuat pelanggan..."

SUCCESS_COUNT=0
FAILED_COUNT=0

# Loop untuk membuat 200 pelanggan
for i in $(seq 1 200); do
    echo -n "Membuat pelanggan $i... "
    
    # Generate data pelanggan
    PELANGGAN_DATA=$(generate_pelanggan_data $i)
    
    # Buat pelanggan
    if create_pelanggan "$PELANGGAN_DATA" "$i"; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
        # Stop jika ada 5 error berturut-turut untuk debugging
        if [ $FAILED_COUNT -ge 5 ] && [ $SUCCESS_COUNT -eq 0 ]; then
            echo
            echo "Terlalu banyak error berturut-turut. Menghentikan untuk debugging..."
            break
        fi
    fi
    
    # Delay kecil untuk menghindari rate limiting
    sleep 0.1
done

echo
echo "=== RINGKASAN HASIL ==="
echo "Berhasil: $SUCCESS_COUNT"
echo "Gagal: $FAILED_COUNT"
echo "Total: $((SUCCESS_COUNT + FAILED_COUNT))"

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo
    echo "✓ Script selesai! $SUCCESS_COUNT pelanggan berhasil dibuat."
else
    echo
    echo "✗ Tidak ada pelanggan yang berhasil dibuat. Periksa log error di atas."
fi