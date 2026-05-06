'use strict';

const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// ─── Whitelist MIME type yang diizinkan ───────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── Magic bytes tiap format ──────────────────────────────────────────────────
// Cek isi biner file aslinya, bukan cuma MIME type yang bisa dipalsuin
const MAGIC_BYTES = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },               // JPEG
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4e, 0x47] },         // PNG
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },         // WEBP (RIFF header)
];

/**
 * Cek magic bytes buffer — return mime string jika cocok, null jika tidak
 */
function detectMimeFromBuffer(buffer) {
  for (const { mime, bytes } of MAGIC_BYTES) {
    const match = bytes.every((byte, i) => buffer[i] === byte);
    if (match) return mime;
  }
  return null;
}

// ─── Multer: simpan di memory dulu, validasi MIME ────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Layer 1: cek MIME type dari header request
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      Object.assign(new Error('Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.'), {
        status: 400,
      }),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // max 1 file per request
  },
});

// ─── Middleware validasi magic bytes (jalankan SETELAH multer) ────────────────
// Dipasang sebagai middleware terpisah setelah upload.single() / upload.fields()
const validateImageBuffer = (req, res, next) => {
  // Kalau tidak ada file, skip (mungkin field opsional)
  if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
    return next();
  }

  // Kumpulkan semua file yang diupload
  const files = req.file
    ? [req.file]
    : Object.values(req.files).flat();

  for (const file of files) {
    if (!file.buffer || file.buffer.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'File tidak valid atau kosong.',
      });
    }

    // Layer 2: cek magic bytes — ini yang tidak bisa dipalsuin
    const detectedMime = detectMimeFromBuffer(file.buffer);

    if (!detectedMime) {
      return res.status(400).json({
        success: false,
        message: 'Isi file tidak sesuai format gambar yang diizinkan.',
      });
    }

    // Layer 3: MIME type dari header harus sama dengan magic bytes
    // Mencegah: kirim file exe tapi ngaku image/jpeg
    if (detectedMime !== file.mimetype) {
      return res.status(400).json({
        success: false,
        message: 'File terdeteksi tidak sesuai dengan tipe yang diklaim.',
      });
    }

    // WebP tambahan: pastikan ada "WEBP" signature di byte 8-11
    if (detectedMime === 'image/webp') {
      const webpSig = file.buffer.slice(8, 12).toString('ascii');
      if (webpSig !== 'WEBP') {
        return res.status(400).json({
          success: false,
          message: 'File WebP tidak valid.',
        });
      }
    }
  }

  next();
};

// ─── Upload ke Cloudinary dari buffer ────────────────────────────────────────
const uploadToCloudinary = (buffer, folder = 'reseppedia') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'webp'], // double-check di Cloudinary juga
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

module.exports = {
  upload,
  validateImageBuffer,
  uploadToCloudinary,
};