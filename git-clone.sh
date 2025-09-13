#!/bin/bash

# Git Rollback Automation Script
# Fungsi: Rollback project dari GitHub ketika terjadi kesalahan koding
# Author: Project Kas Team

# Color definitions - Optimized for dark terminal background
RED='\033[1;91m'      # Bright Red
GREEN='\033[1;92m'    # Bright Green
YELLOW='\033[1;93m'   # Bright Yellow
BLUE='\033[1;94m'     # Bright Blue
PURPLE='\033[1;95m'   # Bright Magenta
CYAN='\033[1;96m'     # Bright Cyan
WHITE='\033[1;97m'    # Bright White
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print functions with colors and emojis
print_success() {
    echo -e "${GREEN}✅ SUCCESS │ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERROR │ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING │ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO │ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}${BOLD}║                  🔄 GIT ROLLBACK AUTOMATION                 ║${NC}"
    echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
}

print_separator() {
    echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
}

print_step() {
    echo -e "${CYAN}${BOLD}🔄 Step $1: $2${NC}"
}

# Get repository URL from current directory or parameter
get_repo_url() {
    if [ -n "$1" ]; then
        echo "$1"
    elif [ -d ".git" ]; then
        git remote get-url origin 2>/dev/null | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//'
    else
        echo ""
    fi
}

# Get directory name from URL
get_dir_name() {
    basename "$1" .git
}

# Confirm rollback action
confirm_rollback() {
    echo -e "${YELLOW}${BOLD}⚠️  PERINGATAN: Rollback akan menghapus semua perubahan lokal!${NC}"
    echo -e "${WHITE}Semua file yang belum di-commit akan hilang.${NC}"
    echo
    read -p "$(echo -e "${CYAN}Apakah Anda yakin ingin melanjutkan rollback? (y/N): ${NC}")" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Rollback dibatalkan oleh user"
        exit 0
    fi
}

# Main script
clear
print_header
echo

# Get repository URL
REPO_URL=$(get_repo_url "$1")

if [ -z "$REPO_URL" ]; then
    print_error "Tidak dapat mendeteksi URL repository!"
    print_info "💡 Gunakan: ./git-clone.sh <repository-url>"
    print_info "💡 Atau jalankan di dalam direktori git yang valid"
    exit 1
fi

print_info "📂 Repository URL: $REPO_URL"
print_separator
echo

# Get directory name
DIR_NAME=$(get_dir_name "$REPO_URL")

# Step 1: Confirm rollback if directory exists
if [ -d "$DIR_NAME" ]; then
    print_step "1" "Konfirmasi rollback untuk direktori yang ada"
    confirm_rollback
    echo
    
    print_step "2" "Menghapus direktori lokal untuk rollback"
    if rm -rf "$DIR_NAME"; then
        print_success "Direktori lokal berhasil dihapus"
    else
        print_error "Gagal menghapus direktori lokal"
        exit 1
    fi
else
    print_step "1" "Memeriksa direktori target"
    print_info "Direktori $DIR_NAME tidak ada, akan membuat fresh clone"
fi
echo

# Step 2/3: Clone repository from GitHub
print_step "$([ -d "../temp_check" ] && echo "3" || echo "2")" "Melakukan fresh clone dari GitHub"
if git clone "$REPO_URL"; then
    print_success "Repository berhasil di-rollback dari GitHub: $DIR_NAME"
else
    print_error "Gagal melakukan clone repository dari GitHub"
    exit 1
fi
echo

# Final Step: Enter directory and show status
FINAL_STEP=$([ -d "../temp_check" ] && echo "4" || echo "3")
print_step "$FINAL_STEP" "Masuk ke direktori dan menampilkan status"
cd "$DIR_NAME" || exit 1
print_success "Berhasil masuk ke direktori: $(pwd)"
echo
print_info "📊 Status repository (5 commit terakhir):"
git log --oneline -5
echo
print_info "📋 Branch information:"
git branch -a
echo

# Final message
print_separator
echo -e "${GREEN}${BOLD}🎉 ROLLBACK SELESAI! 🎉${NC}"
echo -e "${CYAN}${BOLD}📁 Direktori fresh: $DIR_NAME${NC}"
echo -e "${PURPLE}${BOLD}🔗 Repository: $REPO_URL${NC}"
echo -e "${GREEN}${BOLD}✨ Semua file telah di-rollback ke versi GitHub${NC}"
print_separator
echo
print_info "💡 Tip: Gunakan 'cd $DIR_NAME' untuk masuk ke direktori project"
print_info "🔧 Tip: Jalankan './dev-server.sh' untuk memulai development server"