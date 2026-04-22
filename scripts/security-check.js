'use strict';

require('dotenv').config();

const results = [];
let passed = 0;
let failed = 0;
let warned = 0;

const check = (label, condition, level = 'FAIL', hint = '') => {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    const icon = level === 'WARN' ? '⚠️ ' : '❌';
    console.log(`  ${icon} ${label}${hint ? `\n     → ${hint}` : ''}`);
    level === 'WARN' ? warned++ : failed++;
  }
  results.push({ label, ok: condition, level });
};

// ─────────────────────────────────────────
console.log('\n🔐 SECURITY CHECK — ResepPedia\n');

// 1. ENV VARIABLES
console.log('📋 Environment Variables');
check('JWT_SECRET diset',
  !!process.env.JWT_SECRET,
  'FAIL', 'Isi JWT_SECRET di .env');

check('JWT_SECRET cukup panjang (min 32 char)',
  (process.env.JWT_SECRET || '').length >= 32,
  'FAIL', 'Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');

check('JWT_SECRET bukan nilai default',
  !['secret', 'jwt_secret', 'your_secret', 'ganti_dengan_secret_yang_panjang_dan_random_di_production']
    .includes(process.env.JWT_SECRET),
  'FAIL', 'Ganti JWT_SECRET dengan nilai random yang unik');

check('NODE_ENV diset',
  !!process.env.NODE_ENV,
  'WARN', 'Set NODE_ENV=production di server');

check('DB_NAME diset',
  !!process.env.DB_NAME,
  'FAIL', 'Isi DB_NAME di .env');

check('DB_USER diset',
  !!process.env.DB_USER,
  'FAIL', 'Isi DB_USER di .env');

check('DB_PASSWORD diset (production)',
  process.env.NODE_ENV !== 'production' || !!process.env.DB_PASSWORD,
  'WARN', 'Di production, DB_PASSWORD wajib diisi');

check('FRONTEND_URL diset',
  !!process.env.FRONTEND_URL,
  'WARN', 'Isi FRONTEND_URL untuk reset password email');

check('ALLOWED_ORIGINS diset',
  !!process.env.ALLOWED_ORIGINS,
  'WARN', 'Isi ALLOWED_ORIGINS untuk batasi CORS');

// ─────────────────────────────────────────
console.log('\n📦 Dependencies Security');

const pkg = require('../package.json');
const deps = Object.keys(pkg.dependencies || {});

const securityDeps = ['helmet', 'cors', 'bcryptjs', 'jsonwebtoken', 'dotenv'];
securityDeps.forEach(dep => {
  check(`${dep} terinstall`, deps.includes(dep), 'FAIL', `npm install ${dep}`);
});

check('multer terinstall (file upload protection)',
  deps.includes('multer'), 'WARN', 'npm install multer');

// ─────────────────────────────────────────
console.log('\n🏗️  File Structure');

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  ['src/middleware/authenticate.js', 'JWT auth middleware'],
  ['src/middleware/authorize.js',    'Role-based access middleware'],
  ['src/middleware/rateLimiter.js',  'Brute force protection'],
  ['src/middleware/upload.js',       'File upload middleware'],
  ['src/middleware/validate.js',     'Input validation middleware'],
  ['src/utils/validator.js',         'Input sanitizer'],
  ['src/utils/apiResponse.js',       'Consistent response format'],
  ['src/config/cloudinary.js',       'Cloudinary config'],
  ['src/services/emailService.js',   'Email service'],
];

requiredFiles.forEach(([file, desc]) => {
  check(`${desc} (${file})`,
    fs.existsSync(path.join(process.cwd(), file)), 'FAIL');
});

check('.env tidak di-commit (ada .gitignore)',
  (() => {
    try {
      const gi = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8');
      return gi.includes('.env');
    } catch { return false; }
  })(), 'FAIL', 'Tambahkan .env ke .gitignore SEKARANG');

// ─────────────────────────────────────────
console.log('\n🔍 Code Security Checks');

