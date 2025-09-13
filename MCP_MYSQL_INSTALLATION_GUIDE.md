# MCP MySQL Server Installation Guide

## Status Instalasi
✅ **BERHASIL DIINSTAL** - MCP Server MySQL telah berhasil diinstal dan dikonfigurasi

## Informasi Package
- **Package**: @benborla29/mcp-server-mysql
- **Versi**: 2.0.2 (versi stabil yang direkomendasikan)
- **Lokasi**: /usr/lib/node_modules/@benborla29/mcp-server-mysql
- **Status**: Aktif dan siap digunakan

## Konfigurasi Database
```bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=arkan
MYSQL_PASS=Arkan123!@#
MYSQL_DB=kasir
```

## Cara Menjalankan MCP Server

### 1. Manual (untuk testing)
```bash
MYSQL_HOST=localhost MYSQL_PORT=3306 MYSQL_USER=arkan MYSQL_PASS='Arkan123!@#' MYSQL_DB=kasir npx @benborla29/mcp-server-mysql
```

### 2. Dengan Systemd Service
File service telah dibuat di: `/etc/systemd/system/mysql-mcp-server.service`

```bash
# Start service
sudo systemctl start mysql-mcp-server

# Enable auto-start
sudo systemctl enable mysql-mcp-server

# Check status
sudo systemctl status mysql-mcp-server

# View logs
sudo journalctl -u mysql-mcp-server -f
```

## Integrasi dengan Claude Desktop

Tambahkan konfigurasi berikut ke `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp_server_mysql": {
      "command": "npx",
      "args": [
        "-y",
        "@benborla29/mcp-server-mysql@2.0.2"
      ],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "arkan",
        "MYSQL_PASS": "Arkan123!@#",
        "MYSQL_DB": "kasir",
        "ALLOW_INSERT_OPERATION": "false",
        "ALLOW_UPDATE_OPERATION": "false",
        "ALLOW_DELETE_OPERATION": "false"
      }
    }
  }
}
```

## Integrasi dengan Cursor IDE

Tambahkan konfigurasi berikut ke `mcp.json`:

```json
{
  "mcpServers": {
    "MySQL": {
      "command": "npx",
      "args": [
        "mcprunner",
        "MYSQL_HOST=localhost",
        "MYSQL_PORT=3306",
        "MYSQL_USER=arkan",
        "MYSQL_PASS=Arkan123!@#",
        "MYSQL_DB=kasir",
        "ALLOW_INSERT_OPERATION=false",
        "ALLOW_UPDATE_OPERATION=false",
        "ALLOW_DELETE_OPERATION=false",
        "--",
        "npx",
        "-y",
        "@benborla29/mcp-server-mysql@2.0.2"
      ]
    }
  }
}
```

## Fitur MCP Server MySQL

### Tools yang Tersedia:
1. **Schema Inspection** - Melihat struktur database
2. **Table Listing** - Menampilkan daftar tabel
3. **Query Execution** - Menjalankan SQL queries
4. **Data Analysis** - Analisis data melalui natural language

### Keamanan:
- ✅ SQL injection prevention
- ✅ Prepared statements
- ✅ Configurable write permissions
- ✅ Query whitelisting capabilities

## Troubleshooting

### Masalah Umum:

1. **Server tidak merespons**
   - Pastikan MySQL service berjalan: `sudo systemctl status mysql`
   - Cek koneksi database: `mysql -u arkan -p kasir`

2. **Permission denied**
   - Pastikan user MySQL memiliki permissions yang tepat
   - Cek environment variables

3. **Version issues**
   - Gunakan versi 2.0.2 (versi 2.0.5 memiliki masalah)
   - Reinstall jika perlu: `sudo npm install -g @benborla29/mcp-server-mysql@2.0.2`

### Debugging:
```bash
# Test koneksi database
mysql -u arkan -p'Arkan123!@#' -h localhost kasir -e "SHOW TABLES;"

# Test MCP server manual
MYSQL_HOST=localhost MYSQL_PORT=3306 MYSQL_USER=arkan MYSQL_PASS='Arkan123!@#' MYSQL_DB=kasir npx @benborla29/mcp-server-mysql
```

## Cara Penggunaan

### Dengan Claude Desktop:
1. Restart Claude Desktop setelah konfigurasi
2. Buka chat baru
3. MCP server akan otomatis tersedia
4. Tanyakan tentang database: "Show me the tables in my database"

### Dengan Cursor IDE:
1. Restart Cursor setelah konfigurasi
2. Buka command palette (Ctrl+Shift+P)
3. Ketik "MCP" untuk melihat tools yang tersedia

## Status Akhir

✅ **MCP Server MySQL berhasil diinstal dan dikonfigurasi**
✅ **Database connection tested dan working**
✅ **Systemd service created dan ready**
✅ **Documentation lengkap tersedia**

**Next Steps:**
1. Integrasikan dengan Claude Desktop atau Cursor IDE
2. Test functionality dengan natural language queries
3. Configure additional security settings jika diperlukan

---
*Generated on: $(date)*
*System: Ubuntu 24.04*
*Node.js: $(node --version)*
*MySQL: $(mysql --version)*