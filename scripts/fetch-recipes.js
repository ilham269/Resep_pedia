'use strict';

require('dotenv').config();
const https = require('https');

// ── Helper: fetch JSON dari URL ──────────────────────────────────────────────
const fetchJSON = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(e); }
    });
  }).on('error', reject);
});

// ── Resep Jawa Barat (Sunda) — hardcoded karena TheMealDB tidak ada filter daerah ──
// Data ini berdasarkan resep masakan Sunda yang autentik
const JABAR_RECIPES = [
  {
    title: 'Karedok',
    description: 'Karedok adalah salad sayuran mentah khas Sunda yang disiram dengan saus kacang berbumbu kencur. Berbeda dengan gado-gado yang menggunakan sayuran rebus, karedok menggunakan sayuran segar mentah.',
    cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Karedok.jpg/1200px-Karedok.jpg',
    prep_time: 20, cook_time: 10, servings: 4, difficulty: 'mudah',
    ingredients: [
      { name: 'Kacang panjang', amount: 100, unit: 'gram', notes: 'potong 2cm' },
      { name: 'Tauge', amount: 100, unit: 'gram', notes: 'segar' },
      { name: 'Kol', amount: 100, unit: 'gram', notes: 'iris tipis' },
      { name: 'Timun', amount: 1, unit: 'buah', notes: 'potong dadu' },
      { name: 'Terong ungu kecil', amount: 2, unit: 'buah', notes: 'iris tipis' },
      { name: 'Kacang tanah', amount: 200, unit: 'gram', notes: 'goreng' },
      { name: 'Kencur', amount: 3, unit: 'cm', notes: null },
      { name: 'Cabai merah', amount: 5, unit: 'buah', notes: null },
      { name: 'Bawang putih', amount: 3, unit: 'siung', notes: null },
      { name: 'Gula merah', amount: 2, unit: 'sdm', notes: null },
      { name: 'Terasi', amount: 1, unit: 'sdt', notes: 'bakar' },
      { name: 'Air jeruk limau', amount: 2, unit: 'sdm', notes: null },
    ],
    steps: [
      { step_number: 1, instruction: 'Haluskan kacang tanah goreng bersama kencur, cabai, bawang putih, terasi, dan gula merah hingga menjadi saus kacang yang kental.', duration_minutes: 10 },
      { step_number: 2, instruction: 'Tambahkan air jeruk limau dan garam ke dalam saus kacang, aduk rata. Sesuaikan rasa.', duration_minutes: 2 },
      { step_number: 3, instruction: 'Tata semua sayuran mentah (kacang panjang, tauge, kol, timun, terong) di atas piring saji.', duration_minutes: 5 },
      { step_number: 4, instruction: 'Siram dengan saus kacang di atasnya. Sajikan segera agar sayuran tetap segar dan renyah.', duration_minutes: 2 },
    ],
    tags: ['sunda', 'vegetarian', 'segar', 'jawa-barat'],
  },
  {
    title: 'Soto Bandung',
    description: 'Soto Bandung adalah soto khas Kota Bandung dengan kuah bening yang segar, berisi daging sapi, lobak putih, dan kedelai goreng. Rasanya ringan namun gurih dengan aroma daun bawang yang khas.',
    cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Soto_Bandung.jpg/1200px-Soto_Bandung.jpg',
    prep_time: 30, cook_time: 90, servings: 6, difficulty: 'sedang',
    ingredients: [
      { name: 'Daging sapi', amount: 500, unit: 'gram', notes: 'potong dadu' },
      { name: 'Lobak putih', amount: 200, unit: 'gram', notes: 'potong dadu' },
      { name: 'Kedelai', amount: 100, unit: 'gram', notes: 'goreng kering' },
      { name: 'Bawang putih', amount: 6, unit: 'siung', notes: 'haluskan' },
      { name: 'Jahe', amount: 3, unit: 'cm', notes: 'memarkan' },
      { name: 'Serai', amount: 2, unit: 'batang', notes: 'memarkan' },
      { name: 'Daun salam', amount: 3, unit: 'lembar', notes: null },
      { name: 'Daun bawang', amount: 3, unit: 'batang', notes: 'iris halus' },
      { name: 'Bawang goreng', amount: 3, unit: 'sdm', notes: 'untuk taburan' },
    ],
    steps: [
      { step_number: 1, instruction: 'Rebus daging sapi dengan air hingga mendidih, buang air rebusan pertama untuk menghilangkan kotoran.', duration_minutes: 10 },
      { step_number: 2, instruction: 'Rebus kembali daging dengan air bersih, masukkan bawang putih, jahe, serai, dan daun salam. Masak hingga daging empuk sekitar 60 menit.', duration_minutes: 60 },
      { step_number: 3, instruction: 'Masukkan lobak putih ke dalam kuah, masak hingga lobak empuk sekitar 15 menit.', duration_minutes: 15 },
      { step_number: 4, instruction: 'Tambahkan garam dan merica secukupnya. Koreksi rasa.', duration_minutes: 2 },
      { step_number: 5, instruction: 'Sajikan dalam mangkuk, taburi kedelai goreng, daun bawang, dan bawang goreng. Lengkapi dengan sambal dan perasan jeruk nipis.', duration_minutes: 5 },
    ],
    tags: ['sunda', 'soto', 'berkuah', 'jawa-barat', 'bandung'],
  },
  {
    title: 'Nasi Timbel',
    description: 'Nasi Timbel adalah nasi yang dibungkus daun pisang khas Sunda. Disajikan dengan lauk pauk lengkap seperti ayam goreng, tempe, tahu, ikan asin, dan sambal terasi. Aroma daun pisang membuat nasi terasa lebih harum.',
    cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Nasi_timbel.jpg/1200px-Nasi_timbel.jpg',
    prep_time: 20, cook_time: 40, servings: 4, difficulty: 'mudah',
    ingredients: [
      { name: 'Nasi putih panas', amount: 4, unit: 'piring', notes: null },
      { name: 'Daun pisang', amount: 4, unit: 'lembar', notes: 'bersihkan' },
      { name: 'Ayam kampung', amount: 1, unit: 'ekor', notes: 'potong 8 bagian' },
      { name: 'Tempe', amount: 200, unit: 'gram', notes: 'potong, goreng' },
      { name: 'Tahu putih', amount: 4, unit: 'buah', notes: 'goreng' },
      { name: 'Ikan asin', amount: 100, unit: 'gram', notes: 'goreng kering' },
      { name: 'Lalapan', amount: 1, unit: 'porsi', notes: 'timun, kemangi, kol' },
      { name: 'Sambal terasi', amount: 1, unit: 'porsi', notes: null },
    ],
    steps: [
      { step_number: 1, instruction: 'Layukan daun pisang di atas api kecil sebentar agar tidak mudah sobek saat dibungkus.', duration_minutes: 3 },
      { step_number: 2, instruction: 'Ambil nasi panas, bentuk lonjong dan bungkus rapat dengan daun pisang. Sematkan dengan lidi atau tusuk gigi.', duration_minutes: 10 },
      { step_number: 3, instruction: 'Goreng ayam yang sudah dibumbui (bawang putih, kunyit, ketumbar, garam) hingga kecoklatan.', duration_minutes: 25 },
      { step_number: 4, instruction: 'Sajikan nasi timbel bersama ayam goreng, tempe, tahu, ikan asin, lalapan segar, dan sambal terasi.', duration_minutes: 5 },
    ],
    tags: ['sunda', 'nasi', 'tradisional', 'jawa-barat'],
  },
  {
    title: 'Pepes Ikan Mas',
    description: 'Pepes ikan mas adalah ikan mas yang dibumbui rempah-rempah khas Sunda lalu dibungkus daun pisang dan dikukus atau dibakar. Aromanya harum dan rasanya gurih dengan sedikit pedas.',
    cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Pepes_ikan.jpg/1200px-Pepes_ikan.jpg',
    prep_time: 30, cook_time: 45, servings: 4, difficulty: 'sedang',
    ingredients: [
      { name: 'Ikan mas', amount: 1, unit: 'kg', notes: 'bersihkan, beri irisan' },
      { name: 'Daun pisang', amount: 8, unit: 'lembar', notes: 'untuk membungkus' },
      { name: 'Tomat merah', amount: 3, unit: 'buah', notes: 'iris' },
      { name: 'Cabai merah', amount: 8, unit: 'buah', notes: null },
      { name: 'Bawang merah', amount: 8, unit: 'siung', notes: null },
      { name: 'Bawang putih', amount: 4, unit: 'siung', notes: null },
      { name: 'Kunyit', amount: 3, unit: 'cm', notes: null },
      { name: 'Jahe', amount: 2, unit: 'cm', notes: null },
      { name: 'Serai', amount: 2, unit: 'batang', notes: 'iris halus' },
      { name: 'Daun kemangi', amount: 1, unit: 'genggam', notes: null },
      { name: 'Daun salam', amount: 4, unit: 'lembar', notes: null },
    ],
    steps: [
      { step_number: 1, instruction: 'Haluskan bawang merah, bawang putih, cabai, kunyit, dan jahe. Tambahkan garam dan gula secukupnya.', duration_minutes: 10 },
      { step_number: 2, instruction: 'Lumuri ikan mas dengan bumbu halus hingga merata, termasuk bagian dalam perut ikan.', duration_minutes: 10 },
      { step_number: 3, instruction: 'Siapkan daun pisang, letakkan daun salam, irisan tomat, dan serai. Taruh ikan di atasnya, tambahkan daun kemangi.', duration_minutes: 5 },
      { step_number: 4, instruction: 'Bungkus rapat dengan daun pisang, sematkan dengan lidi. Kukus selama 30 menit hingga matang.', duration_minutes: 30 },
      { step_number: 5, instruction: 'Setelah dikukus, bakar sebentar di atas bara api atau teflon hingga daun pisang sedikit gosong untuk aroma yang lebih harum.', duration_minutes: 10 },
    ],
    tags: ['sunda', 'ikan', 'pepes', 'jawa-barat', 'dikukus'],
  },
  {
    title: 'Lotek',
    description: 'Lotek adalah hidangan sayuran rebus dengan saus kacang khas Sunda yang mirip gado-gado namun dengan bumbu yang lebih kaya kencur dan terasi. Biasanya disajikan dengan lontong atau nasi.',
    cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Lotek.jpg/1200px-Lotek.jpg',
    prep_time: 20, cook_time: 20, servings: 4, difficulty: 'mudah',
    ingredients: [
      { name: 'Kangkung', amount: 150, unit: 'gram', notes: 'rebus' },
      { name: 'Kacang panjang', amount: 100, unit: 'gram', notes: 'rebus, potong' },
      { name: 'Tauge', amount: 100, unit: 'gram', notes: 'rebus sebentar' },
      { name: 'Bayam', amount: 100, unit: 'gram', notes: 'rebus' },
      { name: 'Tahu goreng', amount: 4, unit: 'potong', notes: null },
      { name: 'Lontong', amount: 4, unit: 'potong', notes: null },
      { name: 'Kacang tanah', amount: 250, unit: 'gram', notes: 'goreng' },
      { name: 'Kencur', amount: 4, unit: 'cm', notes: null },
      { name: 'Cabai rawit', amount: 5, unit: 'buah', notes: 'sesuai selera' },
      { name: 'Bawang putih', amount: 3, unit: 'siung', notes: null },
      { name: 'Terasi', amount: 1, unit: 'sdt', notes: 'bakar' },
      { name: 'Gula merah', amount: 3, unit: 'sdm', notes: null },
    ],
    steps: [
      { step_number: 1, instruction: 'Rebus semua sayuran secara terpisah hingga matang namun masih sedikit renyah. Tiriskan.', duration_minutes: 15 },
      { step_number: 2, instruction: 'Ulek kacang tanah goreng bersama kencur, cabai rawit, bawang putih, terasi, dan gula merah hingga halus.', duration_minutes: 10 },
      { step_number: 3, instruction: 'Tambahkan air matang sedikit demi sedikit ke bumbu kacang hingga kekentalan yang diinginkan. Beri garam dan air asam jawa.', duration_minutes: 3 },
      { step_number: 4, instruction: 'Tata sayuran rebus, tahu goreng, dan lontong di piring. Siram dengan saus kacang. Taburi bawang goreng.', duration_minutes: 5 },
    ],
    tags: ['sunda', 'vegetarian', 'berkuah', 'jawa-barat'],
  },
  {
    title: 'Mie Kocok Bandung',
    description: 'Mie Kocok adalah mie khas Bandung dengan kuah kaldu sapi yang kental dan gurih, berisi mie kuning, kikil sapi, tauge, dan bakso. Dinamakan kocok karena mie dikocok dalam saringan sebelum disajikan.',
    cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Mie_kocok_bandung.jpg/1200px-Mie_kocok_bandung.jpg',
    prep_time: 30, cook_time: 120, servings: 6, difficulty: 'sulit',
    ingredients: [
      { name: 'Mie kuning basah', amount: 600, unit: 'gram', notes: null },
      { name: 'Kikil sapi', amount: 500, unit: 'gram', notes: 'rebus hingga empuk' },
      { name: 'Bakso sapi', amount: 300, unit: 'gram', notes: 'belah dua' },
      { name: 'Tauge', amount: 200, unit: 'gram', notes: 'seduh air panas' },
      { name: 'Tulang sapi', amount: 500, unit: 'gram', notes: 'untuk kaldu' },
      { name: 'Bawang putih', amount: 8, unit: 'siung', notes: 'haluskan' },
      { name: 'Jahe', amount: 4, unit: 'cm', notes: 'memarkan' },
      { name: 'Merica', amount: 1, unit: 'sdt', notes: null },
      { name: 'Daun bawang', amount: 4, unit: 'batang', notes: 'iris' },
      { name: 'Seledri', amount: 3, unit: 'batang', notes: 'iris' },
      { name: 'Bawang goreng', amount: 4, unit: 'sdm', notes: 'untuk taburan' },
    ],
    steps: [
      { step_number: 1, instruction: 'Rebus tulang sapi dengan air selama 2 jam untuk membuat kaldu yang kental. Buang buih yang muncul.', duration_minutes: 120 },
      { step_number: 2, instruction: 'Tumis bawang putih halus hingga harum, masukkan ke dalam kaldu. Tambahkan jahe, merica, garam, dan gula.', duration_minutes: 10 },
      { step_number: 3, instruction: 'Masukkan kikil yang sudah empuk dan bakso ke dalam kaldu. Masak 10 menit.', duration_minutes: 10 },
      { step_number: 4, instruction: 'Kocok mie dalam saringan dengan air panas beberapa kali hingga panas dan terurai.', duration_minutes: 3 },
      { step_number: 5, instruction: 'Taruh mie dalam mangkuk, tambahkan tauge, kikil, dan bakso. Siram dengan kuah panas. Taburi daun bawang, seledri, dan bawang goreng.', duration_minutes: 5 },
    ],
    tags: ['sunda', 'mie', 'berkuah', 'bandung', 'jawa-barat'],
  },
  {
    title: 'Surabi Oncom',
    description: 'Surabi adalah kue tradisional Sunda yang terbuat dari tepung beras dan santan, dimasak di atas tungku tanah liat. Versi gurih dengan topping oncom adalah yang paling populer di Jawa Barat.',
    cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Surabi.jpg/1200px-Surabi.jpg',
    prep_time: 60, cook_time: 30, servings: 10, difficulty: 'sedang',
    ingredients: [
      { name: 'Tepung beras', amount: 300, unit: 'gram', notes: null },
      { name: 'Santan', amount: 400, unit: 'ml', notes: 'dari 1 butir kelapa' },
      { name: 'Ragi instan', amount: 1, unit: 'sdt', notes: null },
      { name: 'Garam', amount: 1, unit: 'sdt', notes: null },
      { name: 'Oncom', amount: 200, unit: 'gram', notes: 'hancurkan' },
      { name: 'Bawang merah', amount: 5, unit: 'siung', notes: 'iris tipis' },
      { name: 'Cabai merah', amount: 3, unit: 'buah', notes: 'iris' },
      { name: 'Daun bawang', amount: 2, unit: 'batang', notes: 'iris' },
      { name: 'Kencur', amount: 2, unit: 'cm', notes: 'haluskan' },
    ],
    steps: [
      { step_number: 1, instruction: 'Campurkan tepung beras, santan hangat, ragi, dan garam. Aduk rata dan diamkan 45 menit hingga adonan mengembang.', duration_minutes: 45 },
      { step_number: 2, instruction: 'Tumis bawang merah, cabai, dan kencur hingga harum. Masukkan oncom yang sudah dihancurkan, tambahkan garam dan gula. Masak hingga matang.', duration_minutes: 10 },
      { step_number: 3, instruction: 'Panaskan cetakan surabi (atau teflon kecil) di atas api kecil. Olesi dengan sedikit minyak.', duration_minutes: 3 },
      { step_number: 4, instruction: 'Tuang adonan ke cetakan, beri topping oncom di atasnya. Tutup dan masak hingga matang dan berlubang-lubang di permukaan.', duration_minutes: 8 },
    ],
    tags: ['sunda', 'kue', 'tradisional', 'jawa-barat', 'sarapan'],
  },
  {
    title: 'Colenak',
    description: 'Colenak (dicocol enak) adalah makanan khas Bandung berupa tape singkong yang dibakar lalu disajikan dengan saus gula merah dan parutan kelapa. Nama uniknya berasal dari cara makannya yang dicocol.',
    cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Colenak.jpg/1200px-Colenak.jpg',
    prep_time: 10, cook_time: 20, servings: 4, difficulty: 'mudah',
    ingredients: [
      { name: 'Tape singkong', amount: 500, unit: 'gram', notes: 'pilih yang tidak terlalu asam' },
      { name: 'Gula merah', amount: 150, unit: 'gram', notes: 'serut halus' },
      { name: 'Kelapa parut', amount: 100, unit: 'gram', notes: 'kelapa muda' },
      { name: 'Santan', amount: 100, unit: 'ml', notes: null },
      { name: 'Daun pandan', amount: 2, unit: 'lembar', notes: null },
      { name: 'Garam', amount: 1, unit: 'sejumput', notes: null },
    ],
    steps: [
      { step_number: 1, instruction: 'Bakar tape singkong di atas bara api atau teflon hingga kecoklatan di kedua sisi. Sisihkan.', duration_minutes: 10 },
      { step_number: 2, instruction: 'Masak gula merah bersama santan, daun pandan, dan garam hingga mengental menjadi saus.', duration_minutes: 10 },
      { step_number: 3, instruction: 'Sajikan tape bakar di piring, siram dengan saus gula merah, dan taburi kelapa parut di atasnya.', duration_minutes: 3 },
    ],
    tags: ['sunda', 'dessert', 'manis', 'bandung', 'jawa-barat', 'tradisional'],
  },
];

