#!/bin/bash

# Script untuk mengekspor skema database ke CSV
# Menggunakan INFORMATION_SCHEMA untuk mendapatkan struktur tabel

echo "TABLE_NAME,COLUMN_NAME,DATA_TYPE,IS_NULLABLE,COLUMN_DEFAULT,COLUMN_KEY,EXTRA" > /home/arka/project_kas/skema_database_final.csv

# Menggunakan mysql untuk mengekspor informasi skema
mysql -u arkan -p'Arkan123!@#' kasir -e "
SELECT 
    CONCAT(TABLE_NAME, ',', COLUMN_NAME, ',', DATA_TYPE, ',', IS_NULLABLE, ',', 
           IFNULL(COLUMN_DEFAULT, ''), ',', COLUMN_KEY, ',', EXTRA) as schema_info
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'kasir' 
ORDER BY TABLE_NAME, ORDINAL_POSITION;
" --skip-column-names --raw >> /home/arka/project_kas/skema_database_final.csv

echo "Skema database berhasil diekspor ke skema_database_final.csv"