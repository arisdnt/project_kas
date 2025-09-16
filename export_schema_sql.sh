#!/bin/bash

# Script untuk mengekspor skema database tanpa data menggunakan mysqldump
# Hanya mengekspor struktur tabel saja

# Konfigurasi database dari file .env
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="arkan"
DB_PASSWORD="Arkan123!@#"
DB_NAME="kasir"

# Nama file output dengan timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="database/schema_only_${TIMESTAMP}.sql"

# Buat direktori database jika belum ada
mkdir -p database

# Ekspor skema database tanpa data
echo "Mengekspor skema database tanpa data..."
mysqldump \
  --host=${DB_HOST} \
  --port=${DB_PORT} \
  --user=${DB_USER} \
  --password=${DB_PASSWORD} \
  --no-data \
  --routines \
  --triggers \
  --events \
  ${DB_NAME} > ${OUTPUT_FILE}

# Periksa apakah ekspor berhasil
if [ $? -eq 0 ]; then
  echo "Skema database berhasil diekspor ke ${OUTPUT_FILE}"
  echo "File berisi struktur tabel, routines, triggers, dan events tanpa data"
else
  echo "Gagal mengekspor skema database"
  exit 1
fi