'use strict';

// In-memory rate limiter — cukup untuk single-instance server
// Untuk multi-instance/production, ganti dengan Redis-based limiter
const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 menit
const MAX_ATTEMPTS = 10;           // max 10 percobaan per window

// Bersihkan entri lama setiap 15 menit agar memory tidak bocor
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of attempts.entries()) {
    if (now - data.firstAttempt > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}, WINDOW_MS);

const loginRateLimiter = (req, res, next) => {
  // Key berdasarkan IP + email agar lebih granular
  const ip = req.ip || req.connection.remoteAddress;
  const email = (req.body.email || '').toLowerCase();
  const key = `${ip}:${email}`;

  const now = Date.now();
  const record = attempts.get(key);

  if (!record) {
    attempts.set(key, { count: 1, firstAttempt: now });
    return next();
  }

  // Reset window jika sudah lewat
  if (now - record.firstAttempt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttempt: now });
    return next();
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - record.firstAttempt)) / 1000 / 60);
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan login. Coba lagi dalam ${retryAfter} menit.`,
    });
  }

  record.count += 1;
  next();
};

// Reset counter setelah login sukses
const resetLoginAttempts = (ip, email) => {
  const key = `${ip}:${email.toLowerCase()}`;
  attempts.delete(key);
};

module.exports = { loginRateLimiter, resetLoginAttempts };
