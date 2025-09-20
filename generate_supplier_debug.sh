#!/bin/bash

# Konfigurasi API
BASE_URL="http://localhost:3000"
LOGIN_ENDPOINT="$BASE_URL/api/auth/login"
SUPPLIER_ENDPOINT="$BASE_URL/api/produk/master/suppliers"

# Data login untuk user admintoko
USERNAME="admintoko"
PASSWORD="123123123"
TENANT_ID="3522829c-7535-45b9-acd0-2f26d40f338f"
TOKO_ID="0f7e7f70-f83f-4096-b3ac-754ca281bdda"

# Fungsi untuk mendapatkan token autentikasi
get_auth_token() {
    echo "Mendapatkan token autentikasi..."
    local response=$(curl -s -X POST "$LOGIN_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\", \"tenantId\": \"$TENANT_ID\"}")
    
    echo "Login response: $response"
    
    local token=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        echo "Gagal mendapatkan token. Response: $response"
        exit 1
    fi
    
    echo "Token berhasil didapat: ${token:0:20}..."
    echo "$token"
}

# Data supplier sample
SUPPLIER_NAMES=(
    "PT Sumber Rejeki Makmur"
    "CV Mitra Dagang Sejahtera"
    "PT Berkah Jaya Abadi"
    "UD Cahaya Baru"
    "PT Mandiri Sukses"
)

CONTACT_PERSONS=(
    "Budi Santoso"
    "Siti Nurhaliza"
    "Ahmad Fauzi"
    "Dewi Sartika"
    "Rudi Hermawan"
)

CITIES=(
    "Jakarta"
    "Surabaya"
    "Bandung"
    "Medan"
    "Semarang"
)

BANKS=(
    "BCA"
    "BRI"
    "BNI"
    "Mandiri"
    "CIMB Niaga"
)

# Fungsi untuk mendapatkan index random
get_random_index() {
    local max=$1
    echo $((RANDOM % max))
}

# Fungsi untuk generate nomor telepon random
generate_phone() {
    local prefix=("021" "022" "024" "031" "061")
    local idx=$(get_random_index ${#prefix[@]})
    local number=$((RANDOM % 9000000 + 1000000))
    echo "${prefix[$idx]}$number"
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
    
    echo "Mengirim request untuk: $supplier_name"
    echo "JSON data: $json_data"
    
    local response=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "$SUPPLIER_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$json_data")
    
    local http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d':' -f2)
    local body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')
    
    echo "HTTP Code: $http_code"
    echo "Response body: $body"
    
    if [ -z "$body" ]; then
        echo "Response kosong - HTTP Code: $http_code"
        return 1
    fi
    
    if [ "$http_code" = "201" ] || echo "$body" | grep -q '"success":true\|"id":'; then
        echo "✓ Berhasil: $supplier_name"
        return 0
    else
        echo "✗ Gagal: $supplier_name - HTTP: $http_code, Body: $body"
        return 1
    fi
}

# Main script
echo "=== Script Generate 5 Supplier Sample (Debug) ==="
echo "Endpoint: $SUPPLIER_ENDPOINT"
echo "User: $USERNAME"
echo "Tenant ID: $TENANT_ID"
echo "Toko ID: $TOKO_ID"
echo ""

# Dapatkan token
TOKEN=$(get_auth_token)
if [ -z "$TOKEN" ]; then
    echo "Gagal mendapatkan token. Script dihentikan."
    exit 1
fi

echo ""
echo "Token berhasil didapat: ${TOKEN:0:20}..."
echo ""

# Inisialisasi counter
SUCCESS_COUNT=0
FAILED_COUNT=0
TOTAL_SUPPLIERS=5

echo "Mulai membuat $TOTAL_SUPPLIERS supplier..."
echo ""

# Loop untuk membuat supplier
for i in $(seq 1 $TOTAL_SUPPLIERS); do
    # Pilih data random
    supplier_idx=$(get_random_index ${#SUPPLIER_NAMES[@]})
    contact_idx=$(get_random_index ${#CONTACT_PERSONS[@]})
    city_idx=$(get_random_index ${#CITIES[@]})
    
    supplier_name="${SUPPLIER_NAMES[$supplier_idx]} $i"
    contact_person="${CONTACT_PERSONS[$contact_idx]}"
    phone=$(generate_phone)
    email=$(generate_email "$contact_person")
    city="${CITIES[$city_idx]}"
    
    echo "=== [$i/$TOTAL_SUPPLIERS] Membuat: $supplier_name ==="
    
    if create_supplier "$TOKEN" "$supplier_name" "$contact_person" "$phone" "$email" "$city"; then
        ((SUCCESS_COUNT++))
    else
        ((FAILED_COUNT++))
    fi
    
    echo ""
    sleep 1
done

echo ""
echo "=== HASIL AKHIR ==="
echo "Total supplier: $TOTAL_SUPPLIERS"
echo "Berhasil: $SUCCESS_COUNT"
echo "Gagal: $FAILED_COUNT"
echo ""

if [ $SUCCESS_COUNT -eq $TOTAL_SUPPLIERS ]; then
    echo "🎉 Selesai! Semua supplier berhasil dibuat."
else
    echo "⚠️  Selesai dengan beberapa kegagalan."
fi