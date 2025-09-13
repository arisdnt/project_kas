#!/bin/bash

# Script untuk otomatisasi git push ke GitHub
# Usage: ./git-push.sh "commit message"

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fungsi untuk menampilkan pesan dengan warna
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cek apakah commit message diberikan, jika tidak buat otomatis
if [ -z "$1" ]; then
    # Generate commit message otomatis dengan tanggal dan waktu
    CURRENT_DATE=$(date "+%Y-%m-%d %H:%M:%S")
    COMMIT_MESSAGE="Auto commit - $CURRENT_DATE"
    print_warning "Tidak ada commit message, menggunakan: $COMMIT_MESSAGE"
else
    COMMIT_MESSAGE="$1"
fi

# Cek apakah berada di dalam git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Tidak berada di dalam git repository!"
    exit 1
fi

print_info "Memulai proses git push..."
echo "Commit message: $COMMIT_MESSAGE"
echo ""

# Step 1: Git add
print_info "Step 1: Menambahkan semua perubahan (git add .)"
git add .
if [ $? -eq 0 ]; then
    print_success "Git add berhasil"
else
    print_error "Git add gagal"
    exit 1
fi
echo ""

# Step 2: Git commit
print_info "Step 2: Melakukan commit (git commit)"
git commit -m "$COMMIT_MESSAGE"
if [ $? -eq 0 ]; then
    print_success "Git commit berhasil"
else
    print_error "Git commit gagal"
    exit 1
fi
echo ""

# Step 3: Git push
print_info "Step 3: Push ke remote repository (git push)"
git push
if [ $? -eq 0 ]; then
    print_success "Git push berhasil!"
    print_success "Semua perubahan telah dipush ke GitHub"
else
    print_error "Git push gagal"
    print_warning "Mungkin perlu melakukan 'git push --set-upstream origin <branch>' untuk branch baru"
    exit 1
fi

echo ""
print_success "=== PROSES SELESAI ==="
print_info "Repository telah diupdate di GitHub"