// ── Main function ────────────────────────────────────────────────────────────
async function main() {
  const { Sequelize } = require('sequelize');
  const config = require('../src/config/config')[process.env.NODE_ENV || 'development'];

  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host, dialect: config.dialect, logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Ambil ID yang dibutuhkan
    const [[jabarRegion]] = await sequelize.query(`SELECT id FROM regions WHERE slug = 'jawa-barat' LIMIT 1`);
    const [[indonesia]] = await sequelize.query(`SELECT id FROM countries WHERE code = 'ID' LIMIT 1`);
    const [[kategori]] = await sequelize.query(`SELECT id FROM categories WHERE slug = 'masakan-indonesia' LIMIT 1`);
    const [[author]] = await sequelize.query(`SELECT id FROM users WHERE email = 'budi@reseppedia.com' LIMIT 1`);

    if (!jabarRegion) { console.error('❌ Region Jawa Barat tidak ditemukan. Jalankan seeder dulu.'); process.exit(1); }
    if (!author) { console.error('❌ User budi@reseppedia.com tidak ditemukan. Jalankan seeder dulu.'); process.exit(1); }

    console.log(`📍 Region ID: ${jabarRegion.id}`);
    console.log(`🇮🇩 Country ID: ${indonesia?.id}`);
    console.log(`📂 Category ID: ${kategori?.id}`);
    console.log(`👤 Author ID: ${author.id}\n`);

    let inserted = 0;

    for (const recipe of JABAR_RECIPES) {
      // Cek apakah sudah ada
      const [[existing]] = await sequelize.query(
        `SELECT id FROM recipes WHERE title = ? LIMIT 1`, { replacements: [recipe.title] }
      );
      if (existing) {
        console.log(`⏭️  Skip (sudah ada): ${recipe.title}`);
        continue;
      }

      const slug = recipe.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);

      // Insert recipe
      const [result] = await sequelize.query(`
        INSERT INTO recipes (title, slug, description, author_id, category_id, region_id, country_id,
          prep_time, cook_time, servings, difficulty, cover_image_url, status, views_count, rating_avg, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, 0.00, NOW(), NOW())
      `, {
        replacements: [
          recipe.title, slug, recipe.description, author.id,
          kategori?.id || null, jabarRegion.id, indonesia?.id || null,
          recipe.prep_time, recipe.cook_time, recipe.servings, recipe.difficulty,
          recipe.cover_image_url, Math.floor(Math.random() * 500) + 100,
        ],
      });

      const recipeId = result;

      // Insert ingredients
      for (const ing of recipe.ingredients) {
        await sequelize.query(`
          INSERT INTO ingredients (recipe_id, name, amount, unit, notes)
          VALUES (?, ?, ?, ?, ?)
        `, { replacements: [recipeId, ing.name, ing.amount || null, ing.unit || null, ing.notes || null] });
      }

      // Insert steps
      for (const step of recipe.steps) {
        await sequelize.query(`
          INSERT INTO steps (recipe_id, step_number, instruction, duration_minutes)
          VALUES (?, ?, ?, ?)
        `, { replacements: [recipeId, step.step_number, step.instruction, step.duration_minutes || null] });
      }

      // Insert tags
      for (const tagName of recipe.tags) {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
        // Upsert tag
        await sequelize.query(`
          INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)
        `, { replacements: [tagName, tagSlug] });

        const [[tag]] = await sequelize.query(`SELECT id FROM tags WHERE slug = ? LIMIT 1`, { replacements: [tagSlug] });
        if (tag) {
          await sequelize.query(`
            INSERT IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)
          `, { replacements: [recipeId, tag.id] });
        }
      }

      console.log(`✅ Inserted: ${recipe.title}`);
      inserted++;
    }

    console.log(`\n🎉 Selesai! ${inserted} resep Jawa Barat berhasil ditambahkan.`);
    await sequelize.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
}

main();
