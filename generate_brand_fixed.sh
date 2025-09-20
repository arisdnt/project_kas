#!/bin/bash

# Script untuk generate 100 brand sample untuk user admintoko
API_BASE_URL="http://localhost:3000/api"
LOGIN_ENDPOINT="$API_BASE_URL/auth/login"
BRAND_ENDPOINT="$API_BASE_URL/produk/master/brands"

USERNAME="admintoko"
PASSWORD="123123123"
TENANT_ID="3522829c-7535-45b9-acd0-2f26d40f338f"

get_auth_token() {
    RESPONSE=$(curl -s -X POST "$LOGIN_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\", \"tenantId\": \"$TENANT_ID\"}")
    
    TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "$TOKEN"
}

create_brand() {
    local token=$1
    local nama=$2
    local deskripsi=$3
    local urutan=$4
    
    RESPONSE=$(curl -s -X POST "$BRAND_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "{\"nama\": \"$nama\", \"deskripsi\": \"$deskripsi\"}")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "✅ Brand $urutan: $nama - Berhasil"
        return 0
    else
        echo "❌ Brand $urutan: $nama - Gagal: $RESPONSE"
        return 1
    fi
}

echo "Mendapatkan token..."
TOKEN=$(get_auth_token)

if [ -z "$TOKEN" ]; then
    echo "❌ Gagal mendapatkan token!"
    exit 1
fi

echo "✅ Token didapat: ${TOKEN:0:20}..."

BRANDS=("Faber-Castell" "Joyko" "Stabilo" "Pilot" "Snowman" "Kenko" "Artline" "Dong-A" "Sakura" "Staedtler")
DESCS=("Alat tulis berkualitas" "Produk kreatif" "Peralatan menggambar" "Alat tulis sekolah" "Produk seni")

SUCCESS=0
for i in $(seq 1 100); do
    NAME_IDX=$((RANDOM % ${#BRANDS[@]}))
    DESC_IDX=$((RANDOM % ${#DESCS[@]}))
    
    BRAND_NAME="${BRANDS[$NAME_IDX]} $i"
    BRAND_DESC="${DESCS[$DESC_IDX]}"
    
    if create_brand "$TOKEN" "$BRAND_NAME" "$BRAND_DESC" "$i"; then
        ((SUCCESS++))
    fi
    
    if [ $((i % 10)) -eq 0 ]; then
        echo "Progress: $i/100 (Success: $SUCCESS)"
    fi
    
    sleep 0.1
done

echo "Selesai! Berhasil: $SUCCESS/100"
