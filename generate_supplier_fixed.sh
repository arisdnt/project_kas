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
    "CV Harapan Indah"
    "PT Karya Utama"
    "UD Sinar Terang"
    "PT Maju Bersama"
    "CV Bahagia Sentosa"
    "PT Gemilang Jaya"
    "UD Rizki Barokah"
    "PT Sejahtera Abadi"
    "CV Mulia Indah"
    "PT Bintang Terang"
    "UD Surya Kencana"
    "PT Anugerah Jaya"
    "CV Citra Mandiri"
    "PT Duta Perdana"
    "UD Fajar Harapan"
    "PT Global Makmur"
    "CV Harmoni Sejati"
    "PT Indah Permai"
    "UD Jaya Abadi"
    "PT Kencana Emas"
    "CV Lestari Indah"
    "PT Mega Sukses"
    "UD Nusantara Jaya"
    "PT Omega Prima"
    "CV Persada Indah"
    "PT Quantum Sukses"
    "UD Rajawali Mas"
    "PT Sentosa Makmur"
    "CV Tirta Jaya"
    "PT Utama Prima"
    "UD Visi Mandiri"
    "PT Wijaya Karya"
    "CV Xtra Sukses"
    "PT Yudha Jaya"
    "UD Zona Prima"
)

CONTACT_PERSONS=(
    "Budi Santoso"
    "Siti Nurhaliza"
    "Ahmad Fauzi"
    "Dewi Sartika"
    "Rudi Hermawan"
    "Maya Sari"
    "Eko Prasetyo"
    "Rina Wati"
    "Doni Setiawan"
    "Lina Marlina"
    "Agus Salim"
    "Fitri Handayani"
    "Bambang Wijaya"
    "Sri Mulyani"
    "Hendra Gunawan"
    "Ratna Sari"
    "Joko Susilo"
    "Indah Permata"
    "Wahyu Nugroho"
    "Sari Dewi"
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
    "Yogyakarta"
    "Malang"
    "Solo"
    "Bogor"
    "Batam"
    "Pekanbaru"
    "Bandar Lampung"
    "Padang"
    "Denpasar"
    "Samarinda"
)

BANKS=(
    "BCA"
    "BRI"
    "BNI"
    "Mandiri"
    "CIMB Niaga"
    "Danamon"
    "Permata"
    "Maybank"
    "OCBC NISP"
    "Panin"
)

# Fungsi untuk mendapatkan index random
get_random_index() {
    local max=$1
    echo $((RANDOM % max))
}

# Fungsi untuk generate nomor telepon random
generate_phone() {
    local prefix=("021" "022" "024" "031" "061" "0274" "0341" "0271" "0251" "0778")
    local idx=$(get_random_index ${#prefix[@]})
    local number=$((RANDOM % 9000000 + 1000000))
    echo "${prefix[$idx]}$number"
}

# Fungsi untuk generate email
generate_email() {
    local name=$1
    local domain=("gmail.com" "yahoo.com" "hotmail.com" "outlook.com" "company.co.id")
    local idx=$(get_random_index ${#domain[@]})
    local clean_name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
    echo "${clean_name}@${domain[$idx]}"
}

# Fungsi untuk generate NPWP
generate_npwp() {
    local npwp=""
    for i in {1..15}; do
        npwp="${npwp}$((RANDOM % 10))"
    done
    echo "$npwp"
}

# Fungsi untuk generate nomor rekening
generate_account() {
    local length=$((RANDOM % 5 + 10))
    local account=""
    for i in $(seq 1 $length); do
        account="${account}$((RANDOM % 10))"
    done
    echo "$account"
}

# Fungsi untuk membuat supplier
create_supplier() {
    local token=$1
    local supplier_name=$2
    local contact_person=$3
    local phone=$4
    local email=$5
    local city=$6
    local npwp=$7
    local bank_name=$8
    local bank_account=$9
    local bank_holder=${10}
    
    local address="Jl. Raya $city No. $((RANDOM % 999 + 1)), $city"
    
    local json_data="{\"tenant_id\": \"$TENANT_ID\", \"toko_id\": \"$TOKO_ID\", \"nama\": \"$supplier_name\", \"kontak_person\": \"$contact_person\", \"telepon\": \"$phone\", \"email\": \"$email\", \"alamat\": \"$address\", \"npwp\": \"$npwp\", \"bank_nama\": \"$bank_name\", \"bank_rekening\": \"$bank_account\", \"bank_atas_nama\": \"$bank_holder\", \"status\": \"aktif\"}"
    
    local response=$(curl -s -X POST "$SUPPLIER_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$json_data")
    
    if [ -z "$response" ]; then
        echo "Response kosong - kemungkinan masalah koneksi atau server"
        return 1
    fi
    
    if echo "$response" | grep -q '"success":true\|"id":'; then
        echo "✓ Berhasil: $supplier_name"
        return 0
    else
        echo "✗ Gagal: $supplier_name - $response"
        return 1
    fi
}

# Main script
echo "=== Script Generate 200 Supplier Sample ==="
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

echo "Token berhasil didapat: ${TOKEN:0:20}..."
echo ""

# Inisialisasi counter
SUCCESS_COUNT=0
FAILED_COUNT=0
TOTAL_SUPPLIERS=200

echo "Mulai membuat $TOTAL_SUPPLIERS supplier..."
echo ""

# Loop untuk membuat supplier
for i in $(seq 1 $TOTAL_SUPPLIERS); do
    # Pilih data random
    supplier_idx=$(get_random_index ${#SUPPLIER_NAMES[@]})
    contact_idx=$(get_random_index ${#CONTACT_PERSONS[@]})
    city_idx=$(get_random_index ${#CITIES[@]})
    bank_idx=$(get_random_index ${#BANKS[@]})
    
    supplier_name="${SUPPLIER_NAMES[$supplier_idx]} $i"
    contact_person="${CONTACT_PERSONS[$contact_idx]}"
    phone=$(generate_phone)
    email=$(generate_email "$contact_person")
    city="${CITIES[$city_idx]}"
    npwp=$(generate_npwp)
    bank_name="${BANKS[$bank_idx]}"
    bank_account=$(generate_account)
    bank_holder="$contact_person"
    
    echo "[$i/$TOTAL_SUPPLIERS] Membuat: $supplier_name"
    
    if create_supplier "$TOKEN" "$supplier_name" "$contact_person" "$phone" "$email" "$city" "$npwp" "$bank_name" "$bank_account" "$bank_holder"; then
        ((SUCCESS_COUNT++))
    else
        ((FAILED_COUNT++))
    fi
    
    # Progress setiap 10 supplier
    if [ $((i % 10)) -eq 0 ]; then
        echo "Progress: $i/$TOTAL_SUPPLIERS (Berhasil: $SUCCESS_COUNT, Gagal: $FAILED_COUNT)"
        echo ""
    fi
    
    # Delay kecil untuk menghindari rate limiting
    sleep 0.1
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