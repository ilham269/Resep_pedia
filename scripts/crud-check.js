'use strict';

require('dotenv').config();

const http = require('http');
const https = require('https');

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

let passed = 0;
let failed = 0;
let warned = 0;
let adminToken = '';
let userToken = '';
let createdRecipeId = '';
let createdRecipeSlug = '';
let createdCategoryId = '';
let createdCountryId = '';
let createdRegionId = '';

// ─── HTTP helper ────────────────────────────────────────────────────────────
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + path);
    const lib = url.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });

    req.on('error', (e) => resolve({ status: 0, body: { message: e.message } }));
    if (payload) req.write(payload);
    req.end();
  });
};

// ─── Check helper ───────────────────────────────────────────────────────────
const check = (label, condition, level = 'FAIL', detail = '') => {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    const icon = level === 'WARN' ? '⚠️ ' : '❌';
    console.log(`  ${icon} ${label}${detail ? `  (${detail})` : ''}`);
    level === 'WARN' ? warned++ : failed++;
  }
};

const checkRes = (label, res, expectedStatus, checkSuccess = true) => {
  const statusOk = res.status === expectedStatus;
  const successOk = !checkSuccess || res.body?.success === true;
  check(
    `${label} → ${res.status} ${res.body?.message || ''}`,
    statusOk && successOk,
    'FAIL',
    !statusOk ? `expected ${expectedStatus}, got ${res.status}` : ''
  );
  return statusOk && successOk;
};

// ─── TESTS ──────────────────────────────────────────────────────────────────

