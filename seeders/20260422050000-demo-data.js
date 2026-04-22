'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    // ── 1. Categories ──────────────────────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { name: 'Masakan Indonesia', slug: 'masakan-indonesia', icon: '🇮🇩', description: 'Resep masakan khas Indonesia' },
      { name: 'Masakan Asia', slug: 'masakan-asia', icon: '🥢', description: 'Resep dari berbagai negara Asia' },
      { name: 'Dessert & Kue', slug: 'dessert-kue', icon: '🍰', description: 'Kue, dessert, dan camilan manis' },
      { name: 'Minuman', slug: 'minuman', icon: '🥤', description: 'Minuman segar dan hangat' },
    ], {});

    // ── 2. Countries ───────────────────────────────────────────────
    await queryInterface.bulkInsert('countries', [
      { name: 'Indonesia', code: 'ID', flag_emoji: '🇮🇩', continent: 'Asia' },
      { name: 'Jepang', code: 'JP', flag_emoji: '🇯🇵', continent: 'Asia' },
      { name: 'Thailand', code: 'TH', flag_emoji: '🇹🇭', continent: 'Asia' },
      { name: 'Italia', code: 'IT', flag_emoji: '🇮🇹', continent: 'Eropa' },
    ], {});

    // Ambil ID countries
    const [countries] = await queryInterface.sequelize.query(
      `SELECT id, code FROM countries WHERE code IN ('ID','JP','TH','IT')`
    );
    const countryMap = {};
    countries.forEach(c => { countryMap[c.code] = c.id; });

    // ── 3. Regions ─────────────────────────────────────────────────
    await queryInterface.bulkInsert('regions', [
      { name: 'Jawa Barat', slug: 'jawa-barat', country_id: countryMap['ID'], description: 'Masakan khas Sunda' },
      { name: 'Sumatera Barat', slug: 'sumatera-barat', country_id: countryMap['ID'], description: 'Masakan Minang yang kaya rempah' },
      { name: 'Jawa Tengah', slug: 'jawa-tengah', country_id: countryMap['ID'], description: 'Masakan khas Jawa Tengah' },
      { name: 'Bali', slug: 'bali', country_id: countryMap['ID'], description: 'Masakan khas Bali' },
    ], {});

    // Ambil ID regions & categories
    const [regions] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM regions WHERE slug IN ('sumatera-barat','jawa-barat','jawa-tengah','bali')`
    );
    const regionMap = {};
    regions.forEach(r => { regionMap[r.slug] = r.id; });

    const [cats] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM categories WHERE slug IN ('masakan-indonesia','masakan-asia','dessert-kue','minuman')`
    );
    const catMap = {};
    cats.forEach(c => { catMap[c.slug] = c.id; });

    // ── 4. Users ───────────────────────────────────────────────────
    const password = await bcrypt.hash('Admin123', 12);
    const userPassword = await bcrypt.hash('User1234', 12);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin ResepPedia',
        email: 'admin@reseppedia.com',
        password,
        role: 'admin',
        bio: 'Admin ResepPedia',
        is_verified: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Chef Budi',
        email: 'budi@reseppedia.com',
        password: userPassword,
        role: 'contributor',
        bio: 'Pecinta masakan Indonesia sejati',
        location: 'Jakarta',
        is_verified: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});

    const [users] = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('admin@reseppedia.com','budi@reseppedia.com')`
    );
    const userMap = {};
    users.forEach(u => { userMap[u.email] = u.id; });

    const authorId = userMap['budi@reseppedia.com'];

    // ── 5. Recipes ─────────────────────────────────────────────────
    await queryInterface.bulkInsert('recipes', [
      {
        title: 'Rendang Daging Sapi',
        slug: 'rendang-daging-sapi',
        description: 'Rendang adalah masakan daging sapi yang dimasak dengan santan dan bumbu rempah khas Minangkabau. Rasanya kaya, gurih, dan sedikit pedas.',
        author_id: authorId,
        category_id: catMap['masakan-indonesia'],
        region_id: regionMap['sumatera-barat'],
        country_id: countryMap['ID'],
        prep_time: 30,
        cook_time: 180,
        servings: 6,
        difficulty: 'sedang',
        cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Rendang.jpg/1200px-Rendang.jpg',
        status: 'published',
        views_count: 1250,
        rating_avg: 4.80,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Nasi Goreng Spesial',
        slug: 'nasi-goreng-spesial',
        description: 'Nasi goreng adalah hidangan nasi yang digoreng dengan bumbu kecap, bawang, dan telur. Mudah dibuat dan selalu lezat.',
        author_id: authorId,
        category_id: catMap['masakan-indonesia'],
        region_id: regionMap['jawa-tengah'],
        country_id: countryMap['ID'],
        prep_time: 10,
        cook_time: 15,
        servings: 2,
        difficulty: 'mudah',
        cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Nasi_goreng_ikan_asin.jpg/1200px-Nasi_goreng_ikan_asin.jpg',
        status: 'published',
        views_count: 2100,
        rating_avg: 4.50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Gado-Gado Jakarta',
        slug: 'gado-gado-jakarta',
        description: 'Gado-gado adalah salad sayuran rebus dengan saus kacang yang kaya rasa. Hidangan sehat dan mengenyangkan khas Jakarta.',
        author_id: authorId,
        category_id: catMap['masakan-indonesia'],
        region_id: regionMap['jawa-barat'],
        country_id: countryMap['ID'],
        prep_time: 20,
        cook_time: 20,
        servings: 4,
        difficulty: 'mudah',
        cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Gado_gado_betawi.jpg/1200px-Gado_gado_betawi.jpg',
        status: 'published',
        views_count: 890,
        rating_avg: 4.30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Ayam Betutu Bali',
        slug: 'ayam-betutu-bali',
        description: 'Ayam betutu adalah masakan ayam khas Bali yang dibumbui dengan base genep dan dimasak perlahan hingga bumbu meresap sempurna.',
        author_id: authorId,
        category_id: catMap['masakan-indonesia'],
        region_id: regionMap['bali'],
        country_id: countryMap['ID'],
        prep_time: 45,
        cook_time: 240,
        servings: 4,
        difficulty: 'sulit',
        cover_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ayam_betutu.jpg/1200px-Ayam_betutu.jpg',
        status: 'published',
        views_count: 670,
        rating_avg: 4.70,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});

    // Ambil ID recipes
    const [recipes] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM recipes WHERE slug IN ('rendang-daging-sapi','nasi-goreng-spesial','gado-gado-jakarta','ayam-betutu-bali')`
    );
    const recipeMap = {};
    recipes.forEach(r => { recipeMap[r.slug] = r.id; });

    // ── 6. Ingredients ─────────────────────────────────────────────
    await queryInterface.bulkInsert('ingredients', [
      // Rendang
      { recipe_id: recipeMap['rendang-daging-sapi'], name: 'Daging sapi', amount: 1000, unit: 'gram', notes: 'potong kotak' },
      { recipe_id: recipeMap['rendang-daging-sapi'], name: 'Santan kental', amount: 400, unit: 'ml', notes: null },
      { recipe_id: recipeMap['rendang-daging-sapi'], name: 'Cabai merah', amount: 15, unit: 'buah', notes: null },
      { recipe_id: recipeMap['rendang-daging-sapi'], name: 'Bawang merah', amount: 10, unit: 'siung', notes: null },
      { recipe_id: recipeMap['rendang-daging-sapi'], name: 'Bawang putih', amount: 5, unit: 'siung', notes: null },
      // Nasi Goreng
      { recipe_id: recipeMap['nasi-goreng-spesial'], name: 'Nasi putih', amount: 2, unit: 'piring', notes: 'nasi dingin' },
      { recipe_id: recipeMap['nasi-goreng-spesial'], name: 'Telur ayam', amount: 2, unit: 'butir', notes: null },
      { recipe_id: recipeMap['nasi-goreng-spesial'], name: 'Kecap manis', amount: 2, unit: 'sdm', notes: null },
      { recipe_id: recipeMap['nasi-goreng-spesial'], name: 'Bawang putih', amount: 3, unit: 'siung', notes: 'cincang' },
      // Gado-gado
      { recipe_id: recipeMap['gado-gado-jakarta'], name: 'Kacang tanah', amount: 200, unit: 'gram', notes: 'goreng' },
      { recipe_id: recipeMap['gado-gado-jakarta'], name: 'Tahu', amount: 4, unit: 'potong', notes: 'goreng' },
      { recipe_id: recipeMap['gado-gado-jakarta'], name: 'Tempe', amount: 4, unit: 'potong', notes: 'goreng' },
      { recipe_id: recipeMap['gado-gado-jakarta'], name: 'Kangkung', amount: 100, unit: 'gram', notes: 'rebus' },
      // Ayam Betutu
      { recipe_id: recipeMap['ayam-betutu-bali'], name: 'Ayam kampung', amount: 1, unit: 'ekor', notes: 'utuh' },
      { recipe_id: recipeMap['ayam-betutu-bali'], name: 'Bumbu base genep', amount: 200, unit: 'gram', notes: null },
      { recipe_id: recipeMap['ayam-betutu-bali'], name: 'Daun salam', amount: 5, unit: 'lembar', notes: null },
      { recipe_id: recipeMap['ayam-betutu-bali'], name: 'Serai', amount: 2, unit: 'batang', notes: 'memarkan' },
    ], {});

    // ── 7. Steps ───────────────────────────────────────────────────
    await queryInterface.bulkInsert('steps', [
      // Rendang
      { recipe_id: recipeMap['rendang-daging-sapi'], step_number: 1, instruction: 'Haluskan semua bumbu: cabai merah, bawang merah, bawang putih, jahe, lengkuas, dan kunyit.', duration_minutes: 10 },
      { recipe_id: recipeMap['rendang-daging-sapi'], step_number: 2, instruction: 'Tumis bumbu halus hingga harum dan matang, sekitar 10 menit.', duration_minutes: 10 },
      { recipe_id: recipeMap['rendang-daging-sapi'], step_number: 3, instruction: 'Masukkan daging sapi, aduk rata dengan bumbu. Tuang santan kental.', duration_minutes: 5 },
      { recipe_id: recipeMap['rendang-daging-sapi'], step_number: 4, instruction: 'Masak dengan api kecil sambil terus diaduk hingga santan mengering dan daging berwarna coklat kehitaman, sekitar 3 jam.', duration_minutes: 180 },
      // Nasi Goreng
      { recipe_id: recipeMap['nasi-goreng-spesial'], step_number: 1, instruction: 'Panaskan minyak, tumis bawang putih dan bawang merah hingga harum.', duration_minutes: 3 },
      { recipe_id: recipeMap['nasi-goreng-spesial'], step_number: 2, instruction: 'Masukkan telur, orak-arik hingga setengah matang.', duration_minutes: 2 },
      { recipe_id: recipeMap['nasi-goreng-spesial'], step_number: 3, instruction: 'Masukkan nasi, aduk rata. Tambahkan kecap manis, garam, dan merica. Aduk hingga semua tercampur.', duration_minutes: 5 },
      // Gado-gado
      { recipe_id: recipeMap['gado-gado-jakarta'], step_number: 1, instruction: 'Rebus semua sayuran (kangkung, tauge, kacang panjang) hingga matang. Tiriskan.', duration_minutes: 10 },
      { recipe_id: recipeMap['gado-gado-jakarta'], step_number: 2, instruction: 'Buat saus kacang: haluskan kacang goreng, cabai, bawang putih, gula merah, dan garam. Tambahkan air asam jawa.', duration_minutes: 10 },
      { recipe_id: recipeMap['gado-gado-jakarta'], step_number: 3, instruction: 'Tata sayuran, tahu, tempe di piring. Siram dengan saus kacang. Sajikan dengan kerupuk.', duration_minutes: 5 },
      // Ayam Betutu
      { recipe_id: recipeMap['ayam-betutu-bali'], step_number: 1, instruction: 'Lumuri ayam dengan bumbu base genep hingga merata, termasuk bagian dalam rongga ayam.', duration_minutes: 15 },
      { recipe_id: recipeMap['ayam-betutu-bali'], step_number: 2, instruction: 'Masukkan daun salam dan serai ke dalam rongga ayam. Bungkus dengan daun pisang.', duration_minutes: 10 },
      { recipe_id: recipeMap['ayam-betutu-bali'], step_number: 3, instruction: 'Kukus ayam selama 2 jam hingga matang dan bumbu meresap sempurna.', duration_minutes: 120 },
      { recipe_id: recipeMap['ayam-betutu-bali'], step_number: 4, instruction: 'Panggang sebentar di oven 200°C selama 20 menit untuk mendapatkan warna kecoklatan.', duration_minutes: 20 },
    ], {});

    // ── 8. Tags ────────────────────────────────────────────────────
    await queryInterface.bulkInsert('tags', [
      { name: 'Pedas', slug: 'pedas' },
      { name: 'Gurih', slug: 'gurih' },
      { name: 'Tradisional', slug: 'tradisional' },
      { name: 'Mudah', slug: 'mudah' },
    ], {});

    const [tags] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM tags WHERE slug IN ('pedas','gurih','tradisional','mudah')`
    );
    const tagMap = {};
    tags.forEach(t => { tagMap[t.slug] = t.id; });

    await queryInterface.bulkInsert('recipe_tags', [
      { recipe_id: recipeMap['rendang-daging-sapi'], tag_id: tagMap['pedas'] },
      { recipe_id: recipeMap['rendang-daging-sapi'], tag_id: tagMap['tradisional'] },
      { recipe_id: recipeMap['nasi-goreng-spesial'], tag_id: tagMap['mudah'] },
      { recipe_id: recipeMap['nasi-goreng-spesial'], tag_id: tagMap['gurih'] },
      { recipe_id: recipeMap['gado-gado-jakarta'], tag_id: tagMap['tradisional'] },
      { recipe_id: recipeMap['ayam-betutu-bali'], tag_id: tagMap['pedas'] },
      { recipe_id: recipeMap['ayam-betutu-bali'], tag_id: tagMap['tradisional'] },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('recipe_tags', null, {});
    await queryInterface.bulkDelete('tags', null, {});
    await queryInterface.bulkDelete('steps', null, {});
    await queryInterface.bulkDelete('ingredients', null, {});
    await queryInterface.bulkDelete('recipes', null, {});
    await queryInterface.bulkDelete('regions', null, {});
    await queryInterface.bulkDelete('countries', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', { email: { [require('sequelize').Op.in]: ['admin@reseppedia.com', 'budi@reseppedia.com'] } }, {});
  },
};