const readFile = (f) => {
  try { return fs.readFileSync(path.join(process.cwd(), f), 'utf8'); }
  catch { return ''; }
};

const appJs = readFile('src/app.js');
check('helmet() dipakai di app.js',
  appJs.includes('helmet()'), 'FAIL', 'Tambahkan app.use(helmet()) di app.js');

check('cors() dipakai di app.js',
  appJs.includes('cors('), 'FAIL', 'Tambahkan app.use(cors(...)) di app.js');

check('Body size limit diset',
  appJs.includes('limit:') || appJs.includes("limit: '"),
  'WARN', 'Tambahkan limit pada express.json({ limit: "10kb" })');

check('x-powered-by dinonaktifkan',
  appJs.includes('x-powered-by'), 'WARN', 'Tambahkan app.disable("x-powered-by")');

const authCtrl = readFile('src/controllers/authController.js');
check('bcrypt dipakai untuk hash password',
  authCtrl.includes('bcrypt.hash'), 'FAIL', 'Jangan simpan plain text password');

check('bcrypt salt rounds >= 10',
  (() => {
    const match = authCtrl.match(/SALT_ROUNDS\s*=\s*(\d+)/);
    return match ? parseInt(match[1]) >= 10 : false;
  })(), 'WARN', 'Gunakan SALT_ROUNDS minimal 10 untuk keamanan');

check('Timing attack prevention ada',
  authCtrl.includes('invalidhash') || authCtrl.includes('timing'),
  'WARN', 'Jalankan bcrypt.compare palsu saat email tidak ditemukan');

check('Pesan error login generik',
  authCtrl.includes('Email atau password salah'),
  'WARN', 'Jangan bocorkan apakah email terdaftar atau tidak');

const rateLimiter = readFile('src/middleware/rateLimiter.js');
check('Rate limiter ada',
  rateLimiter.includes('MAX_ATTEMPTS'), 'FAIL', 'Tambahkan rate limiting pada endpoint login');

const authenticate = readFile('src/middleware/authenticate.js');
check('JWT verify dipakai',
  authenticate.includes('jwt.verify'), 'FAIL', 'Verifikasi JWT token di middleware');

check('TokenExpiredError ditangani',
  authenticate.includes('TokenExpiredError'), 'WARN', 'Handle expired token dengan pesan yang jelas');

const validator = readFile('src/utils/validator.js');
check('Input sanitizer ada (XSS prevention)',
  validator.includes('sanitizeString'), 'FAIL', 'Sanitasi semua input string dari user');

check('Email validator ada',
  validator.includes('isValidEmail'), 'FAIL', 'Validasi format email sebelum proses');

check('Password strength validator ada',
  validator.includes('isStrongPassword'), 'WARN', 'Enforce strong password policy');

// ─────────────────────────────────────────
console.log('\n🌐 API Security');

const routes = [
  ['src/routes/admin.js',   'authenticate', 'Admin routes dilindungi auth'],
  ['src/routes/admin.js',   'authorize',    'Admin routes dilindungi role check'],
  ['src/routes/recipes.js', 'authenticate', 'Recipe write routes dilindungi auth'],
  ['src/routes/users.js',   'authenticate', 'User routes dilindungi auth'],
];

routes.forEach(([file, keyword, label]) => {
  check(label, readFile(file).includes(keyword), 'FAIL');
});

// ─────────────────────────────────────────
// SUMMARY
console.log('\n' + '─'.repeat(50));
console.log('📊 HASIL:');
console.log(`  ✅ Passed : ${passed}`);
console.log(`  ❌ Failed : ${failed}`);
console.log(`  ⚠️  Warning: ${warned}`);
console.log('─'.repeat(50));

if (failed === 0 && warned === 0) {
  console.log('\n🎉 Semua check passed! Backend kamu aman.\n');
} else if (failed === 0) {
  console.log('\n✅ Tidak ada critical issue. Perhatikan warnings di atas.\n');
} else {
  console.log(`\n🚨 Ada ${failed} critical issue yang harus diperbaiki!\n`);
  process.exit(1);
}
