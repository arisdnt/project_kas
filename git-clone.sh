#!/bin/bash

# Git Packages Sync Script
# Fungsi: Sinkronisasi folder packages dengan versi terbaru dari GitHub
# Mengabaikan semua perubahan lokal dan memastikan struktur identik dengan remote
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
    echo -e "${PURPLE}${BOLD}║              📦 PACKAGES SYNC AUTOMATION                   ║${NC}"
    echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
}

print_separator() {
    echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
}

print_step() {
    echo -e "${CYAN}${BOLD}🔄 Step $1: $2${NC}"
}

# Validate git repository
validate_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "Direktori ini bukan repository Git!"
        print_info "💡 Jalankan script ini di dalam direktori project_kas"
        exit 1
    fi
    
    if ! git remote get-url origin >/dev/null 2>&1; then
        print_error "Remote origin tidak ditemukan!"
        exit 1
    fi
}

# Check if packages directory exists
validate_packages_dir() {
    if [ ! -d "packages" ]; then
        print_error "Direktori packages tidak ditemukan!"
        print_info "💡 Pastikan Anda berada di root directory project_kas"
        exit 1
    fi
}



# Fetch latest changes from remote
fetch_remote_changes() {
    print_step "1" "Mengambil perubahan terbaru dari remote repository"
    
    if git fetch origin; then
        print_success "Berhasil mengambil perubahan dari remote"
    else
        print_error "Gagal mengambil perubahan dari remote"
        exit 1
    fi
}

# Reset packages directory to match remote
reset_packages_directory() {
    print_step "2" "Mereset direktori packages ke versi remote"
    
    # Get current branch name
    local current_branch=$(git branch --show-current)
    
    # Reset packages directory to remote state
    if git checkout "origin/$current_branch" -- packages/; then
        print_success "Direktori packages berhasil direset ke versi remote"
    else
        print_error "Gagal mereset direktori packages"
        exit 1
    fi
}

# Clean untracked files in packages directory
clean_untracked_files() {
    print_step "3" "Membersihkan file yang tidak dilacak di direktori packages"
    
    # Remove untracked files and directories in packages
    if git clean -fd packages/; then
        print_success "File yang tidak dilacak berhasil dibersihkan"
    else
        print_warning "Tidak ada file yang tidak dilacak untuk dibersihkan"
    fi
}

# Verify synchronization
verify_sync() {
    print_step "4" "Memverifikasi sinkronisasi"
    
    local current_branch=$(git branch --show-current)
    local diff_output=$(git diff "origin/$current_branch" -- packages/)
    
    if [ -z "$diff_output" ]; then
        print_success "Direktori packages telah tersinkronisasi dengan remote"
        return 0
    else
        print_warning "Masih ada perbedaan dengan remote repository"
        return 1
    fi
}

# Show packages status
show_packages_status() {
    print_step "5" "Menampilkan status direktori packages"
    
    echo -e "${CYAN}📁 Struktur direktori packages:${NC}"
    tree packages/ -L 2 2>/dev/null || ls -la packages/
    echo
    
    echo -e "${CYAN}📊 Git status untuk packages:${NC}"
    git status packages/
}

# Confirm sync action
confirm_sync() {
    echo -e "${YELLOW}${BOLD}⚠️  PERINGATAN: Sinkronisasi akan menghapus semua perubahan lokal di direktori packages!${NC}"
    echo -e "${WHITE}Semua modifikasi yang belum di-commit akan hilang.${NC}"
    echo
    read -p "$(echo -e "${CYAN}Apakah Anda yakin ingin melanjutkan sinkronisasi? (y/N): ${NC}")" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Sinkronisasi dibatalkan oleh user"
        exit 0
    fi
}

# Main script execution
main() {
    clear
    print_header
    echo
    
    # Validation steps
    validate_git_repo
    validate_packages_dir
    
    # Show current repository info
    local repo_url=$(git remote get-url origin)
    local current_branch=$(git branch --show-current)
    print_info "📂 Repository: $repo_url"
    print_info "🌿 Current branch: $current_branch"
    print_separator
    echo
    
    # Confirm action
    confirm_sync
    echo
    
    # Sync process
    fetch_remote_changes
    echo
    
    reset_packages_directory
    echo
    
    clean_untracked_files
    echo
    
    # Verification
    if verify_sync; then
        echo
        show_packages_status
        echo
        
        # Final success message
        print_separator
        echo -e "${GREEN}${BOLD}🎉 SINKRONISASI SELESAI! 🎉${NC}"
        echo -e "${CYAN}${BOLD}📦 Direktori packages telah disinkronkan dengan GitHub${NC}"
        echo -e "${GREEN}${BOLD}✨ Struktur packages identik dengan remote repository${NC}"
        print_separator
        echo
        print_info "💡 Tip: Jalankan './dev-server.sh' untuk memulai development server"
    else
        print_error "Sinkronisasi tidak berhasil sepenuhnya"
        print_info "💡 Periksa status git dan coba lagi"
        exit 1
    fi
}

# Execute main function
main "$@"