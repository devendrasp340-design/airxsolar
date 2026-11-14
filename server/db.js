const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'airxsolar.db');

// Ensure the directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Compatibility helpers so better-sqlite3 idioms work seamlessly on node:sqlite
db.pragma = (pragmaStr) => {
  db.exec(`PRAGMA ${pragmaStr}`);
};

db.transaction = (fn) => {
  return (...args) => {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (err) {
      try {
        db.exec('ROLLBACK');
      } catch (_) {
        // ignore rollback failure if transaction is already closed
      }
      throw err;
    }
  };
};

// Normalize JS undefined/boolean values for node:sqlite parameter binding
function normalizeParam(val) {
  if (val === undefined) return null;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return val;
}

const origPrepare = db.prepare.bind(db);
db.prepare = (sql) => {
  const stmt = origPrepare(sql);
  const origRun = stmt.run.bind(stmt);
  const origGet = stmt.get.bind(stmt);
  const origAll = stmt.all.bind(stmt);

  stmt.run = (...args) => origRun(...args.map(normalizeParam));
  stmt.get = (...args) => origGet(...args.map(normalizeParam));
  stmt.all = (...args) => origAll(...args.map(normalizeParam));
  return stmt;
};

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------------------------------------------------------------------------
// Create tables
// ---------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    full_name     TEXT    NOT NULL,
    role          TEXT    NOT NULL CHECK(role IN ('owner','sales','content')),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    brand           TEXT    NOT NULL,
    model           TEXT    NOT NULL,
    product_name    TEXT    NOT NULL,
    type            TEXT    DEFAULT 'Split Units',
    capacity_kw     REAL,
    price_aud       INTEGER NOT NULL,
    page_title_seo  TEXT,
    image_path      TEXT,
    image2_path     TEXT,
    image3_path     TEXT,
    image4_path     TEXT,
    image5_path     TEXT,
    is_active       BOOLEAN DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name          TEXT    NOT NULL,
    phone              TEXT    NOT NULL,
    suburb             TEXT,
    product_or_service TEXT,
    source_page        TEXT,
    floor_plan_url     TEXT,
    status             TEXT    DEFAULT 'New' CHECK(status IN ('New','Contacted','Quoted','Won','Lost')),
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS offers (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NOT NULL,
    description   TEXT,
    price_display TEXT,
    image_url     TEXT,
    is_active     BOOLEAN DEFAULT 1,
    starts_at     DATETIME,
    ends_at       DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blogs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL,
    slug            TEXT    UNIQUE NOT NULL,
    content         TEXT    NOT NULL,
    excerpt         TEXT,
    featured_image  TEXT,
    youtube_url     TEXT,
    is_published    BOOLEAN DEFAULT 0,
    author_id       INTEGER REFERENCES users(id),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
