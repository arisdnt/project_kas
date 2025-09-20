#!/bin/bash

# Script untuk generate 100 brand sample untuk user admintoko
# Dibuat untuk TK DANIS 1 dengan tenant PT KETUA DANIS

# Konfigurasi API
API_BASE_URL="http://localhost:3000/api"
LOGIN_ENDPOINT="$API_BASE_URL/auth/login"
BRAND_ENDPOINT="$API_BASE_URL/produk/master/brands"

# Data login user admintoko
USERNAME="admintoko"
PASSWORD="123123123"
TENANT_ID="3522829c-7535-45b9-acd0-2f26d40f338f"
TOKO_ID="0f7e7f70-f83f-4096-b3ac-754ca281bdda"

# Fungsi untuk mendapatkan token
get_auth_token() {
    echo "Mendapatkan token autentikasi..."
    
    RESPONSE=$(curl -s -X POST "$LOGIN_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"$USERNAME\",
            \"password\": \"$PASSWORD\",
            \"tenantId\": \"$TENANT_ID\"
        }")
    
    TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        echo "❌ Gagal mendapatkan token!"
        echo "Response: $RESPONSE"
        exit 1
    fi
    
    echo "✅ Token berhasil didapat"
    echo "$TOKEN"
}

# Array nama brand untuk TK/PAUD
BRAND_NAMES=(
    "Faber-Castell" "Joyko" "Stabilo" "Pilot" "Snowman"
    "Kenko" "Artline" "Dong-A" "Sakura" "Staedtler"
    "Pentel" "Zebra" "Uni-ball" "Papermate" "BIC"
    "Crayola" "Titi" "Greebel" "Deli" "Kiky"
    "Standard" "Faster" "Bantex" "Lyra" "Giotto"
    "Pelikan" "Rotring" "Maped" "Helix" "Berol"
    "Tombow" "Sharpie" "Expo" "Prismacolor" "Conte"
    "Winsor Newton" "Derwent" "Faber" "Koh-i-noor" "Steadler"
    "Edding" "Marvy" "Copic" "Chameleon" "Spectrum Noir"
    "Promarker" "Touchnew" "Ohuhu" "Arteza" "Prisma"
    "Blick" "Liquitex" "Golden" "Amsterdam" "Talens"
    "Reeves" "Daler Rowney" "Cotman" "Van Gogh" "Rembrandt"
    "Schmincke" "Holbein" "Turner" "Nicker" "Kuretake"
    "Pentel Arts" "Uni Posca" "Molotow" "Montana" "Ironlak"
    "Belton" "Flame" "Loop" "Kobra" "Hardcore"
    "Rust-Oleum" "Krylon" "Dupli Color" "Tamiya" "Mr Color"
    "Vallejo" "Citadel" "Army Painter" "Reaper" "Scale75"
    "Andrea" "Kimera" "Warcolours" "Pro Acryl" "Monument"
    "Two Thin Coats" "Contrast" "Speedpaint" "Xpress" "Wash"
    "Shade" "Layer" "Base" "Technical" "Texture"
)

# Array deskripsi brand
BRAND_DESCRIPTIONS=(
    "Brand alat tulis premium untuk pendidikan anak"
    "Produk alat tulis berkualitas tinggi"
    "Spidol dan marker terbaik untuk pembelajaran"
    "Pulpen dan pensil mekanik berkualitas"
    "Alat tulis ramah anak dan aman"
    "Produk stationery untuk kebutuhan sekolah"
    "Marker dan spidol warna-warni"
    "Alat tulis Korea berkualitas tinggi"
    "Cat air dan alat lukis untuk anak"
    "Pensil dan alat gambar teknis"
    "Pulpen gel dan marker berkualitas"
    "Alat tulis Jepang premium"
    "Pulpen tinta gel halus"
    "Alat tulis Amerika terpercaya"
    "Pulpen dan pensil ekonomis"
    "Krayon dan cat air untuk anak"
    "Alat tulis lokal berkualitas"
    "Produk kreatif untuk pembelajaran"
    "Alat tulis kantor dan sekolah"
    "Produk stationery anak-anak"
    "Alat tulis standar berkualitas"
    "Produk tulis cepat dan praktis"
    "Organizer dan alat tulis kantor"
    "Pensil warna dan krayon"
    "Cat air dan alat lukis Italia"
    "Alat tulis teknis premium"
    "Compass dan alat gambar teknik"
    "Alat tulis Perancis berkualitas"
    "Penggaris dan alat ukur"
    "Pensil warna Inggris"
    "Brush pen dan kaligrafi"
    "Marker permanen berkualitas"
    "Marker presentasi dan papan tulis"
    "Pensil warna premium Amerika"
    "Krayon dan pastel Perancis"
    "Cat air profesional Inggris"
    "Pensil warna artist grade"
    "Marker alcohol based"
    "Pensil grafit premium Ceko"
    "Marker teknis Jerman"
    "Marker ilustrasi Jepang"
    "Marker alcohol premium"
    "Marker blending terbaik"
    "Marker spectrum warna lengkap"
    "Marker profesional Inggris"
    "Marker alcohol murah berkualitas"
    "Marker set lengkap"
    "Marker artist premium"
    "Marker blending Amerika"
    "Cat akrilik premium"
    "Cat akrilik heavy body"
    "Cat akrilik Belanda"
    "Cat akrilik Amsterdam"
    "Cat air premium Belanda"
    "Cat air student grade"
    "Cat air Inggris berkualitas"
    "Cat air portable set"
    "Cat air Van Gogh series"
    "Cat air artist grade"
    "Cat air premium Jerman"
    "Cat air Jepang berkualitas"
    "Cat air premium Turner"
    "Cat air tradisional Jepang"
    "Brush pen Jepang premium"
    "Marker arts premium"
    "Marker posca Jepang"
    "Marker premium Jerman"
    "Spray paint Montana"
    "Spray paint premium"
    "Spray paint Belton"
    "Spray paint Loop colors"
    "Spray paint Kobra"
    "Spray paint Hardcore"
    "Spray primer Rust-Oleum"
    "Spray paint Krylon"
    "Cat semprot otomotif"
    "Cat model Tamiya"
    "Cat model Mr Color"
    "Cat miniatur Vallejo"
    "Cat miniatur Games Workshop"
    "Cat miniatur Army Painter"
    "Cat miniatur Reaper"
    "Cat miniatur Scale75"
    "Cat miniatur Andrea"
    "Cat miniatur Kimera"
    "Cat miniatur Warcolours"
    "Cat akrilik Pro Acryl"
    "Cat miniatur Monument"
    "Cat contrast premium"
    "Cat contrast Citadel"
    "Cat speedpaint Army Painter"
    "Cat express color"
    "Cat wash premium"
    "Cat shade Citadel"
    "Cat layer premium"
    "Cat base Citadel"
    "Cat technical effects"
    "Cat texture premium"
)

