#!/usr/bin/env node

/**
 * Script development untuk aplikasi Kasir POS Electron
 * Menjalankan backend, frontend, dan Electron secara bersamaan
 */

const { spawn } = require('child_process');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Konfigurasi warna untuk output console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Fungsi untuk mencetak pesan dengan warna dan prefix
 */
function log(message, color = 'reset', prefix = 'DEV') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[color]}[${timestamp}] [${prefix}] ${message}${colors.reset}`);
}

/**
 * Fungsi untuk mendapatkan PID proses yang menggunakan port tertentu
 */
function getProcessUsingPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = result.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1].includes(`:${port}`) && parts[3] === 'LISTENING') {
        return parts[4]; // PID
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fungsi untuk menghentikan proses berdasarkan PID
 */
function killProcess(pid) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Fungsi untuk auto kill port jika sedang digunakan
 */
function autoKillPort(port) {
  const pid = getProcessUsingPort(port);
  if (pid) {
    log(`Port ${port} sedang digunakan oleh PID ${pid}. Menghentikan proses...`, 'yellow');
    if (killProcess(pid)) {
      log(`Berhasil menghentikan proses PID ${pid} pada port ${port} ✅`, 'green');
      // Tunggu sebentar untuk memastikan port benar-benar bebas
      return new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      log(`Gagal menghentikan proses PID ${pid} pada port ${port} ❌`, 'red');
      return Promise.resolve();
    }
  }
  return Promise.resolve();
}

/**
 * Fungsi untuk mengecek apakah port sudah digunakan
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(false)); // Port tersedia
    });
    server.on('error', () => resolve(true)); // Port sudah digunakan
  });
}

/**
 * Fungsi untuk menunggu service siap
 */
function waitForService(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function check() {
      const req = http.get(url, (res) => {
        log(`Service ${url} responded with status: ${res.statusCode}`, 'cyan');
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Timeout menunggu ${url} - Status: ${res.statusCode}`));
          } else {
            setTimeout(check, 1000);
          }
        }
      }).on('error', (err) => {
        log(`Error connecting to ${url}: ${err.message}`, 'yellow');
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout menunggu ${url} - Error: ${err.message}`));
        } else {
          setTimeout(check, 1000);
        }
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout menunggu ${url}`));
        } else {
          setTimeout(check, 1000);
        }
      });
    }
    
    check();
  });
}

/**
 * Fungsi untuk menjalankan process dengan logging
 */
function runProcess(command, args, options, name, color) {
  log(`Memulai ${name}...`, color);
  
  const childProcess = spawn(command, args, {
    ...options,
    env: { ...process.env, NODE_ENV: 'development' },
    shell: true // Tambahkan shell: true untuk Windows
  });
  
  childProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        log(line, color, name);
      }
    });
  });
  
  childProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        log(line, 'red', name);
      }
    });
  });
  
  childProcess.on('close', (code) => {
    if (code !== 0) {
      log(`${name} berhenti dengan kode ${code}`, 'red');
    } else {
      log(`${name} berhenti normal`, 'yellow');
    }
  });
  
  childProcess.on('error', (error) => {
    log(`Error ${name}: ${error.message}`, 'red');
  });
  
  return childProcess;
}

/**
 * Fungsi untuk memverifikasi dependencies
 */
function verifyDependencies() {
  log('Memverifikasi dependencies...', 'magenta');
  
  const packages = [
    { name: 'Backend', path: path.join(__dirname, '..', '..', 'backend') },
    { name: 'Frontend', path: path.join(__dirname, '..', '..', 'frontend') },
    { name: 'Electron', path: path.join(__dirname, '..') }
  ];
  
  for (const pkg of packages) {
    const nodeModulesPath = path.join(pkg.path, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      log(`Dependencies ${pkg.name} tidak ditemukan. Jalankan 'npm install' terlebih dahulu.`, 'red');
      return false;
    }
  }
  
  log('Dependencies terverifikasi ✅', 'green');
  return true;
}

/**
 * Fungsi utama untuk development
 */
async function main() {
  log('🚀 Memulai development server Kasir POS Electron', 'bright');
  log('=' .repeat(60), 'blue');
  
  // 1. Verifikasi dependencies
  if (!verifyDependencies()) {
    process.exit(1);
  }
  
  // 2. Auto kill port jika sedang digunakan
  const backendPort = 3000; // Backend berjalan di port 3000
  const frontendPort = 3002; // Frontend Vite berjalan di port 3002
  
  log('Memeriksa dan membersihkan port yang digunakan...', 'cyan');
  await autoKillPort(backendPort);
  await autoKillPort(frontendPort);
  
  // 3. Verifikasi port sudah bebas
  if (await checkPort(backendPort)) {
    log(`Port ${backendPort} masih digunakan setelah auto kill. Coba restart script.`, 'red');
    process.exit(1);
  }
  
  if (await checkPort(frontendPort)) {
    log(`Port ${frontendPort} masih digunakan setelah auto kill. Coba restart script.`, 'red');
    process.exit(1);
  }
  
  log('Semua port sudah bebas ✅', 'green');
  
  const processes = [];
  
  // 4. Jalankan Backend
  const backendPath = path.join(__dirname, '..', '..', 'backend');
  const backendProcess = runProcess('npm', ['run', 'dev'], { cwd: backendPath }, 'BACKEND', 'white');
  processes.push(backendProcess);
  
  // 5. Jalankan Frontend
  const frontendPath = path.join(__dirname, '..', '..', 'frontend');
  const frontendProcess = runProcess('npm', ['run', 'dev'], { cwd: frontendPath }, 'FRONTEND', 'green');
  processes.push(frontendProcess);
  
  // 6. Tunggu backend dan frontend siap
  try {
    log('Menunggu backend siap...', 'yellow');
    await waitForService(`http://localhost:${backendPort}/health`);
    log('Backend siap ✅', 'green');
    
    log('Menunggu frontend siap...', 'yellow');
    await waitForService(`http://localhost:${frontendPort}`);
    log('Frontend siap ✅', 'green');
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    processes.forEach(p => p.kill());
    process.exit(1);
  }
  
  // 7. Build Electron scripts
  log('Building Electron scripts...', 'cyan');
  const electronPath = path.join(__dirname, '..');
  const buildProcess = runProcess('npm', ['run', 'build'], { cwd: electronPath }, 'BUILD', 'cyan');
  
  await new Promise((resolve) => {
    buildProcess.on('close', resolve);
  });
  
  // 8. Jalankan Electron
  const electronProcess = runProcess('npm', ['run', 'dev:electron'], { cwd: electronPath }, 'ELECTRON', 'magenta');
  processes.push(electronProcess);
  
  log('🎉 Development server berjalan!', 'bright');
  log(`📱 Frontend: http://localhost:${frontendPort}`, 'green');
  log(`🔧 Backend: http://localhost:${backendPort}`, 'blue');
  log(`🖥️  Electron: Starting...`, 'magenta');
  log('Press Ctrl+C to stop all services', 'yellow');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Menghentikan semua services...', 'yellow');
    processes.forEach(p => {
      if (!p.killed) {
        p.kill('SIGTERM');
      }
    });
    
    setTimeout(() => {
      log('👋 Development server dihentikan', 'green');
      process.exit(0);
    }, 2000);
  });
  
  // Keep process alive
  process.stdin.resume();
}

// Jalankan script
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}