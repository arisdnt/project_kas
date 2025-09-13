#!/bin/bash

# Script Backup Database MySQL
# Membuat backup seluruh database MySQL dalam satu file SQL
# Author: System Administrator
# Date: $(date +%Y-%m-%d)

# Konfigurasi database
DB_USER="arkan"
DB_PASSWORD="Arkan123!@#"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="kasir"

# Direktori backup
BACKUP_DIR="/home/arka/project_kas/database"

# Konfigurasi tabel yang akan di-backup
# OPSI 1: Backup tabel spesifik - isi array dengan nama tabel yang diinginkan
# Contoh: BACKUP_TABLES=("users" "brand" "kategori" "produk" "transaksi")
# OPSI 2: Backup semua tabel - kosongkan array BACKUP_TABLES=()
BACKUP_TABLES=()

# Tabel yang akan dikecualikan dari backup (hanya berlaku jika BACKUP_TABLES kosong)
# Berguna untuk mengecualikan tabel temporary, log, atau cache
# Contoh: EXCLUDE_TABLES=("audit_log" "sessions" "temp_data" "cache")
EXCLUDE_TABLES=("sessions" "temp_data")

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fungsi untuk menampilkan pesan dengan warna
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Fungsi untuk menampilkan header
print_header() {
    echo "="
    print_message $BLUE "🗄️  MySQL Database Backup Script"
    print_message $BLUE "📅 $(date '+%Y-%m-%d %H:%M:%S')"
    echo "="
}

# Fungsi untuk menampilkan konfigurasi backup
show_backup_config() {
    print_message $YELLOW "⚙️  Konfigurasi Backup:"
    print_message $BLUE "   📊 Database: $DB_NAME"
    
    if [ ${#BACKUP_TABLES[@]} -gt 0 ]; then
        print_message $BLUE "   📋 Tabel spesifik: ${BACKUP_TABLES[*]}"
    else
        if [ ${#EXCLUDE_TABLES[@]} -gt 0 ]; then
            print_message $BLUE "   📋 Semua tabel kecuali: ${EXCLUDE_TABLES[*]}"
        else
            print_message $BLUE "   📋 Semua tabel dalam database"
        fi
    fi
    echo
}

# Fungsi untuk membuat direktori backup
create_backup_directory() {
    print_message $YELLOW "📁 Memeriksa direktori backup..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_message $YELLOW "📂 Membuat direktori backup: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
        
        if [ $? -eq 0 ]; then
            print_message $GREEN "✅ Direktori backup berhasil dibuat"
        else
            print_message $RED "❌ Gagal membuat direktori backup"
            exit 1
        fi
    else
        print_message $GREEN "✅ Direktori backup sudah ada"
    fi
}

# Fungsi untuk menghasilkan nama file backup
generate_backup_filename() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    echo "${BACKUP_DIR}/mysql_backup_${timestamp}.sql"
}

# Fungsi untuk memeriksa koneksi database
check_database_connection() {
    print_message $YELLOW "🔌 Memeriksa koneksi database..."
    
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ Koneksi database berhasil"
        return 0
    else
        print_message $RED "❌ Gagal terhubung ke database"
        print_message $RED "   Periksa kredensial database dan pastikan MySQL server berjalan"
        return 1
    fi
}

# Fungsi untuk mendapatkan daftar database
get_database_list() {
    print_message $YELLOW "📋 Mengambil daftar database..."
    
    local databases=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SHOW DATABASES;" 2>/dev/null | grep -Ev "^(Database|information_schema|performance_schema|mysql|sys)$")
    
    if [ -n "$databases" ]; then
        print_message $GREEN "✅ Ditemukan database untuk backup:"
        echo "$databases" | while read db; do
            print_message $BLUE "   - $db"
        done
        echo "$databases"
    else
        print_message $YELLOW "⚠️  Tidak ada database user yang ditemukan"
        echo ""
    fi
}

# Fungsi untuk melakukan backup database
perform_backup() {
    local backup_file=$1
    
    print_message $YELLOW "💾 Memulai proses backup..."
    print_message $BLUE "📄 File backup: $backup_file"
    
    # Membangun parameter mysqldump berdasarkan konfigurasi tabel
    local mysqldump_params="-h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD --single-transaction --routines --triggers --add-drop-database --comments --dump-date"
    
    if [ ${#BACKUP_TABLES[@]} -gt 0 ]; then
        # Backup tabel spesifik
        print_message $BLUE "📋 Backup tabel spesifik: ${BACKUP_TABLES[*]}"
        mysqldump $mysqldump_params $DB_NAME ${BACKUP_TABLES[*]} > "$backup_file" 2>/dev/null
    else
        # Backup semua tabel kecuali yang dikecualikan
        if [ ${#EXCLUDE_TABLES[@]} -gt 0 ]; then
            print_message $BLUE "📋 Backup semua tabel kecuali: ${EXCLUDE_TABLES[*]}"
            local ignore_params=""
            for table in "${EXCLUDE_TABLES[@]}"; do
                ignore_params="$ignore_params --ignore-table=$DB_NAME.$table"
            done
            mysqldump $mysqldump_params $ignore_params --databases $DB_NAME > "$backup_file" 2>/dev/null
        else
            print_message $BLUE "📋 Backup semua tabel dalam database $DB_NAME"
            mysqldump $mysqldump_params --databases $DB_NAME > "$backup_file" 2>/dev/null
        fi
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        return 0
    else
        return $exit_code
    fi
}

# Fungsi untuk memverifikasi file backup
verify_backup() {
    local backup_file=$1
    
    if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
        local file_size=$(du -h "$backup_file" | cut -f1)
        print_message $GREEN "✅ File backup berhasil dibuat"
        print_message $BLUE "📊 Ukuran file: $file_size"
        print_message $BLUE "📍 Lokasi: $backup_file"
        return 0
    else
        print_message $RED "❌ File backup tidak ditemukan atau kosong"
        return 1
    fi
}

# Fungsi untuk membersihkan file backup yang gagal
cleanup_failed_backup() {
    local backup_file=$1
    
    if [ -f "$backup_file" ]; then
        print_message $YELLOW "🧹 Membersihkan file backup yang gagal..."
        rm -f "$backup_file"
    fi
}

# Fungsi utama
main() {
    print_header
    show_backup_config
    
    # Step 1: Membuat direktori backup
    create_backup_directory
    
    # Step 2: Memeriksa koneksi database
    if ! check_database_connection; then
        exit 1
    fi
    
    # Step 3: Menghasilkan nama file backup
    local backup_file=$(generate_backup_filename)
    
    # Step 4: Mendapatkan daftar database
    local databases=$(get_database_list)
    
    # Step 5: Melakukan backup
    if perform_backup "$backup_file"; then
        # Step 6: Memverifikasi backup
        if verify_backup "$backup_file"; then
            print_message $GREEN "🎉 Backup database berhasil diselesaikan!"
            print_message $GREEN "📅 Waktu selesai: $(date '+%Y-%m-%d %H:%M:%S')"
            echo "="
            exit 0
        else
            cleanup_failed_backup "$backup_file"
            print_message $RED "❌ Verifikasi backup gagal"
            exit 1
        fi
    else
        cleanup_failed_backup "$backup_file"
        print_message $RED "❌ Proses backup gagal"
        print_message $RED "   Periksa log error dan coba lagi"
        exit 1
    fi
}

# Menjalankan fungsi utama
main "$@"