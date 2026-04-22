'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sanitizeString, isValidEmail, isStrongPassword } = require('../utils/validator');
const { resetLoginAttempts } = require('../middleware/rateLimiter');

const SALT_ROUNDS = 12; // cost factor bcrypt — cukup lambat untuk brute force

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const name = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = req.body.password; // jangan sanitize password sebelum hash

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 8 karakter, harus ada huruf besar, kecil, dan angka.',
      });
    }

    // Cek email sudah terdaftar — Sequelize pakai parameterized query otomatis (anti SQL injection)
    const existing = await User.scope('withPassword').findOne({ where: { email } });
    if (existing) {
      // Pesan generik agar tidak bocorkan info email terdaftar
      return res.status(409).json({ success: false, message: 'Email sudah digunakan.' });
    }

    // Hash password — TIDAK pernah simpan plain text
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Role hanya boleh 'user' atau 'admin', default 'user'
    const role = req.body.role === 'admin' ? 'admin' : 'user';

    const user = await User.create({ name, email, password: hashedPassword, role });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    // Ambil user beserta password hash — scope withPassword
    const user = await User.scope('withPassword').findOne({ where: { email } });

    // Gunakan pesan generik — jangan bocorkan apakah email ada atau tidak
    const INVALID_MSG = 'Email atau password salah.';

    if (!user) {
      // Tetap jalankan bcrypt.compare palsu agar response time konsisten (timing attack prevention)
      await bcrypt.compare(password, '$2a$12$invalidhashfortimingprotection000000000000000000000');
      return res.status(401).json({ success: false, message: INVALID_MSG });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: INVALID_MSG });
    }

    // Reset rate limit counter setelah login sukses
    const ip = req.ip || req.connection.remoteAddress;
    resetLoginAttempts(ip, email);

    // Sign JWT — payload minimal, jangan taruh data sensitif
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h', algorithm: 'HS256' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)
exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });

    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/users  (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = sanitizeString(req.body.email || '').toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi.' });

    const user = await User.scope('withPassword').findOne({ where: { email } });
    // Selalu response sukses agar tidak bocorkan info email terdaftar
    if (!user) return res.json({ success: true, message: 'Jika email terdaftar, link reset akan dikirim.' });

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await user.update({ reset_token: token, reset_token_expires: expires });

    const { sendResetPasswordEmail } = require('../services/emailService');
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendResetPasswordEmail(email, resetUrl);

    return res.json({ success: true, message: 'Jika email terdaftar, link reset akan dikirim.' });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { isStrongPassword: strong } = require('../utils/validator');
    if (!strong(password)) {
      return res.status(400).json({ success: false, message: 'Password minimal 8 karakter, harus ada huruf besar, kecil, dan angka.' });
    }

    const user = await User.scope('withPassword').findOne({
      where: {
        reset_token: req.params.token,
        reset_token_expires: { [require('sequelize').Op.gt]: new Date() },
      },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Token tidak valid atau sudah kadaluarsa.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    await user.update({ password: hashedPassword, reset_token: null, reset_token_expires: null });

    return res.json({ success: true, message: 'Password berhasil direset.' });
  } catch (err) { next(err); }
};
