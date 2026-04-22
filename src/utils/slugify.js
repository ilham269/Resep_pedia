'use strict';

const makeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Tambah suffix random agar slug unik
const uniqueSlug = (text) => `${makeSlug(text)}-${Date.now().toString(36)}`;

module.exports = { makeSlug, uniqueSlug };
