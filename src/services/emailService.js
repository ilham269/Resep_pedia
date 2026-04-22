'use strict';

const nodemailer = require('nodemailer');

// Support Gmail atau SendGrid — tergantung env yang diisi
const createTransporter = () => {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    // Pakai Gmail (lebih mudah untuk development)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // App Password, bukan password Gmail biasa
      },
    });
  }

  // Fallback ke SendGrid / SMTP custom
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || 'apikey',
      pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY,
    },
  });
};

const sendResetPasswordEmail = async (to, resetUrl) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.GMAIL_USER || 'noreply@reseppedia.com',
    to,
    subject: 'Reset Password - ResepPedia',
    html: `
      <h2>Reset Password</h2>
      <p>Klik link berikut untuk reset password kamu (berlaku 1 jam):</p>
      <a href="${resetUrl}" style="background:#e74c3c;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Reset Password
      </a>
      <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
    `,
  });
};

module.exports = { sendResetPasswordEmail };
