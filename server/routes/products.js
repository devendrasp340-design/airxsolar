const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * GET /api/products
 * List products with optional filters and sorting
 */
router.get('/', (req, res) => {
  try {
    const { brand, capacity_min, capacity_max, price_min, price_max, sort, type, search } = req.query;

    let sql = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];

    if (brand) {
      sql += ' AND brand = ?';
      params.push(brand);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (capacity_min) {
      sql += ' AND capacity_kw >= ?';
      params.push(parseFloat(capacity_min));
    }

    if (capacity_max) {
      sql += ' AND capacity_kw <= ?';
      params.push(parseFloat(capacity_max));
    }

    if (price_min) {
      sql += ' AND price_aud >= ?';
      params.push(parseInt(price_min, 10));
    }

    if (price_max) {
      sql += ' AND price_aud <= ?';
      params.push(parseInt(price_max, 10));
    }

    if (search) {
      sql += ' AND (product_name LIKE ? OR brand LIKE ? OR model LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY price_aud ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY price_aud DESC';
        break;
      case 'capacity_asc':
        sql += ' ORDER BY capacity_kw ASC';
        break;
      case 'capacity_desc':
        sql += ' ORDER BY capacity_kw DESC';
        break;
      case 'brand_asc':
        sql += ' ORDER BY brand ASC, price_aud ASC';
        break;
      default:
        sql += ' ORDER BY price_aud ASC';
    }

    const products = db.prepare(sql).all(...params);

    // Also return available brands for filter UI
    const brands = db.prepare('SELECT DISTINCT brand FROM products WHERE is_active = 1 ORDER BY brand ASC').all();

    res.json({
      products,
      brands: brands.map(b => b.brand),
      total: products.length,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/products/:id
 * Get a single product
 */
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
