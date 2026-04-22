'use strict';

const { Country, Recipe } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { paginate, paginationMeta } = require('../utils/paginate');

exports.getAll = async (req, res, next) => {
  try {
    const countries = await Country.findAll({ order: [['name', 'ASC']] });
    return success(res, countries, 'Semua negara');
  } catch (err) { next(err); }
};

exports.getRecipesByCountry = async (req, res, next) => {
  try {
    const country = await Country.findOne({ where: { code: req.params.code.toUpperCase() } });
    if (!country) return error(res, 'Negara tidak ditemukan.', 404);
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await Recipe.findAndCountAll({
      where: { country_id: country.id, status: 'published' }, limit, offset,
    });
    return success(res, rows, `Resep dari ${country.name}`, 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, flag_emoji, continent } = req.body;
    if (!name || !code) return error(res, 'Nama dan kode negara wajib diisi.', 400);
    const country = await Country.create({ name, code: code.toUpperCase(), flag_emoji, continent });
    return success(res, country, 'Negara berhasil ditambahkan.', 201);
  } catch (err) { next(err); }
};
