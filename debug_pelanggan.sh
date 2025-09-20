#!/bin/bash

# Script debug untuk pelanggan API
API_BASE="http://localhost:3000/api"
LOGIN_ENDPOINT="$API_BASE/auth/login"
PELANGGAN_ENDPOINT="$API_BASE/pelanggan"

USERNAME="admintoko"
PASSWORD="123123123"
TENANT_ID="7f69ce68-9068-11f0-8eff-00155d24a169"

# Fungsi untuk mendapatkan token
get_auth_token() {
    echo "🔐 Mendapatkan token autentikasi..."
    
    local response=$(curl -s -X POST "$LOGIN_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\", \"tenantId\": \"$TENANT_ID\"}")
    
    echo "Response login: $response"
    
    # Parse token dari response JSON menggunakan jq jika tersedia, atau grep
    if command -v jq &> /dev/null; then
        local token=$(echo "$response" | jq -r '.data.token // empty')
    else
        local token=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    fi
    
    if [ -z "$token" ]; then
        echo "❌ Gagal mendapatkan token autentikasi"
        exit 1
    fi
    
    echo "✅ Token berhasil didapat: ${token:0:20}..."
    echo "$token"
}

# Test dengan data pelanggan sederhana
test_create_pelanggan() {
    local token=$1
    
    echo "🧪 Testing pembuatan pelanggan..."
    
    # Data pelanggan test yang sederhana
    local test_data='{
        "kode": "TEST001",
        "nama": "Test Pelanggan",
        "email": "test@email.com",
        "telepon": "08123456789",
        "alamat": "Jl. Test No. 1",
        "tipe": "reguler",
        "status": "aktif"
    }'
    
    echo "Endpoint: $PELANGGAN_ENDPOINT"
    echo "Token: Bearer ${token:0:20}..."
    echo "Data JSON:"
    echo "$test_data" | jq . 2>/dev/null || echo "$test_data"
    
    echo "Mengirim request..."
    local response=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME:%{time_total}" \
        -X POST "$PELANGGAN_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$test_data")
    
    local http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    local time_total=$(echo "$response" | grep "TIME:" | cut -d: -f2)
    local body=$(echo "$response" | sed '/HTTP_CODE:/d' | sed '/TIME:/d')
    
    echo "HTTP Code: $http_code"
    echo "Response Time: ${time_total}s"
    echo "Response Body:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
}

# Main
echo "🚀 Debug Pelanggan API"
echo "====================="

TOKEN=$(get_auth_token)
if [ -n "$TOKEN" ]; then
    test_create_pelanggan "$TOKEN"
else
    echo "❌ Tidak dapat melanjutkan tanpa token"
fi