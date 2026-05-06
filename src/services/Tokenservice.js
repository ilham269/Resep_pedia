'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../models');

const ACCESS_TOKEN_EXPIRES = '15m';   // singkat — hanya 15 menit
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam ms

/**
 * Generate access token JWT (short-lived, 15 menit)
 */
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES, algorithm: 'HS256' }
  );
}

/**
 * Buat refresh token baru, simpan ke DB, return token string-nya
 */
async function createRefreshToken(userId) {
  // Hapus semua refresh token lama milik user ini (optional: batasi 1 session)
  // Kalau mau multi-device, hapus baris ini
  await RefreshToken.destroy({ where: { user_id: userId } });

  const token = crypto.randomBytes(64).toString('hex'); // 128 char, aman
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS);

  await RefreshToken.create({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });

  return token;
}

/**
 * Verifikasi refresh token dari DB
 * Return: row RefreshToken jika valid, null jika tidak
 */
async function verifyRefreshToken(token) {
  if (!token) return null;

  const record = await RefreshToken.findOne({ where: { token } });
  if (!record) return null;
  if (record.isExpired()) {
    await record.destroy(); // bersihkan token expired dari DB
    return null;
  }

  return record;
}

/**
 * Hapus refresh token (logout)
 */
async function revokeRefreshToken(token) {
  await RefreshToken.destroy({ where: { token } });
}

/**
 * Hapus semua refresh token user (logout dari semua device)
 */
async function revokeAllRefreshTokens(userId) {
  await RefreshToken.destroy({ where: { user_id: userId } });
}

module.exports = {
  generateAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
};