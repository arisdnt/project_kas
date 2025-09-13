#!/bin/bash

# Git Clone Automation Script
# Fungsi: Clone ulang repository dari GitHub dengan mudah
# Author: Project Kas Team

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
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
    echo -e "${PURPLE}${BOLD}║                   🔄 GIT CLONE AUTOMATION                   ║${NC}"
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
BACKUP_DIR="${DIR_NAME}_backup_$(date +%Y%m%d_%H%M%S)"

# Step 1: Backup existing directory if exists
print_step "1" "Memeriksa dan backup direktori yang ada"
if [ -d "$DIR_NAME" ]; then
    if mv "$DIR_NAME" "$BACKUP_DIR"; then
        print_success "Direktori lama di-backup ke: $BACKUP_DIR"
    else
        print_error "Gagal membackup direktori lama"
        exit 1
    fi
else
    print_info "Tidak ada direktori yang perlu di-backup"
fi
echo

# Step 2: Clone repository
print_step "2" "Melakukan clone repository dari GitHub"
if git clone "$REPO_URL"; then
    print_success "Repository berhasil di-clone ke direktori: $DIR_NAME"
else
    print_error "Gagal melakukan clone repository"
    # Restore backup if clone failed
    if [ -d "$BACKUP_DIR" ]; then
        mv "$BACKUP_DIR" "$DIR_NAME"
        print_info "Direktori backup telah dipulihkan"
    fi
    exit 1
fi
echo

# Step 3: Enter directory and show status
print_step "3" "Masuk ke direktori dan menampilkan status"
cd "$DIR_NAME" || exit 1
print_success "Berhasil masuk ke direktori: $(pwd)"
echo
print_info "📊 Status repository:"
git log --oneline -5
echo

# Final message
print_separator
echo -e "${GREEN}${BOLD}🎉 CLONE SELESAI! 🎉${NC}"
echo -e "${CYAN}${BOLD}📁 Direktori baru: $DIR_NAME${NC}"
echo -e "${PURPLE}${BOLD}🔗 Repository: $REPO_URL${NC}"
if [ -d "../$BACKUP_DIR" ]; then
    echo -e "${YELLOW}${BOLD}💾 Backup tersimpan: $BACKUP_DIR${NC}"
fi
print_separator
echo
print_info "💡 Tip: Gunakan 'cd $DIR_NAME' untuk masuk ke direktori project"