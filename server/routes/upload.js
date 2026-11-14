const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Allowed file types
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/rtf': '.rtf',
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: jpg, png, webp, pdf, doc, docx, rtf'), false);
  }
};

// Storage for product images → public/uploads/
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Storage for floor plans → uploads/floorplans/
const floorPlanStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'floorplans');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

const uploadFloorPlan = multer({
  storage: floorPlanStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

/**
 * POST /api/admin/upload
 * Upload a file (image or floor plan)
 * Query param ?type=floorplan for floor plans, default is image
 */
router.post('/', (req, res) => {
  const uploadType = req.query.type;

  const handler = uploadType === 'floorplan'
    ? uploadFloorPlan.single('file')
    : uploadImage.single('file');

  handler(req, res, (err) => {
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

    // Build the public URL path
    let fileUrl;
    if (uploadType === 'floorplan') {
      fileUrl = `/uploads/floorplans/${req.file.filename}`;
    } else {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    res.status(201).json({
      message: 'File uploaded successfully',
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

module.exports = router;