const runTests = async () => {
  console.log(`\n🧪 CRUD CHECK — ResepPedia`);
  console.log(`   Target: ${BASE_URL}\n`);

  // ── 0. Server alive ──────────────────────────────────────────────────────
  console.log('🌐 Server');
  const ping = await request('GET', '/api/auth/me');
  check('Server bisa diakses', ping.status !== 0, 'FAIL', 'Pastikan server sudah jalan: npm run dev');
  if (ping.status === 0) {
    console.log('\n❌ Server tidak bisa diakses. Jalankan server dulu lalu coba lagi.\n');
    process.exit(1);
  }

  // ── 1. AUTH ──────────────────────────────────────────────────────────────
  console.log('\n🔐 Auth');

  // Register admin
  const regAdmin = await request('POST', '/api/auth/register', {
    name: 'Test Admin', email: `admin_test_${Date.now()}@test.com`,
    password: 'Admin123', role: 'admin',
  });
  checkRes('Register admin', regAdmin, 201);

  // Register user biasa
  const regUser = await request('POST', '/api/auth/register', {
    name: 'Test User', email: `user_test_${Date.now()}@test.com`,
    password: 'User1234', role: 'user',
  });
  checkRes('Register user', regUser, 201);

  // Login admin
  const loginAdmin = await request('POST', '/api/auth/login', {
    email: regAdmin.body?.data?.email, password: 'Admin123',
  });
  checkRes('Login admin', loginAdmin, 200);
  adminToken = loginAdmin.body?.token || '';
  check('Admin token diterima', !!adminToken, 'FAIL');

  // Login user
  const loginUser = await request('POST', '/api/auth/login', {
    email: regUser.body?.data?.email, password: 'User1234',
  });
  checkRes('Login user', loginUser, 200);
  userToken = loginUser.body?.token || '';

  // GET /me
  const me = await request('GET', '/api/auth/me', null, userToken);
  checkRes('GET /api/auth/me (protected)', me, 200);

  // Akses tanpa token → 401
  const noToken = await request('GET', '/api/auth/me');
  check('Akses tanpa token → 401', noToken.status === 401, 'FAIL');

  // Token salah → 401
  const badToken = await request('GET', '/api/auth/me', null, 'invalidtoken');
  check('Token tidak valid → 401', badToken.status === 401, 'FAIL');

  // Validasi password lemah
  const weakPass = await request('POST', '/api/auth/register', {
    name: 'Weak', email: 'weak@test.com', password: '123',
  });
  check('Password lemah ditolak → 400', weakPass.status === 400, 'FAIL');

  // Forgot password
  const forgot = await request('POST', '/api/auth/forgot-password', { email: 'nonexist@test.com' });
  check('Forgot password (email tidak ada) → 200 generik', forgot.status === 200, 'WARN');

  // ── 2. CATEGORIES ────────────────────────────────────────────────────────
  console.log('\n📂 Categories');

  const catCreate = await request('POST', '/api/categories', {
    name: `Test Kategori ${Date.now()}`, icon: '🍜', description: 'Test',
  }, adminToken);
  checkRes('POST /api/categories (admin)', catCreate, 201);
  createdCategoryId = catCreate.body?.data?.id;

  const catList = await request('GET', '/api/categories');
  checkRes('GET /api/categories (public)', catList, 200);

  const catUpdate = await request('PUT', `/api/categories/${createdCategoryId}`, {
    name: 'Kategori Updated',
  }, adminToken);
  checkRes('PUT /api/categories/:id (admin)', catUpdate, 200);

  // User biasa tidak bisa buat kategori
  const catUnauth = await request('POST', '/api/categories', { name: 'Hacked' }, userToken);
  check('User biasa tidak bisa buat kategori → 403', catUnauth.status === 403, 'FAIL');

  // ── 3. COUNTRIES ─────────────────────────────────────────────────────────
  console.log('\n🌍 Countries');

  const countryCreate = await request('POST', '/api/countries', {
    name: 'Test Country', code: `T${Date.now().toString().slice(-1)}`, flag_emoji: '🏳️', continent: 'Asia',
  }, adminToken);
  checkRes('POST /api/countries (admin)', countryCreate, 201);
  createdCountryId = countryCreate.body?.data?.id;

  const countryList = await request('GET', '/api/countries');
  checkRes('GET /api/countries (public)', countryList, 200);

  // ── 4. REGIONS ───────────────────────────────────────────────────────────
  console.log('\n🗺️  Regions');

  const regionCreate = await request('POST', '/api/regions', {
    name: `Test Region ${Date.now()}`, country_id: createdCountryId, description: 'Test region',
  }, adminToken);
  checkRes('POST /api/regions (admin)', regionCreate, 201);
  createdRegionId = regionCreate.body?.data?.id;

  const regionList = await request('GET', '/api/regions');
  checkRes('GET /api/regions (public)', regionList, 200);

  // ── 5. RECIPES ───────────────────────────────────────────────────────────
  console.log('\n🍲 Recipes');

  // Create recipe (tanpa file upload — cover_image optional)
  const recipeCreate = await request('POST', '/api/recipes', {
    title: `Test Resep ${Date.now()}`,
    description: 'Resep test otomatis',
    category_id: createdCategoryId,
    difficulty: 'mudah',
    servings: 2,
    prep_time: 10,
    cook_time: 20,
    ingredients: [
      { name: 'Bahan 1', amount: 100, unit: 'gram' },
      { name: 'Bahan 2', amount: 2, unit: 'sdm' },
    ],
    steps: [
      { step_number: 1, instruction: 'Langkah pertama test' },
      { step_number: 2, instruction: 'Langkah kedua test' },
    ],
    tags: ['test', 'otomatis'],
  }, userToken);
  checkRes('POST /api/recipes (authenticated)', recipeCreate, 201);
  createdRecipeId = recipeCreate.body?.data?.id;
  createdRecipeSlug = recipeCreate.body?.data?.slug;

  // GET list (hanya published — resep baru status pending)
  const recipeList = await request('GET', '/api/recipes');
  checkRes('GET /api/recipes (public)', recipeList, 200);

  // GET featured & trending
  const featured = await request('GET', '/api/recipes/featured');
  checkRes('GET /api/recipes/featured', featured, 200);

  const trending = await request('GET', '/api/recipes/trending');
  checkRes('GET /api/recipes/trending', trending, 200);

  // Search
  const search = await request('GET', '/api/recipes/search?q=test');
  checkRes('GET /api/recipes/search', search, 200);

  // Buat resep tanpa token → 401
  const recipeUnauth = await request('POST', '/api/recipes', { title: 'Hacked' });
  check('Buat resep tanpa login → 401', recipeUnauth.status === 401, 'FAIL');

  // ── 6. ADMIN ─────────────────────────────────────────────────────────────
  console.log('\n🛡️  Admin');

  // List pending recipes
  const pending = await request('GET', '/api/admin/recipes/pending', null, adminToken);
  checkRes('GET /api/admin/recipes/pending (admin)', pending, 200);

  // Approve recipe
  if (createdRecipeId) {
    const approve = await request('PUT', `/api/admin/recipes/${createdRecipeId}/approve`, null, adminToken);
    checkRes('PUT /api/admin/recipes/:id/approve', approve, 200);

    // Setelah approved, GET by slug harus bisa
    if (createdRecipeSlug) {
      const recipeDetail = await request('GET', `/api/recipes/${createdRecipeSlug}`);
      checkRes('GET /api/recipes/:slug (setelah approved)', recipeDetail, 200);
    }
  }

  // User biasa tidak bisa akses admin
  const adminUnauth = await request('GET', '/api/admin/recipes/pending', null, userToken);
  check('User biasa tidak bisa akses admin → 403', adminUnauth.status === 403, 'FAIL');

  // Analytics
  const analytics = await request('GET', '/api/admin/analytics', null, adminToken);
  checkRes('GET /api/admin/analytics', analytics, 200);

  // List users (admin)
  const usersList = await request('GET', '/api/admin/users', null, adminToken);
  checkRes('GET /api/admin/users', usersList, 200);

  // ── 7. RATINGS ───────────────────────────────────────────────────────────
  console.log('\n⭐ Ratings');

  if (createdRecipeId) {
    const rating = await request('POST', `/api/recipes/${createdRecipeId}/rating`, {
      score: 5, review_text: 'Enak banget!',
    }, userToken);
    checkRes('POST /api/recipes/:id/rating', rating, 200);

    const ratings = await request('GET', `/api/recipes/${createdRecipeId}/ratings`);
    checkRes('GET /api/recipes/:id/ratings', ratings, 200);

    // Score tidak valid
    const badRating = await request('POST', `/api/recipes/${createdRecipeId}/rating`, {
      score: 10,
    }, userToken);
    check('Score > 5 ditolak → 400', badRating.status === 400, 'WARN');
  }

  // ── 8. SAVE RECIPE ───────────────────────────────────────────────────────
  console.log('\n🔖 Save Recipe');

  if (createdRecipeId) {
    const save = await request('POST', `/api/recipes/${createdRecipeId}/save`, null, userToken);
    checkRes('POST /api/recipes/:id/save', save, 201);

    // Simpan lagi → 409
    const saveDup = await request('POST', `/api/recipes/${createdRecipeId}/save`, null, userToken);
    check('Simpan resep duplikat → 409', saveDup.status === 409, 'WARN');

    const unsave = await request('DELETE', `/api/recipes/${createdRecipeId}/save`, null, userToken);
    checkRes('DELETE /api/recipes/:id/save', unsave, 200);
  }

  // ── 9. USER PROFILE ──────────────────────────────────────────────────────
  console.log('\n👤 User Profile');

  const myProfile = await request('GET', '/api/users/me', null, userToken);
  checkRes('GET /api/users/me', myProfile, 200);

  const updateProfile = await request('PUT', '/api/users/me', {
    name: 'Updated Name', bio: 'Bio test', location: 'Jakarta',
  }, userToken);
  checkRes('PUT /api/users/me', updateProfile, 200);

  const myRecipes = await request('GET', '/api/users/me/recipes', null, userToken);
  checkRes('GET /api/users/me/recipes', myRecipes, 200);

  const mySaved = await request('GET', '/api/users/me/saved', null, userToken);
  checkRes('GET /api/users/me/saved', mySaved, 200);

  // Public profile
  const userId = myProfile.body?.data?.id;
  if (userId) {
    const pubProfile = await request('GET', `/api/users/${userId}`);
    checkRes('GET /api/users/:id (public)', pubProfile, 200);
  }

  // ── 10. TAGS ─────────────────────────────────────────────────────────────
  console.log('\n🏷️  Tags');

  const tagList = await request('GET', '/api/tags');
  checkRes('GET /api/tags', tagList, 200);

  const tagRecipes = await request('GET', '/api/tags/test/recipes');
  check('GET /api/tags/:slug/recipes', tagRecipes.status === 200 || tagRecipes.status === 404, 'WARN');

  // ── 11. CLEANUP ──────────────────────────────────────────────────────────
  console.log('\n🧹 Cleanup');

  if (createdRecipeId) {
    const delRecipe = await request('DELETE', `/api/recipes/${createdRecipeId}`, null, userToken);
    checkRes('DELETE /api/recipes/:id (owner)', delRecipe, 200);
  }

  if (createdCategoryId) {
    const delCat = await request('DELETE', `/api/categories/${createdCategoryId}`, null, adminToken);
    checkRes('DELETE /api/categories/:id (admin)', delCat, 200);
  }

  // Delete test users
  const adminUserId = loginAdmin.body?.data?.id;
  const userUserId = loginUser.body?.data?.id;
  if (adminUserId) {
    await request('DELETE', `/api/admin/users/${adminUserId}`, null, adminToken);
    console.log('  🗑️  Test admin dihapus');
  }
  if (userUserId) {
    await request('DELETE', `/api/users/me/account`, null, userToken);
    console.log('  🗑️  Test user dihapus');
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log('📊 HASIL CRUD CHECK:');
  console.log(`  ✅ Passed : ${passed}`);
  console.log(`  ❌ Failed : ${failed}`);
  console.log(`  ⚠️  Warning: ${warned}`);
  console.log('─'.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 Semua CRUD endpoint berfungsi dengan benar!\n');
  } else {
    console.log(`\n🚨 Ada ${failed} endpoint yang bermasalah. Cek log di atas.\n`);
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error('❌ Error tidak terduga:', err.message);
  process.exit(1);
});
