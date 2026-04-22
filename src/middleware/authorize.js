'use strict';

// Middleware untuk cek role — pakai setelah authenticate
// Contoh: authorize('admin') atau authorize('admin', 'user')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Kamu tidak punya izin untuk aksi ini.',
      });
    }
    next();
  };
};

module.exports = authorize;
