#!/bin/bash

# Script untuk membuat 200 data pelanggan realistis
# Menggunakan endpoint API pelanggan dengan autentikasi

# Konfigurasi API
API_BASE="http://localhost:3000/api"
LOGIN_ENDPOINT="$API_BASE/auth/login"
PELANGGAN_ENDPOINT="$API_BASE/pelanggan"

# Kredensial untuk user admintoko
USERNAME="admintoko"
PASSWORD="123123123"
TENANT_ID="7f69ce68-9068-11f0-8eff-00155d24a169"

# Fungsi untuk mendapatkan token autentikasi dan info user
get_auth_info() {
    echo "🔐 Mendapatkan token autentikasi..."
    
    local response=$(curl -s -X POST "$LOGIN_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\", \"tenantId\": \"$TENANT_ID\"}")
    
    echo "Response login: $response"
    
    # Parse token dari response JSON
    local token=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    local tenant_id=$(echo "$response" | grep -o '"tenantId":"[^"]*"' | cut -d'"' -f4)
    local toko_id=$(echo "$response" | grep -o '"tokoId":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ] || [ -z "$tenant_id" ] || [ -z "$toko_id" ]; then
        echo "❌ Gagal mendapatkan informasi autentikasi"
        echo "Token: $token"
        echo "Tenant ID: $tenant_id"
        echo "Toko ID: $toko_id"
        exit 1
    fi
    
    echo "✅ Autentikasi berhasil"
    echo "Token: ${token:0:20}..."
    echo "Tenant ID: $tenant_id"
    echo "Toko ID: $toko_id"
    
    # Return sebagai string yang bisa di-parse
    echo "$token|$tenant_id|$toko_id"
}

# Data sample nama Indonesia
NAMA_DEPAN=("Ahmad" "Budi" "Citra" "Dewi" "Eko" "Fitri" "Gunawan" "Hani" "Indra" "Joko" "Kartika" "Lina" "Made" "Nita" "Oka" "Putri" "Qori" "Rina" "Sari" "Tono" "Udin" "Vina" "Wati" "Xena" "Yudi" "Zara" "Agus" "Bayu" "Candra" "Dian" "Edi" "Fajar" "Gita" "Hendra" "Ika" "Jaka" "Kiki" "Lusi" "Maya" "Nanda" "Oki" "Prita" "Qila" "Rudi" "Sinta" "Tari" "Umi" "Vera" "Wawan" "Yani")

NAMA_BELAKANG=("Pratama" "Sari" "Wijaya" "Putri" "Santoso" "Lestari" "Kurniawan" "Dewi" "Setiawan" "Maharani" "Gunawan" "Anggraini" "Susanto" "Rahayu" "Permana" "Safitri" "Nugroho" "Wulandari" "Hidayat" "Kusuma" "Rahman" "Indah" "Hakim" "Melati" "Saputra" "Cahaya" "Wardana" "Sinta" "Purnama" "Ayu" "Ramadan" "Kartika" "Surya" "Mawar" "Bahari" "Cempaka" "Ananda" "Bunga" "Perdana" "Kenanga")

# Data sample kota Indonesia
KOTA=("Jakarta" "Surabaya" "Bandung" "Medan" "Semarang" "Makassar" "Palembang" "Tangerang" "Depok" "Bekasi" "Bogor" "Batam" "Pekanbaru" "Bandar Lampung" "Malang" "Padang" "Denpasar" "Samarinda" "Tasikmalaya" "Pontianak" "Cimahi" "Balikpapan" "Jambi" "Surakarta" "Manado" "Yogyakarta" "Cilegon" "Kupang" "Palu" "Ambon")

# Data sample pekerjaan
PEKERJAAN=("Pegawai Swasta" "Wiraswasta" "PNS" "Guru" "Dokter" "Perawat" "Insinyur" "Akuntan" "Pedagang" "Petani" "Nelayan" "Sopir" "Tukang" "Mahasiswa" "Ibu Rumah Tangga" "Pensiunan" "Buruh" "Karyawan" "Konsultan" "Teknisi")

# Fungsi untuk generate data pelanggan random
generate_pelanggan_data() {
    local index=$1
    local tenant_id=$2
    local toko_id=$3
    
    # Generate nama random
    local nama_depan=${NAMA_DEPAN[$((RANDOM % ${#NAMA_DEPAN[@]}))]}
    local nama_belakang=${NAMA_BELAKANG[$((RANDOM % ${#NAMA_BELAKANG[@]}))]}
    local nama="$nama_depan $nama_belakang"
    
    # Generate kode pelanggan unik
    local kode=$(printf "PLG%03d" $index)
    
    # Generate email
    local email_prefix=$(echo "$nama_depan$nama_belakang" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
    local email="$email_prefix$index@email.com"
    
    # Generate telepon (08xxxxxxxxxx)
    local telepon="08$(printf "%010d" $((RANDOM * RANDOM % 10000000000)))"
    
    # Generate alamat
    local kota=${KOTA[$((RANDOM % ${#KOTA[@]}))]}
    local jalan="Jl. $(echo ${NAMA_BELAKANG[$((RANDOM % ${#NAMA_BELAKANG[@]}))]} | tr '[:upper:]' '[:lower:]')"
    local nomor=$((RANDOM % 100 + 1))
    local alamat="$jalan No. $nomor, $kota"
    
    # Generate jenis kelamin
    local jenis_kelamin_array=("pria" "wanita")
    local jenis_kelamin=${jenis_kelamin_array[$((RANDOM % 2))]}
    
    # Generate pekerjaan
    local pekerjaan=${PEKERJAAN[$((RANDOM % ${#PEKERJAAN[@]}))]}
    
    # Generate tipe pelanggan (mayoritas reguler)
    local tipe_array=("reguler" "reguler" "reguler" "reguler" "member" "member" "vip" "wholesale")
    local tipe=${tipe_array[$((RANDOM % ${#tipe_array[@]}))]}
    
    # Generate diskon berdasarkan tipe
    local diskon=0
    case $tipe in
        "member") diskon=$((RANDOM % 5 + 5)) ;;  # 5-10%
        "vip") diskon=$((RANDOM % 10 + 10)) ;;   # 10-20%
        "wholesale") diskon=$((RANDOM % 15 + 15)) ;; # 15-30%
    esac
    
    # Generate limit kredit berdasarkan tipe
    local limit_kredit=0
    case $tipe in
        "member") limit_kredit=$((RANDOM % 5000000 + 1000000)) ;;     # 1-6 juta
        "vip") limit_kredit=$((RANDOM % 10000000 + 5000000)) ;;       # 5-15 juta
        "wholesale") limit_kredit=$((RANDOM % 20000000 + 10000000)) ;; # 10-30 juta
    esac
    
    # Generate tanggal lahir (umur 18-65 tahun)
    local tahun_lahir=$((2024 - (RANDOM % 48 + 18)))
    local bulan_lahir=$(printf "%02d" $((RANDOM % 12 + 1)))
    local hari_lahir=$(printf "%02d" $((RANDOM % 28 + 1)))
    local tanggal_lahir="$tahun_lahir-$bulan_lahir-$hari_lahir"
    
    # Buat JSON data dengan tenant_id dan toko_id
    cat <<EOF
{
    "tenant_id": "$tenant_id",
    "toko_id": "$toko_id",
    "kode": "$kode",
    "nama": "$nama",
    "email": "$email",
    "telepon": "$telepon",
    "alamat": "$alamat",
    "tanggal_lahir": "$tanggal_lahir",
    "jenis_kelamin": "$jenis_kelamin",
    "pekerjaan": "$pekerjaan",
    "tipe": "$tipe",
    "diskon_persen": $diskon,
    "limit_kredit": $limit_kredit,
    "status": "aktif"
}
EOF
}

# Fungsi untuk membuat pelanggan via API
create_pelanggan() {
    local token=$1
    local data=$2
    local index=$3
    
    local response=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME:%{time_total}" \
        -X POST "$PELANGGAN_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$data")
    
    local http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    local time_total=$(echo "$response" | grep "TIME:" | cut -d: -f2)
    local body=$(echo "$response" | sed '/HTTP_CODE:/d' | sed '/TIME:/d')
    
    if [ "$http_code" = "201" ]; then
        echo "✅ Pelanggan $index berhasil dibuat (${time_total}s)"
        return 0
    else
        echo "❌ Pelanggan $index gagal dibuat - HTTP $http_code"
        echo "Response: $body"
        return 1
    fi
}

# Main script
echo "🚀 Memulai pembuatan 200 data pelanggan..."
echo "=========================================="

# Dapatkan informasi autentikasi
AUTH_INFO=$(get_auth_info)
if [ -z "$AUTH_INFO" ]; then
    echo "❌ Tidak dapat melanjutkan tanpa informasi autentikasi"
    exit 1
fi

# Parse informasi autentikasi
TOKEN=$(echo "$AUTH_INFO" | cut -d'|' -f1)
TENANT_ID_REAL=$(echo "$AUTH_INFO" | cut -d'|' -f2)
TOKO_ID=$(echo "$AUTH_INFO" | cut -d'|' -f3)

echo "Menggunakan:"
echo "- Tenant ID: $TENANT_ID_REAL"
echo "- Toko ID: $TOKO_ID"
echo ""

# Counter untuk tracking
SUCCESS_COUNT=0
FAILED_COUNT=0

# Loop untuk membuat 200 pelanggan
for i in {1..200}; do
    echo "📝 Membuat pelanggan $i/200..."
    
    # Generate data pelanggan
    PELANGGAN_DATA=$(generate_pelanggan_data $i "$TENANT_ID_REAL" "$TOKO_ID")
    
    # Kirim request ke API
    if create_pelanggan "$TOKEN" "$PELANGGAN_DATA" $i; then
        ((SUCCESS_COUNT++))
    else
        ((FAILED_COUNT++))
    fi
    
    # Progress indicator setiap 10 pelanggan
    if [ $((i % 10)) -eq 0 ]; then
        echo "📊 Progress: $i/200 - Berhasil: $SUCCESS_COUNT, Gagal: $FAILED_COUNT"
    fi
    
    # Delay kecil untuk menghindari rate limiting
    sleep 0.1
done

echo "=========================================="
echo "🎯 Pembuatan pelanggan selesai!"
echo "✅ Berhasil: $SUCCESS_COUNT"
echo "❌ Gagal: $FAILED_COUNT"

if [ $SUCCESS_COUNT -eq 200 ]; then
    echo "🎉 Semua pelanggan berhasil dibuat!"
else
    echo "⚠️  Ada $FAILED_COUNT pelanggan yang gagal dibuat"
fi