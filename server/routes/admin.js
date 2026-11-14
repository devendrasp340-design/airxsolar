const express = require('express');
const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);

// =========================================================================
// LEADS
// =========================================================================

/**
 * GET /api/admin/leads
 * List all leads (owner, sales only)
 */
router.get('/leads', authorize('owner', 'sales'), (req, res) => {
  try {
    const { status, sort } = req.query;
    let sql = 'SELECT * FROM leads';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += sort === 'oldest' ? ' ORDER BY created_at ASC' : ' ORDER BY created_at DESC';

    const leads = db.prepare(sql).all(...params);
    res.json({ leads, total: leads.length });
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/leads/export
 * CSV export (owner only)
 */
router.get('/leads/export', authorize('owner'), (req, res) => {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();

    const headers = ['id', 'full_name', 'phone', 'suburb', 'product_or_service', 'source_page', 'floor_plan_url', 'status', 'created_at'];
    const csvRows = [headers.join(',')];

    for (const lead of leads) {
      const row = headers.map(h => {
        const val = lead[h] != null ? String(lead[h]) : '';
        // Escape double quotes and wrap in quotes if needed
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(row.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
    res.send(csvRows.join('\n'));
  } catch (err) {
    console.error('Error exporting leads:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/leads/:id
 * Update lead status (owner, sales)
 */
router.patch(
  '/leads/:id',
  authorize('owner', 'sales'),
  [
    param('id').isInt(),
    body('status')
      .isIn(['New', 'Contacted', 'Quoted', 'Won', 'Lost'])
      .withMessage('Invalid status value'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(req.body.status, req.params.id);

      const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
      res.json(updated);
    } catch (err) {
      console.error('Error updating lead:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// =========================================================================
// PRODUCTS
// =========================================================================

/**
 * GET /api/admin/products
 */
router.get('/products', authorize('owner', 'content'), (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    res.json({ products, total: products.length });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/products
 */
router.post(
  '/products',
  authorize('owner', 'content'),
  [
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('product_name').trim().notEmpty().withMessage('Product name is required'),
    body('price_aud').isInt({ min: 0 }).withMessage('Price must be a positive integer'),
    body('type').optional().trim(),
    body('capacity_kw').optional().isFloat({ min: 0 }),
    body('page_title_seo').optional().trim(),
    body('image_path').optional().trim(),
    body('image2_path').optional().trim(),
    body('image3_path').optional().trim(),
    body('image4_path').optional().trim(),
    body('image5_path').optional().trim(),
    body('is_active').optional().isBoolean(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        brand, model, product_name, type, capacity_kw, price_aud,
        page_title_seo, image_path, image2_path, image3_path,
        image4_path, image5_path, is_active,
      } = req.body;

      const stmt = db.prepare(`
        INSERT INTO products (brand, model, product_name, type, capacity_kw, price_aud,
          page_title_seo, image_path, image2_path, image3_path, image4_path, image5_path, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        brand, model, product_name,
        type || 'Split Units',
        capacity_kw || null,
        price_aud,
        page_title_seo || null,
        image_path || null,
        image2_path || null,
        image3_path || null,
        image4_path || null,
        image5_path || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1
      );

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(product);
    } catch (err) {
      console.error('Error creating product:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/admin/products/:id
 */
router.put(
  '/products/:id',
  authorize('owner', 'content'),
  [
    param('id').isInt(),
    body('brand').optional().trim().notEmpty(),
    body('model').optional().trim().notEmpty(),
    body('product_name').optional().trim().notEmpty(),
    body('price_aud').optional().isInt({ min: 0 }),
    body('type').optional().trim(),
    body('capacity_kw').optional().isFloat({ min: 0 }),
    body('page_title_seo').optional().trim(),
    body('image_path').optional().trim(),
    body('image2_path').optional().trim(),
    body('image3_path').optional().trim(),
    body('image4_path').optional().trim(),
    body('image5_path').optional().trim(),
    body('is_active').optional().isBoolean(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const fields = [
        'brand', 'model', 'product_name', 'type', 'capacity_kw', 'price_aud',
        'page_title_seo', 'image_path', 'image2_path', 'image3_path',
        'image4_path', 'image5_path', 'is_active',
      ];

      const updates = [];
      const values = [];

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = ?`);
          if (field === 'is_active') {
            values.push(req.body[field] ? 1 : 0);
          } else if (field === 'starts_at' || field === 'ends_at') {
            values.push(req.body[field] || null);
          } else {
            values.push(req.body[field]);
          }
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(req.params.id);
      db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
      res.json(product);
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/admin/products/:id
 */
router.delete('/products/:id', authorize('owner', 'content'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =========================================================================
// OFFERS
// =========================================================================

/**
 * GET /api/admin/offers
 */
router.get('/offers', authorize('owner', 'content'), (req, res) => {
  try {
    const offers = db.prepare('SELECT * FROM offers ORDER BY created_at DESC').all();
    res.json({ offers, total: offers.length });
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/offers
 */
router.post(
  '/offers',
  authorize('owner', 'content'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('price_display').optional().trim(),
    body('image_url').optional().trim(),
    body('is_active').optional().isBoolean(),
    body('starts_at').optional({ values: 'falsy' }).isISO8601(),
    body('ends_at').optional({ values: 'falsy' }).isISO8601(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, price_display, image_url, is_active, starts_at, ends_at } = req.body;

      const stmt = db.prepare(`
        INSERT INTO offers (title, description, price_display, image_url, is_active, starts_at, ends_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        title,
        description || null,
        price_display || null,
        image_url || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        starts_at || null,
        ends_at || null
      );

      const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(offer);
    } catch (err) {
      console.error('Error creating offer:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/admin/offers/:id
 */
router.put(
  '/offers/:id',
  authorize('owner', 'content'),
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('price_display').optional().trim(),
    body('image_url').optional().trim(),
    body('is_active').optional().isBoolean(),
    body('starts_at').optional({ values: 'falsy' }).isISO8601(),
    body('ends_at').optional({ values: 'falsy' }).isISO8601(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      const fields = ['title', 'description', 'price_display', 'image_url', 'is_active', 'starts_at', 'ends_at'];
      const updates = [];
      const values = [];

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = ?`);
          if (field === 'is_active') {
            values.push(req.body[field] ? 1 : 0);
          } else if (field === 'starts_at' || field === 'ends_at') {
            values.push(req.body[field] || null);
          } else {
            values.push(req.body[field]);
          }
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(req.params.id);
      db.prepare(`UPDATE offers SET ${updates.join(', ')} WHERE id = ?`).run(...values);

      const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
      res.json(offer);
    } catch (err) {
      console.error('Error updating offer:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/admin/offers/:id
 */
router.delete('/offers/:id', authorize('owner', 'content'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    db.prepare('DELETE FROM offers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    console.error('Error deleting offer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =========================================================================
// BLOGS
// =========================================================================

/**
 * GET /api/admin/blogs
 */
router.get('/blogs', authorize('owner', 'content'), (req, res) => {
  try {
    const blogs = db.prepare(`
      SELECT b.*, u.full_name AS author_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      ORDER BY b.created_at DESC
    `).all();
    res.json({ blogs, total: blogs.length });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/blogs
 */
router.post(
  '/blogs',
  authorize('owner', 'content'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('slug').trim().notEmpty().withMessage('Slug is required')
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-friendly (lowercase, hyphens)'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('excerpt').optional().trim(),
    body('featured_image').optional().trim(),
    body('youtube_url').optional().trim(),
    body('is_published').optional().isBoolean(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, slug, content, excerpt, featured_image, youtube_url, is_published } = req.body;

      // Check slug uniqueness
      const existing = db.prepare('SELECT id FROM blogs WHERE slug = ?').get(slug);
      if (existing) {
        return res.status(409).json({ error: 'A blog with this slug already exists' });
      }

      const stmt = db.prepare(`
        INSERT INTO blogs (title, slug, content, excerpt, featured_image, youtube_url, is_published, author_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        title, slug, content,
        excerpt || null,
        featured_image || null,
        youtube_url || null,
        is_published ? 1 : 0,
        req.user.id
      );

      const blog = db.prepare('SELECT * FROM blogs WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(blog);
    } catch (err) {
      console.error('Error creating blog:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/admin/blogs/:id
 */
router.put(
  '/blogs/:id',
  authorize('owner', 'content'),
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty(),
    body('slug').optional().trim()
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-friendly'),
    body('content').optional().trim().notEmpty(),
    body('excerpt').optional().trim(),
    body('featured_image').optional().trim(),
    body('youtube_url').optional().trim(),
    body('is_published').optional().isBoolean(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = db.prepare('SELECT * FROM blogs WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      // If slug is changing, check uniqueness
      if (req.body.slug && req.body.slug !== existing.slug) {
        const dup = db.prepare('SELECT id FROM blogs WHERE slug = ? AND id != ?').get(req.body.slug, req.params.id);
        if (dup) {
          return res.status(409).json({ error: 'A blog with this slug already exists' });
        }
      }

      const fields = ['title', 'slug', 'content', 'excerpt', 'featured_image', 'youtube_url', 'is_published'];
      const updates = ['updated_at = CURRENT_TIMESTAMP'];
      const values = [];

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = ?`);
          if (field === 'is_published') {
            values.push(req.body[field] ? 1 : 0);
          } else {
            values.push(req.body[field]);
          }
        }
      }

      values.push(req.params.id);
      db.prepare(`UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`).run(...values);

      const blog = db.prepare('SELECT * FROM blogs WHERE id = ?').get(req.params.id);
      res.json(blog);
    } catch (err) {
      console.error('Error updating blog:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/admin/blogs/:id
 */
router.delete('/blogs/:id', authorize('owner', 'content'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM blogs WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    db.prepare('DELETE FROM blogs WHERE id = ?').run(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =========================================================================
// USERS (owner only)
// =========================================================================

/**
 * GET /api/admin/users
 */
router.get('/users', authorize('owner'), (req, res) => {
  try {
    const users = db.prepare('SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json({ users, total: users.length });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/users
 */
router.post(
  '/users',
  authorize('owner'),
  [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('role').isIn(['owner', 'sales', 'content']).withMessage('Role must be owner, sales, or content'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, full_name, role } = req.body;

      // Check email uniqueness
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return res.status(409).json({ error: 'A user with this email already exists' });
      }

      const password_hash = bcrypt.hashSync(password, 12);

      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES (?, ?, ?, ?)
      `);

      const result = stmt.run(email, password_hash, full_name, role);

      const user = db.prepare('SELECT id, email, full_name, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(user);
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/admin/users/:id
 */
router.put(
  '/users/:id',
  authorize('owner'),
  [
    param('id').isInt(),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 8 }),
    body('full_name').optional().trim().notEmpty(),
    body('role').optional().isIn(['owner', 'sales', 'content']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If email is changing, check uniqueness
      if (req.body.email && req.body.email !== existing.email) {
        const dup = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(req.body.email, req.params.id);
        if (dup) {
          return res.status(409).json({ error: 'A user with this email already exists' });
        }
      }

      const updates = [];
      const values = [];

      if (req.body.email !== undefined) {
        updates.push('email = ?');
        values.push(req.body.email);
      }
      if (req.body.full_name !== undefined) {
        updates.push('full_name = ?');
        values.push(req.body.full_name);
      }
      if (req.body.role !== undefined) {
        updates.push('role = ?');
        values.push(req.body.role);
      }
      if (req.body.password !== undefined) {
        updates.push('password_hash = ?');
        values.push(bcrypt.hashSync(req.body.password, 12));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(req.params.id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

      const user = db.prepare('SELECT id, email, full_name, role, created_at FROM users WHERE id = ?').get(req.params.id);
      res.json(user);
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', authorize('owner'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (existing.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
