#!/bin/bash

# Konfigurasi API
BASE_URL="http://localhost:3000"
LOGIN_ENDPOINT="$BASE_URL/api/auth/login"
SUPPLIER_ENDPOINT="$BASE_URL/api/produk/suppliers"

# Data login untuk user admintoko
USERNAME="admintoko"
PASSWORD="123123123"
TENANT_ID="3522829c-7535-45b9-acd0-2f26d40f338f"
TOKO_ID="0f7e7f70-f83f-4096-b3ac-754ca281bdda"

# Fungsi untuk mendapatkan token autentikasi
get_auth_token() {
    local response=$(curl -s -X POST "$LOGIN_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\", \"tenantId\": \"$TENANT_ID\"}")
    
    local token=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        echo "Gagal mendapatkan token. Response: $response"
        exit 1
    fi
    
    echo "$token"
}

# Data supplier sample
SUPPLIER_NAMES=(
    "PT Sumber Rejeki Makmur"
    "CV Mitra Dagang Sejahtera"
    "PT Berkah Jaya Abadi"
    "UD Cahaya Baru"
    "PT Mandiri Sukses"
    "CV Harapan Bersama"
    "PT Maju Jaya"
    "UD Sinar Terang"
    "CV Karya Utama"
    "PT Sukses Mandiri"
)

CONTACT_PERSONS=(
    "Budi Santoso"
    "Siti Nurhaliza"
    "Ahmad Fauzi"
    "Dewi Sartika"
    "Rudi Hermawan"
    "Andi Wijaya"
    "Maya Sari"
    "Doni Pratama"
    "Rina Wati"
    "Hendra Gunawan"
)

CITIES=(
    "Jakarta"
    "Surabaya"
    "Bandung"
    "Medan"
    "Semarang"
    "Makassar"
    "Palembang"
    "Tangerang"
    "Depok"
    "Bekasi"
)

# Fungsi untuk mendapatkan index random
get_random_index() {
    echo $((RANDOM % $1))
}

# Fungsi untuk generate nomor telepon
generate_phone() {
    local prefix=("021" "022" "024" "061" "031")
    local idx=$(get_random_index ${#prefix[@]})
    echo "${prefix[$idx]}$(printf "%07d" $((RANDOM % 10000000)))"
}

# Fungsi untuk generate email
generate_email() {
    local name=$1
    local domain=("gmail.com" "yahoo.com" "hotmail.com")
    local idx=$(get_random_index ${#domain[@]})
    local clean_name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
    echo "${clean_name}@${domain[$idx]}"
}

# Fungsi untuk membuat supplier
create_supplier() {
    local token=$1
    local supplier_name=$2
    local contact_person=$3
    local phone=$4
    local email=$5
    local city=$6
    
    local address="Jl. Raya $city No. $((RANDOM % 999 + 1)), $city"
    
    local json_data="{\"tenant_id\": \"$TENANT_ID\", \"toko_id\": \"$TOKO_ID\", \"nama\": \"$supplier_name\", \"kontak_person\": \"$contact_person\", \"telepon\": \"$phone\", \"email\": \"$email\", \"alamat\": \"$address\", \"status\": \"aktif\"}"
    
    local response=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "$SUPPLIER_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$json_data")
    
    local http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d':' -f2)
    local body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')
    
    if [ "$http_code" = "201" ] || echo "$body" | grep -q '"success":true\|"id":'; then
        return 0
    else
        echo "Error [$supplier_name]: HTTP $http_code - $body"
        return 1
    fi
}

# Main script
echo "=== MULAI PEMBUATAN 200 SUPPLIER ==="
echo "Endpoint: $SUPPLIER_ENDPOINT"
echo "Tenant ID: $TENANT_ID"
echo "Toko ID: $TOKO_ID"
echo ""

# Dapatkan token
echo "Mendapatkan token autentikasi..."
TOKEN=$(get_auth_token)
echo "Token berhasil didapat: ${TOKEN:0:30}..."
echo ""

# Counter
SUCCESS_COUNT=0
FAILED_COUNT=0

# Loop untuk membuat 200 supplier
for i in {1..200}; do
    # Generate data random
    name_idx=$(get_random_index ${#SUPPLIER_NAMES[@]})
    person_idx=$(get_random_index ${#CONTACT_PERSONS[@]})
    city_idx=$(get_random_index ${#CITIES[@]})
    
    supplier_name="${SUPPLIER_NAMES[$name_idx]} $i"
    contact_person="${CONTACT_PERSONS[$person_idx]}"
    phone=$(generate_phone)
    email=$(generate_email "$contact_person")
    city="${CITIES[$city_idx]}"
    
    echo -n "[$i/200] Membuat: $supplier_name... "
    
    if create_supplier "$TOKEN" "$supplier_name" "$contact_person" "$phone" "$email" "$city"; then
        echo "✓"
        ((SUCCESS_COUNT++))
    else
        echo "✗"
        ((FAILED_COUNT++))
    fi
    
    # Progress setiap 25 supplier
    if [ $((i % 25)) -eq 0 ]; then
        echo "Progress: $i/200 - Berhasil: $SUCCESS_COUNT, Gagal: $FAILED_COUNT"
    fi
done

echo ""
echo "=== HASIL AKHIR ==="
echo "Total supplier: 200"
echo "Berhasil: $SUCCESS_COUNT"
echo "Gagal: $FAILED_COUNT"

if [ $SUCCESS_COUNT -eq 200 ]; then
    echo "🎉 Semua supplier berhasil dibuat!"
elif [ $SUCCESS_COUNT -gt 0 ]; then
    echo "⚠️  Selesai dengan beberapa kegagalan."
else
    echo "❌ Tidak ada supplier yang berhasil dibuat."
fi