const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');

// Import routes
const leadsRoutes = require('./routes/leads');
const productsRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------

// Helmet — security headers (relaxed CSP for dev)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Let the frontend handle CSP
}));

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://airxsolar.com.au',
    'https://www.airxsolar.com.au',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// ---------------------------------------------------------------------------
// CSRF protection
// ---------------------------------------------------------------------------
const CSRF_SECRET = process.env.CSRF_SECRET || 'airxsolar-csrf-secret-change-in-production';

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// CSRF token endpoint — frontend calls this to get a token
app.get('/api/csrf-token', (req, res) => {
  const token = generateToken(req, res);
  res.json({ csrfToken: token });
});

// Apply CSRF protection to state-changing requests only
app.use((req, res, next) => {
  // Skip CSRF for safe methods and for the CSRF token endpoint
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  // Skip CSRF in development for easier testing
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  doubleCsrfProtection(req, res, next);
});

// ---------------------------------------------------------------------------
// Static file serving
// ---------------------------------------------------------------------------

// Serve frontend build (public/ and client/dist/)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// Serve product images from the images/ directory at /images
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

// Public routes
app.use('/api/leads', leadsRoutes);
app.use('/api/products', productsRoutes);

// Public blog & offer routes
app.get('/api/offers', (req, res) => {
  try {
    const db = require('./db');
    const now = new Date().toISOString();
    const offers = db.prepare(`
      SELECT * FROM offers
      WHERE is_active = 1
        AND (starts_at IS NULL OR starts_at <= ?)
        AND (ends_at IS NULL OR ends_at >= ?)
      ORDER BY created_at DESC
    `).all(now, now);
    res.json({ offers, total: offers.length });
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blogs', (req, res) => {
  try {
    const db = require('./db');
    const blogs = db.prepare(`
      SELECT b.id, b.title, b.slug, b.excerpt, b.featured_image, b.youtube_url,
             b.is_published, b.author_id, b.created_at, b.updated_at,
             u.full_name AS author_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.is_published = 1
      ORDER BY b.created_at DESC
    `).all();
    res.json({ blogs, total: blogs.length });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blogs/:slug', (req, res) => {
  try {
    const db = require('./db');
    const blog = db.prepare(`
      SELECT b.*, u.full_name AS author_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.slug = ? AND b.is_published = 1
    `).get(req.params.slug);

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);

// Admin routes (JWT protected)
app.use('/api/admin', adminRoutes);

// Upload route (JWT protected)
app.use('/api/admin/upload', authenticate, uploadRoutes);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ---------------------------------------------------------------------------
// SPA fallback — serve index.html for client-side routing
// ---------------------------------------------------------------------------
app.get('*', (req, res, next) => {
  // Don't catch API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const publicIndex = path.join(__dirname, '..', 'public', 'index.html');
  const distIndex = path.join(__dirname, '..', 'client', 'dist', 'index.html');
  const indexPath = fs.existsSync(publicIndex) ? publicIndex : distIndex;

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ message: 'AirXSolar API is running. Frontend not built yet.' });
  }
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀 AirXSolar API server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS origins: localhost:3000, localhost:5173, airxsolar.com.au\n`);
});

module.exports = app;
