'use strict';

require('dotenv').config();
const https = require('https');
const { Sequelize } = require('sequelize');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error('❌ YOUTUBE_API_KEY belum diisi di .env');
  console.log('\nCara mendapatkan API key:');
  console.log('1. Buka https://console.cloud.google.com');
  console.log('2. Buat project baru atau pilih yang ada');
  console.log('3. Klik "Enable APIs and Services"');
  console.log('4. Cari "YouTube Data API v3" → Enable');
  console.log('5. Klik "Credentials" → "Create Credentials" → "API Key"');
  console.log('6. Copy API key → paste ke .env YOUTUBE_API_KEY=\n');
  process.exit(1);
}

// ── Fetch video ID dari YouTube API ─────────────────────────────────────────
const searchYoutube = (query) => {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=1&relevanceLanguage=id&regionCode=ID&key=${YOUTUBE_API_KEY}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message));
            return;
          }
          const item = json.items?.[0];
          if (item) {
            resolve({
              videoId: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails?.medium?.url,
            });
          } else {
            resolve(null);
          }
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
};

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const config = require('../src/config/config')[process.env.NODE_ENV || 'development'];
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host, dialect: config.dialect, logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Ambil semua resep
    const [recipes] = await sequelize.query(
      `SELECT id, title FROM recipes ORDER BY id ASC`
    );

    console.log(`📋 Total resep: ${recipes.length}\n`);

    let updated = 0;
    let failed = 0;

    for (const recipe of recipes) {
      const query = `resep ${recipe.title} cara memasak`;
      process.stdout.write(`🔍 Searching: "${recipe.title}"... `);

      try {
        const result = await searchYoutube(query);

        if (result) {
          const embedUrl = `https://www.youtube.com/embed/${result.videoId}`;
          await sequelize.query(
            `UPDATE recipes SET youtube_url = ? WHERE id = ?`,
            { replacements: [embedUrl, recipe.id] }
          );
          console.log(`✅ ${result.title.substring(0, 50)}...`);
          updated++;
        } else {
          console.log('⚠️  Tidak ditemukan');
          failed++;
        }

        // Delay 200ms antar request agar tidak kena rate limit
        await new Promise(r => setTimeout(r, 200));

      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        failed++;

        // Kalau quota habis, stop
        if (err.message.includes('quota')) {
          console.log('\n⚠️  YouTube API quota habis. Coba lagi besok.');
          break;
        }
      }
    }

    console.log(`\n📊 Hasil:`);
    console.log(`  ✅ Updated : ${updated}`);
    console.log(`  ❌ Failed  : ${failed}`);
    console.log('\n🎉 Selesai!');

    await sequelize.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
}

main();
