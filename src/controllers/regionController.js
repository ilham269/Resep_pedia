'use strict';

const { Region, Country, Recipe } = require('../models');
const { makeSlug } = require('../utils/slugify');
const { success, error } = require('../utils/apiResponse');
const { paginate, paginationMeta } = require('../utils/paginate');

exports.getAll = async (req, res, next) => {
  try {
    const where = req.query.country_id ? { country_id: req.query.country_id } : {};
    const regions = await Region.findAll({ where, include: [{ model: Country, as: 'country' }] });
    return success(res, regions, 'Semua daerah');
  } catch (err) { next(err); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const region = await Region.findOne({ where: { slug: req.params.slug }, include: [{ model: Country, as: 'country' }] });
    if (!region) return error(res, 'Daerah tidak ditemukan.', 404);
    return success(res, region, 'Detail daerah');
  } catch (err) { next(err); }
};

exports.getRecipesByRegion = async (req, res, next) => {
  try {
    const region = await Region.findOne({ where: { slug: req.params.slug } });
    if (!region) return error(res, 'Daerah tidak ditemukan.', 404);
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await Recipe.findAndCountAll({
      where: { region_id: region.id, status: 'published' }, limit, offset,
    });
    return success(res, rows, `Resep dari ${region.name}`, 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, country_id, thumbnail_url, description } = req.body;
    if (!name) return error(res, 'Nama daerah wajib diisi.', 400);
    const slug = makeSlug(name);
    const region = await Region.create({ name, slug, country_id, thumbnail_url, description });
    return success(res, region, 'Daerah berhasil dibuat.', 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const region = await Region.findByPk(req.params.id);
    if (!region) return error(res, 'Daerah tidak ditemukan.', 404);
    const { name, country_id, thumbnail_url, description } = req.body;
    await region.update({ name: name || region.name, slug: name ? makeSlug(name) : region.slug, country_id, thumbnail_url, description });
    return success(res, region, 'Daerah berhasil diupdate.');
  } catch (err) { next(err); }
};
