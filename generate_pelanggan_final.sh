#!/bin/bash

# Script untuk generate data pelanggan dengan format tanggal yang benar
# Menggunakan ISO string format untuk tanggal_lahir

BASE_URL="http://localhost:3000/api"
TENANT_ID="3522829c-7535-45b9-acd0-2f26d40f338f"
TOKO_ID="0f7e7f70-f83f-4096-b3ac-754ca281bdda"

echo "=== Login untuk mendapatkan token ==="

# Login request dengan tenant_id
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"admintoko\",
    \"password\": \"123123123\",
    \"tenantId\": \"$TENANT_ID\"
  }")

echo "Login response: $LOGIN_RESPONSE"

# Extract token dengan metode yang benar
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login gagal!"
  exit 1
fi

echo "Token berhasil diperoleh: ${TOKEN:0:20}..."

echo ""
echo "=== Membuat data pelanggan ==="

SUCCESS_COUNT=0
FAILED_COUNT=0
TOTAL_COUNT=50

for i in $(seq 1 $TOTAL_COUNT); do
  # Generate data pelanggan dengan tanggal dalam format ISO string
  BIRTH_YEAR=$((1970 + RANDOM % 40))  # 1970-2009
  BIRTH_MONTH=$(printf "%02d" $((1 + RANDOM % 12)))  # 01-12
  BIRTH_DAY=$(printf "%02d" $((1 + RANDOM % 28)))    # 01-28
  BIRTH_DATE="${BIRTH_YEAR}-${BIRTH_MONTH}-${BIRTH_DAY}T00:00:00.000Z"
  
  # Random jenis kelamin yang valid
  GENDERS=("L" "P")
  GENDER=${GENDERS[$((RANDOM % 2))]}
  
  # Random tipe pelanggan
  TYPES=("reguler" "vip" "member" "wholesale")
  TYPE=${TYPES[$((RANDOM % 4))]}
  
  PELANGGAN_DATA="{
    \"tenant_id\": \"$TENANT_ID\",
    \"toko_id\": \"$TOKO_ID\",
    \"kode\": \"CUST$(printf "%03d" $i)\",
    \"nama\": \"Pelanggan Test $i\",
    \"email\": \"pelanggan$i@test.com\",
    \"telepon\": \"08123456$(printf "%03d" $i)\",
    \"alamat\": \"Alamat Test $i\",
    \"tanggal_lahir\": \"$BIRTH_DATE\",
    \"jenis_kelamin\": \"$GENDER\",
    \"pekerjaan\": \"Pekerjaan $i\",
    \"tipe\": \"$TYPE\",
    \"diskon_persen\": $((RANDOM % 21)),
    \"limit_kredit\": $((RANDOM % 10000000)),
    \"status\": \"aktif\"
  }"
  
  echo "Membuat pelanggan $i..."
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/pelanggan" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$PELANGGAN_DATA")
  
  # Check if successful (contains "success":true)
  if echo "$RESPONSE" | grep -q '"success":true'; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo "✓ Pelanggan $i berhasil dibuat"
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
    echo "✗ Pelanggan $i gagal dibuat"
    echo "Response: $RESPONSE"
  fi
  
  # Small delay to avoid overwhelming the server
  sleep 0.1
done

echo ""
echo "=== Ringkasan ==="
echo "Berhasil: $SUCCESS_COUNT"
echo "Gagal: $FAILED_COUNT"
echo "Total: $TOTAL_COUNT"

if [ $SUCCESS_COUNT -gt 0 ]; then
  echo "✓ Script berhasil membuat $SUCCESS_COUNT pelanggan"
  exit 0
else
  echo "✗ Tidak ada pelanggan yang berhasil dibuat"
  exit 1
fi