# Fungsi untuk mendapatkan random index
get_random_index() {
    local max=$1
    echo $((RANDOM % max))
}

# Fungsi untuk membuat brand
create_brand() {
    local token=$1
    local nama=$2
    local deskripsi=$3
    local urutan=$4
    
    RESPONSE=$(curl -s -X POST "$BRAND_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "{
            \"nama\": \"$nama\",
            \"deskripsi\": \"$deskripsi\"
        }")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "✅ Brand $urutan: $nama - Berhasil"
        return 0
    else
        echo "❌ Brand $urutan: $nama - Gagal"
        if [ ${#RESPONSE} -gt 0 ]; then
            echo "Response: $RESPONSE"
        else
            echo "Response kosong - kemungkinan masalah koneksi atau server"
        fi
        return 1
    fi
}

# Main script
echo "=================================="
echo "Generate 100 Brand Sample Data"
echo "Tenant: PT KETUA DANIS"
echo "Toko: TK DANIS 1"
echo "=================================="

# Dapatkan token
echo "Mendapatkan token autentikasi..."
TOKEN=$(get_auth_token)

if [ -z "$TOKEN" ]; then
    echo "❌ Gagal mendapatkan token! Script dihentikan."
    exit 1
fi

echo "✅ Token berhasil didapat: ${TOKEN:0:20}..."

# Counters
SUCCESS_COUNT=0
ERROR_COUNT=0
TOTAL_BRANDS=100

echo ""
echo "Mulai membuat $TOTAL_BRANDS brand..."
echo ""

# Loop untuk membuat 100 brand
for i in $(seq 1 $TOTAL_BRANDS); do
    # Pilih nama dan deskripsi secara acak
    NAME_INDEX=$(get_random_index ${#BRAND_NAMES[@]})
    DESC_INDEX=$(get_random_index ${#BRAND_DESCRIPTIONS[@]})
    
    BRAND_NAME="${BRAND_NAMES[$NAME_INDEX]}"
    BRAND_DESC="${BRAND_DESCRIPTIONS[$DESC_INDEX]}"
    
    # Tambahkan nomor jika brand sudah ada
    if [ $i -gt ${#BRAND_NAMES[@]} ]; then
        SUFFIX=$((i - ${#BRAND_NAMES[@]}))
        BRAND_NAME="$BRAND_NAME $SUFFIX"
    fi
    
    # Buat brand
    if create_brand "$TOKEN" "$BRAND_NAME" "$BRAND_DESC" "$i"; then
        ((SUCCESS_COUNT++))
    else
        ((ERROR_COUNT++))
    fi
    
    # Progress setiap 10 brand
    if [ $((i % 10)) -eq 0 ]; then
        echo "Progress: $i/$TOTAL_BRANDS brand (Success: $SUCCESS_COUNT, Error: $ERROR_COUNT)"
    fi
    
    # Delay kecil untuk menghindari rate limiting
    sleep 0.1
done

echo ""
echo "=================================="
echo "Pembuatan brand selesai!"
echo "Total: $TOTAL_BRANDS brand"
echo "Berhasil: $SUCCESS_COUNT brand"
echo "Gagal: $ERROR_COUNT brand"
echo "=================================="