'use strict';

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (!error) return next();

  const errors = error.details.map((d) => ({
    field: d.path.join('.'),
    message: d.message.replace(/['"]/g, ''),
  }));

  return res.status(400).json({ success: false, message: 'Validasi gagal.', errors });
};

module.exports = validate;
