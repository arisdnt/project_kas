#!/bin/bash

# Development Server Automation Script
# Fungsi: Menjalankan npm run dev untuk backend dan frontend
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

# Backend and Frontend colors - High contrast for dark background
BACKEND_COLOR='\033[1;92m'    # Bright Green
FRONTEND_COLOR='\033[1;94m'   # Bright Blue

# Port configurations
BACKEND_PORT=3000
FRONTEND_PORT=3004

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
    echo -e "${PURPLE}${BOLD}║                  🚀 DEV SERVER AUTOMATION                  ║${NC}"
    echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
}

print_separator() {
    echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
}

print_step() {
    echo -e "${CYAN}${BOLD}🔄 Step $1: $2${NC}"
}

# Function to kill process using specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    print_step "Kill" "Memeriksa dan menghentikan proses di port $port ($service_name)"
    
    # Find process using the port
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        print_warning "Proses ditemukan di port $port (PID: $pid)"
        if kill -9 $pid 2>/dev/null; then
            print_success "Proses di port $port berhasil dihentikan"
        else
            print_error "Gagal menghentikan proses di port $port"
            return 1
        fi
    else
        print_info "Port $port tersedia untuk $service_name"
    fi
    return 0
}

# Function to check if directory exists
check_directory() {
    local dir=$1
    local name=$2
    
    if [ ! -d "$dir" ]; then
        print_error "Direktori $name tidak ditemukan: $dir"
        return 1
    fi
    return 0
}

# Function to check if package.json exists
check_package_json() {
    local dir=$1
    local name=$2
    
    if [ ! -f "$dir/package.json" ]; then
        print_error "package.json tidak ditemukan di $name: $dir"
        return 1
    fi
    return 0
}

# Function to start backend server
start_backend() {
    print_step "Backend" "Memulai backend server di port $BACKEND_PORT"
    
    cd packages/backend || {
        print_error "Gagal masuk ke direktori backend"
        return 1
    }
    
    # Start backend in background and capture output
    {
        echo -e "${BACKEND_COLOR}${BOLD}🟢 [BACKEND] Starting server...${NC}"
        npm run dev 2>&1 | while IFS= read -r line; do
            echo -e "${BACKEND_COLOR}🟢 [BACKEND] $line${NC}"
        done
    } &
    
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/backend.pid
    
    cd - > /dev/null
    print_success "Backend server dimulai (PID: $BACKEND_PID)"
    return 0
}

# Function to start frontend server
start_frontend() {
    print_step "Frontend" "Memulai frontend server di port $FRONTEND_PORT"
    
    cd packages/frontend || {
        print_error "Gagal masuk ke direktori frontend"
        return 1
    }
    
    # Start frontend in background and capture output
    {
        echo -e "${FRONTEND_COLOR}${BOLD}🔵 [FRONTEND] Starting server...${NC}"
        npm run dev 2>&1 | while IFS= read -r line; do
            echo -e "${FRONTEND_COLOR}🔵 [FRONTEND] $line${NC}"
        done
    } &
    
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/frontend.pid
    
    cd - > /dev/null
    print_success "Frontend server dimulai (PID: $FRONTEND_PID)"
    return 0
}

# Function to cleanup on exit
cleanup() {
    echo
    print_warning "Menghentikan semua server..."
    
    if [ -f /tmp/backend.pid ]; then
        local backend_pid=$(cat /tmp/backend.pid)
        kill -TERM $backend_pid 2>/dev/null
        rm -f /tmp/backend.pid
        print_info "Backend server dihentikan"
    fi
    
    if [ -f /tmp/frontend.pid ]; then
        local frontend_pid=$(cat /tmp/frontend.pid)
        kill -TERM $frontend_pid 2>/dev/null
        rm -f /tmp/frontend.pid
        print_info "Frontend server dihentikan"
    fi
    
    print_separator
    echo -e "${YELLOW}${BOLD}👋 Development servers telah dihentikan${NC}"
    exit 0
}

# Trap signals for cleanup
trap cleanup SIGINT SIGTERM

# Main script
clear
print_header
echo

# Step 1: Check directories
print_step "1" "Memeriksa struktur direktori project"
check_directory "packages/backend" "Backend" || exit 1
check_directory "packages/frontend" "Frontend" || exit 1
check_package_json "packages/backend" "Backend" || exit 1
check_package_json "packages/frontend" "Frontend" || exit 1
print_success "Semua direktori dan file konfigurasi ditemukan"
echo

# Step 2: Kill existing processes
print_step "2" "Membersihkan port yang sedang digunakan"
kill_port $BACKEND_PORT "Backend"
kill_port $FRONTEND_PORT "Frontend"
echo

# Step 3: Start servers
print_step "3" "Memulai development servers"
start_backend || exit 1
sleep 2
start_frontend || exit 1
echo

# Final message
print_separator
echo -e "${GREEN}${BOLD}🎉 DEVELOPMENT SERVERS STARTED! 🎉${NC}"
echo -e "${BACKEND_COLOR}${BOLD}🟢 Backend: http://localhost:$BACKEND_PORT${NC}"
echo -e "${FRONTEND_COLOR}${BOLD}🔵 Frontend: http://localhost:$FRONTEND_PORT${NC}"
print_separator
echo -e "${YELLOW}${BOLD}💡 Tekan Ctrl+C untuk menghentikan semua server${NC}"
echo

# Wait for processes
wait