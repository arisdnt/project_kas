#!/bin/bash

# Script untuk otomatisasi git push ke GitHub
# Usage: ./git-push.sh "commit message"

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Fungsi untuk menampilkan pesan dengan warna dan emoji
print_info() {
    echo -e "${CYAN}${BOLD}ℹ️  INFO${NC} ${BLUE}│${NC} $1"
}

print_success() {
    echo -e "${GREEN}${BOLD}✅ SUCCESS${NC} ${GREEN}│${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}${BOLD}⚠️  WARNING${NC} ${YELLOW}│${NC} $1"
}

print_error() {
    echo -e "${RED}${BOLD}❌ ERROR${NC} ${RED}│${NC} $1"
}

print_header() {
    echo -e "${PURPLE}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}${BOLD}║${NC}${WHITE}${BOLD}                    🚀 GIT PUSH AUTOMATION                    ${NC}${PURPLE}${BOLD}║${NC}"
    echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
}

print_separator() {
    echo -e "${CYAN}${BOLD}────────────────────────────────────────────────────────────────${NC}"
}

print_step() {
    echo -e "${WHITE}${BOLD}🔄 Step $1:${NC} $2"
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

# Tampilkan header
print_header
echo ""
print_info "📝 Commit message: ${WHITE}${BOLD}$COMMIT_MESSAGE${NC}"
print_separator
echo ""

# Step 1: Git add
print_step "1" "Menambahkan semua perubahan (git add .)"
git add .
if [ $? -eq 0 ]; then
    print_success "Git add berhasil - semua file ditambahkan ke staging area"
else
    print_error "Git add gagal"
    exit 1
fi
echo ""

# Step 2: Git commit
print_step "2" "Melakukan commit dengan message"

# Check if there are changes to commit
if git diff --cached --quiet; then
    print_warning "Tidak ada perubahan untuk di-commit (working tree clean)"
    print_info "💡 Tip: Buat perubahan pada file terlebih dahulu sebelum menjalankan script"
    print_separator
    echo -e "${CYAN}📋 Status repository:${NC}"
    git status --short
    exit 0
fi

if git commit -m "$COMMIT_MESSAGE"; then
    print_success "Git commit berhasil dengan message: $COMMIT_MESSAGE"
else
    print_error "Git commit gagal"
    exit 1
fi
echo ""

# Step 3: Git push
print_step "3" "Push ke remote repository (GitHub)"
git push
if [ $? -eq 0 ]; then
    print_success "Git push berhasil - perubahan telah dikirim ke GitHub!"
else
    print_error "Git push gagal"
    print_warning "Mungkin perlu melakukan 'git push --set-upstream origin <branch>' untuk branch baru"
    exit 1
fi

echo ""
print_separator
echo -e "${GREEN}${BOLD}🎉 PROSES SELESAI! 🎉${NC}"
echo -e "${CYAN}${BOLD}📊 Repository telah berhasil diupdate di GitHub${NC}"
echo -e "${PURPLE}${BOLD}🔗 Silakan cek perubahan di: https://github.com/your-repo${NC}"
print_separator