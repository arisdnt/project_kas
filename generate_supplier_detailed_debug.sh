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
    echo "=== MENDAPATKAN TOKEN AUTENTIKASI ==="
    local response=$(curl -s -X POST "$LOGIN_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\", \"tenantId\": \"$TENANT_ID\"}")
    
    echo "Login response: $response"
    
    local token=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        echo "❌ Gagal mendapatkan token. Response: $response"
        exit 1
    fi
    
    echo "✓ Token berhasil didapat: ${token:0:30}..."
    echo "$token"
}

# Fungsi untuk membuat supplier dengan debug lengkap
create_supplier_debug() {
    local token=$1
    local supplier_name=$2
    local contact_person=$3
    local phone=$4
    local email=$5
    local address=$6
    
    echo ""
    echo "=== DEBUG SUPPLIER: $supplier_name ==="
    echo "Endpoint: $SUPPLIER_ENDPOINT"
    echo "Token: ${token:0:30}..."
    
    local json_data="{\"tenant_id\": \"$TENANT_ID\", \"toko_id\": \"$TOKO_ID\", \"nama\": \"$supplier_name\", \"kontak_person\": \"$contact_person\", \"telepon\": \"$phone\", \"email\": \"$email\", \"alamat\": \"$address\", \"status\": \"aktif\"}"
    
    echo "JSON Data:"
    echo "$json_data" | jq . 2>/dev/null || echo "$json_data"
    
    echo ""
    echo "Mengirim request..."
    
    # Simpan response lengkap dengan header
    local temp_file=$(mktemp)
    local response=$(curl -s -w "HTTPCODE:%{http_code}\nTIME:%{time_total}" \
        -X POST "$SUPPLIER_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$json_data" \
        -o "$temp_file")
    
    local http_code=$(echo "$response" | grep "HTTPCODE:" | cut -d':' -f2)
    local time_total=$(echo "$response" | grep "TIME:" | cut -d':' -f2)
    local body=$(cat "$temp_file")
    
    echo "HTTP Code: $http_code"
    echo "Response Time: ${time_total}s"
    echo "Response Body:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    
    # Cleanup
    rm -f "$temp_file"
    
    if [ "$http_code" = "201" ] || echo "$body" | grep -q '"success":true\|"id":'; then
        echo "✓ Status: BERHASIL"
        return 0
    else
        echo "✗ Status: GAGAL"
        return 1
    fi
}

# Main script
echo "=== SUPPLIER DEBUG SCRIPT ==="
echo "Endpoint: $SUPPLIER_ENDPOINT"
echo "Tenant ID: $TENANT_ID"
echo "Toko ID: $TOKO_ID"
echo ""

# Dapatkan token
TOKEN=$(get_auth_token)

echo ""
echo "=== TESTING 3 SUPPLIER SAMPLE ==="

# Test 1
create_supplier_debug "$TOKEN" \
    "PT Test Supplier 1" \
    "Budi Santoso" \
    "0211234567" \
    "budi@test.com" \
    "Jl. Test No. 1, Jakarta"

# Test 2  
create_supplier_debug "$TOKEN" \
    "CV Test Supplier 2" \
    "Siti Nurhaliza" \
    "0221234568" \
    "siti@test.com" \
    "Jl. Test No. 2, Bandung"

# Test 3
create_supplier_debug "$TOKEN" \
    "UD Test Supplier 3" \
    "Ahmad Fauzi" \
    "0241234569" \
    "ahmad@test.com" \
    "Jl. Test No. 3, Semarang"

echo ""
echo "=== DEBUG SELESAI ==="