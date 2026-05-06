'use strict';

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origin tidak diizinkan.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // wajib agar cookie bisa dikirim lintas origin
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser()); // baca cookie dari req.cookies
app.disable('x-powered-by');
app.disable('x-powered-by');

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/recipes',    require('./routes/recipes'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/regions',    require('./routes/regions'));
app.use('/api/countries',  require('./routes/countries'));
app.use('/api/tags',       require('./routes/tags'));
app.use('/api/admin',      require('./routes/admin'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan.' });
});

// Global error handler
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  console.error('[ERROR]', err.message);
  if (isDev) console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(isDev && { stack: err.stack }),
  });
});

module.exports = app;