/**
 * seed.js — Database seeding script
 *
 * Reads ../products_seed.json and seeds the database with:
 *  - 65 products
 *  - Default admin user
 *  - One sample offer
 *
 * Usage: node seed.js
 */

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const db = require('./db');

function seed() {
  console.log('🌱 Starting database seed...\n');

  // -----------------------------------------------------------------------
  // 1. Seed default admin user
  // -----------------------------------------------------------------------
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@airxsolar.com.au');

  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync('AirX2024!', 12);
    db.prepare(`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin@airxsolar.com.au', passwordHash, 'AirX Admin', 'owner');
    console.log('✅ Admin user created: admin@airxsolar.com.au');
  } else {
    console.log('ℹ️  Admin user already exists, skipping.');
  }

  // -----------------------------------------------------------------------
  // 2. Seed products from products_seed.json
  // -----------------------------------------------------------------------
  const seedPath = path.join(__dirname, '..', 'products_seed.json');

  if (!fs.existsSync(seedPath)) {
    console.error('❌ products_seed.json not found at:', seedPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(seedPath, 'utf-8');
  const products = JSON.parse(raw);

  // Check if products already seeded
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

  if (productCount === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (brand, model, product_name, type, capacity_kw, price_aud, page_title_seo, image_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
      for (const p of items) {
        insertProduct.run(
          p['Brand'],
          p['Model'],
          p['Product Name'],
          p['Type'] || 'Split Units',
          p['Capacity (kW)'] || null,
          p['Price (AUD)'],
          p['Page Title (SEO)'] || null,
          p['New Image Path'] || null
        );
      }
    });

    insertMany(products);
    console.log(`✅ ${products.length} products seeded.`);
  } else {
    console.log(`ℹ️  Products already seeded (${productCount} found), skipping.`);
  }

  // -----------------------------------------------------------------------
  // 3. Seed sample offer
  // -----------------------------------------------------------------------
  const offerCount = db.prepare('SELECT COUNT(*) as count FROM offers').get().count;

  if (offerCount === 0) {
    db.prepare(`
      INSERT INTO offers (title, description, price_display, image_url, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'Daikin 10.0 kW + AirTouch 5',
      'Premium Daikin 10.0 kW reverse-cycle ducted system with AirTouch 5 smart controller. Fully installed by licensed technicians.',
      '$9,500 + GST Fully Installed',
      '/ducted-banner.jpeg',
      1
    );
    console.log('✅ Sample offer seeded.');
  } else {
    console.log('ℹ️  Offers already exist, skipping.');
  }

  console.log('\n🎉 Seed complete!');
}

seed();
