'use strict';

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  me,
  getAllUsers,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  logoutAll,
} = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { loginRateLimiter } = require('../middleware/rateLimiter');

router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.post('/refresh', refresh);           // dapat access token baru via refresh token cookie
router.post('/logout', logout);             // logout device ini
router.post('/logout-all', authenticate, logoutAll); // logout semua device (perlu login)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', authenticate, me);
router.get('/users', authenticate, authorize('admin'), getAllUsers);

module.exports = router;