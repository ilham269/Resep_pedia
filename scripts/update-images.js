'use strict';

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Gambar dari Unsplash & sumber lain yang reliable (no hotlink protection)
const IMAGE_MAP = {
  'Karedok':         'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'Soto Bandung':    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
  'Nasi Timbel':     'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
  'Pepes Ikan Mas':  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'Lotek':           'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'Mie Kocok Bandung': 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80',
  'Surabi Oncom':    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
  'Colenak':         'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
  'Rendang Daging Sapi': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
  'Nasi Goreng Spesial': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
  'Gado-Gado Jakarta': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'Ayam Betutu Bali': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
};

async function main() {
  const config = require('../src/config/config')[process.env.NODE_ENV || 'development'];
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host, dialect: config.dialect, logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected\n');

    for (const [title, url] of Object.entries(IMAGE_MAP)) {
      const [result] = await sequelize.query(
        `UPDATE recipes SET cover_image_url = ? WHERE title = ?`,
        { replacements: [url, title] }
      );
      if (result.affectedRows > 0) {
        console.log(`✅ Updated: ${title}`);
      } else {
        console.log(`⏭️  Not found: ${title}`);
      }
    }

    console.log('\n🎉 Semua gambar berhasil diupdate!');
    await sequelize.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sequelize.close();
  }
}

main();
