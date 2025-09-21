#!/usr/bin/env node

/**
 * Script build otomatis untuk aplikasi Kasir POS Electron
 * Membangun backend, frontend, dan Electron secara berurutan
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Konfigurasi warna untuk output console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Fungsi untuk mencetak pesan dengan warna
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Fungsi untuk menjalankan command dengan error handling
 */
function runCommand(command, description, cwd = process.cwd()) {
  log(`\n🔄 ${description}...`, 'cyan');
  log(`📁 Direktori: ${cwd}`, 'blue');
  log(`⚡ Command: ${command}`, 'yellow');
  
  try {
    const startTime = Date.now();
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`✅ ${description} selesai dalam ${duration}s`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error saat ${description}:`, 'red');
    log(error.message, 'red');
    return false;
  }
}

/**
 * Fungsi untuk membersihkan direktori build
 */
function cleanBuildDirectories() {
  log('\n🧹 Membersihkan direktori build...', 'magenta');
  
  const dirsToClean = [
    path.join(__dirname, '..', 'dist'),
    path.join(__dirname, '..', 'dist-electron'),
    path.join(__dirname, '..', '..', 'backend', 'dist'),
    path.join(__dirname, '..', '..', 'frontend', 'dist')
  ];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      log(`🗑️  Menghapus ${dir}`, 'yellow');
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
  
  log('✅ Direktori build dibersihkan', 'green');
}

/**
 * Fungsi untuk memverifikasi dependencies
 */
function verifyDependencies() {
  log('\n🔍 Memverifikasi dependencies...', 'magenta');
  
  const packages = [
    { name: 'Backend', path: path.join(__dirname, '..', '..', 'backend') },
    { name: 'Frontend', path: path.join(__dirname, '..', '..', 'frontend') },
    { name: 'Electron', path: path.join(__dirname, '..') }
  ];
  
  for (const pkg of packages) {
    const packageJsonPath = path.join(pkg.path, 'package.json');
    const nodeModulesPath = path.join(pkg.path, 'node_modules');
    
    if (!fs.existsSync(packageJsonPath)) {
      log(`❌ package.json tidak ditemukan di ${pkg.name}`, 'red');
      return false;
    }
    
    if (!fs.existsSync(nodeModulesPath)) {
      log(`⚠️  node_modules tidak ditemukan di ${pkg.name}, menjalankan npm install...`, 'yellow');
      if (!runCommand('npm install', `Install dependencies ${pkg.name}`, pkg.path)) {
        return false;
      }
    }
  }
  
  log('✅ Dependencies terverifikasi', 'green');
  return true;
}

/**
 * Fungsi utama untuk build
 */
async function main() {
  const startTime = Date.now();
  
  log('🚀 Memulai build aplikasi Kasir POS Electron', 'bright');
  log('=' .repeat(60), 'blue');
  
  // 1. Verifikasi dependencies
  if (!verifyDependencies()) {
    log('\n❌ Build gagal: Dependencies tidak lengkap', 'red');
    process.exit(1);
  }
  
  // 2. Bersihkan direktori build
  cleanBuildDirectories();
  
  // 3. Build backend
  const backendPath = path.join(__dirname, '..', '..', 'backend');
  if (!runCommand('npm run build', 'Build Backend', backendPath)) {
    log('\n❌ Build gagal pada tahap Backend', 'red');
    process.exit(1);
  }
  
  // 4. Build frontend
  const frontendPath = path.join(__dirname, '..', '..', 'frontend');
  if (!runCommand('npm run build', 'Build Frontend', frontendPath)) {
    log('\n❌ Build gagal pada tahap Frontend', 'red');
    process.exit(1);
  }
  
  // 5. Build Electron main & preload
  const electronPath = path.join(__dirname, '..');
  if (!runCommand('npm run build', 'Build Electron Scripts', electronPath)) {
    log('\n❌ Build gagal pada tahap Electron Scripts', 'red');
    process.exit(1);
  }
  
  // 6. Package aplikasi
  const buildType = process.argv[2] || 'pack';
  const buildCommand = buildType === 'dist' ? 'npm run dist' : 'npm run pack';
  const buildDescription = buildType === 'dist' ? 'Package Distribusi' : 'Package Development';
  
  if (!runCommand(buildCommand, buildDescription, electronPath)) {
    log('\n❌ Build gagal pada tahap Packaging', 'red');
    process.exit(1);
  }
  
  // 7. Selesai
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  log('\n' + '='.repeat(60), 'green');
  log('🎉 Build aplikasi Kasir POS Electron berhasil!', 'bright');
  log(`⏱️  Total waktu: ${totalDuration}s`, 'cyan');
  log(`📦 Output: ${path.join(electronPath, 'dist-electron')}`, 'blue');
  log('='.repeat(60), 'green');
}

// Jalankan script
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Build gagal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runCommand, log };