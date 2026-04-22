'use strict';

const success = (res, data, message = 'Berhasil', statusCode = 200, pagination = null) => {
  const payload = { success: true, message, data };
  if (pagination) payload.pagination = pagination;
  return res.status(statusCode).json(payload);
};

const error = (res, message = 'Terjadi kesalahan', statusCode = 400, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

module.exports = { success, error };
