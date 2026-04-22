'use strict';

const { Category, Recipe } = require('../models');
const { makeSlug } = require('../utils/slugify');
const { success, error } = require('../utils/apiResponse');
const { paginate, paginationMeta } = require('../utils/paginate');

exports.getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Recipe, as: 'recipes', attributes: [] }],
      attributes: { include: [[require('sequelize').fn('COUNT', require('sequelize').col('recipes.id')), 'recipe_count']] },
      group: ['Category.id'],
    });
    return success(res, categories, 'Semua kategori');
  } catch (err) { next(err); }
};

exports.getRecipesByCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ where: { slug: req.params.slug } });
    if (!category) return error(res, 'Kategori tidak ditemukan.', 404);

    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await Recipe.findAndCountAll({
      where: { category_id: category.id, status: 'published' },
      limit, offset, order: [['createdAt', 'DESC']],
    });
    return success(res, rows, `Resep kategori ${category.name}`, 200, paginationMeta(count, page, limit));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) return error(res, 'Nama kategori wajib diisi.', 400);
    const slug = makeSlug(name);
    const category = await Category.create({ name, slug, icon, description });
    return success(res, category, 'Kategori berhasil dibuat.', 201);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return error(res, 'Kategori tidak ditemukan.', 404);
    const { name, icon, description } = req.body;
    await category.update({ name: name || category.name, slug: name ? makeSlug(name) : category.slug, icon, description });
    return success(res, category, 'Kategori berhasil diupdate.');
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return error(res, 'Kategori tidak ditemukan.', 404);
    await category.destroy();
    return success(res, null, 'Kategori berhasil dihapus.');
  } catch (err) { next(err); }
};
