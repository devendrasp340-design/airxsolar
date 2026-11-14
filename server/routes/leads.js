const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Allowed floor plan file types
const ALLOWED_FLOORPLAN_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/rtf': '.rtf',
  'text/rtf': '.rtf',
};
const ALLOWED_FLOORPLAN_EXT = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.rtf'];

const floorPlanStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'floorplans');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname || '').toLowerCase();
    const ext = ALLOWED_FLOORPLAN_MIME[file.mimetype] || (ALLOWED_FLOORPLAN_EXT.includes(rawExt) ? rawExt : '');
    cb(null, `${uuidv4()}${ext}`);
  },
});

const uploadFloorPlan = multer({
  storage: floorPlanStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (ALLOWED_FLOORPLAN_MIME[file.mimetype] || ALLOWED_FLOORPLAN_EXT.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: jpg, png, pdf, doc, docx, rtf'), false);
    }
  },
});

/**
 * Dispatch non-blocking lead notification log / optional webhook
 */
function notifyNewLead(lead) {
  console.log('[LEAD ALERT]', JSON.stringify({
    event: 'lead_created',
    id: lead.id,
    full_name: lead.full_name,
    phone: lead.phone,
    suburb: lead.suburb,
    product_or_service: lead.product_or_service,
    source_page: lead.source_page,
    created_at: new Date().toISOString(),
  }));

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl && typeof fetch === 'function') {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'lead_created', lead }),
    }).catch((err) => {
      console.error('Lead webhook dispatch failed:', err.message);
    });
  }
}

/**
 * POST /api/leads/upload
 * Public floor plan upload for QuoteModal (max 10MB)
 */
router.post('/upload', (req, res) => {
  uploadFloorPlan.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/floorplans/${req.file.filename}`;
    res.status(201).json({
      message: 'Floor plan uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  });
});

/**
 * POST /api/leads
 * Create a new lead (public)
 */
router.post(
  '/',
  [
    body('full_name')
      .trim()
      .notEmpty().withMessage('Full name is required')
      .isLength({ max: 200 }).withMessage('Name too long'),
    body('phone')
      .trim()
      .customSanitizer((v) => String(v || '').replace(/\s+/g, '').replace(/^\+614/, '04'))
      .notEmpty().withMessage('Phone is required')
      .matches(/^04\d{8}$/).withMessage('Phone must be a valid Australian mobile number (04XX XXX XXX)'),
    body('suburb')
      .optional()
      .trim()
      .isLength({ max: 200 }),
    body('product_or_service')
      .optional()
      .trim()
      .isLength({ max: 500 }),
    body('source_page')
      .optional()
      .trim()
      .isLength({ max: 500 }),
    body('floor_plan_url')
      .optional()
      .trim()
      .isLength({ max: 1000 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, phone, suburb, product_or_service, source_page, floor_plan_url } = req.body;

    try {
      const stmt = db.prepare(`
        INSERT INTO leads (full_name, phone, suburb, product_or_service, source_page, floor_plan_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(full_name, phone, suburb || null, product_or_service || null, source_page || null, floor_plan_url || null);

      notifyNewLead({
        id: result.lastInsertRowid,
        full_name,
        phone,
        suburb: suburb || null,
        product_or_service: product_or_service || null,
        source_page: source_page || null,
        floor_plan_url: floor_plan_url || null,
      });

      res.status(201).json({
        message: 'Lead submitted successfully',
        id: result.lastInsertRowid,
      });
    } catch (err) {
      console.error('Error creating lead:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
