'use strict';

const validate = (schema) => (req, res, next) => {
  // Parse JSON strings dari FormData sebelum validasi
  const body = { ...req.body };
  ['ingredients', 'steps', 'tags'].forEach(key => {
    if (typeof body[key] === 'string') {
      try { body[key] = JSON.parse(body[key]); } catch { /* biarkan as-is */ }
    }
  });

  const { error } = schema.validate(body, { abortEarly: false });
  if (!error) return next();

  const errors = error.details.map((d) => ({
    field: d.path.join('.'),
    message: d.message.replace(/['"]/g, ''),
  }));

  return res.status(400).json({ success: false, message: 'Validasi gagal.', errors });
};

module.exports = validate;
